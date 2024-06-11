# Proyecto de Subida de Archivos con React y Node.js

Este proyecto es un tutorial paso a paso para crear una aplicación de subida de archivos utilizando React en el frontend y Node.js en el backend, con la ayuda de la librería `multer` para manejar las subidas de archivos en el servidor. A continuación, se explica el funcionamiento de cada archivo del proyecto.

## Índice

1. [Backend](#backend)
   - [server/index.js](#serverindexjs)
   - [server/multer.js](#servermulterjs)
2. [Frontend](#frontend)
   - [client/App.jsx](#clientappjsx)
   - [client/Show.jsx](#clientshowjsx)
   - [client/Upload.jsx](#clientuploadjsx)
3. [Ejecución](#ejecución)

## Backend

### `server/index.js`

Este archivo configura el servidor utilizando Express, maneja los endpoints para subir y descargar archivos, y gestiona la autenticación simulada.

#### Código:

```js
import express from 'express';
import cors from 'cors';
import upload from './multer.js';
import fs from 'fs';

const app = express();
const port = 3010;

const isAuthMiddleware = (req, res, next) => {
    req.user = {_id: '122'};
    next();
};

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/upload', isAuthMiddleware, upload.single('file'), (req, res) => {
    res.json({
        fileName: req.fileName
    });
});

app.get("/uploads/:file", isAuthMiddleware, (req, res) => {
    const { file } = req.params;
    const userId = req.user._id;
    const filePath = `./uploads/${userId}/${file}`;
    if (!fs.existsSync(filePath)) {
        res.status(404).send("File not found");
        return;
    }
    res.sendFile(filePath, { root: "." });
});

app.get("/uploads", isAuthMiddleware, (req, res) => {
    const userId = req.user?._id;
    const path = `./uploads/${userId}`;
    if (!fs.existsSync(path)) {
        res.status(404).send("Directory not found");
        return;
    }
    const files = fs.readdirSync(path);
    res.json(files);
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
```

#### Explicación:

1. **Importaciones**: Se importan las librerías necesarias (`express`, `cors`, `multer`, `fs`).
2. **Middleware de Autenticación**: `isAuthMiddleware` simula la autenticación del usuario y asigna un ID de usuario ficticio a `req.user`.
3. **Configuraciones de Express**:
   - `cors()`: Habilita CORS para permitir peticiones de otros orígenes.
   - `express.json()` y `express.urlencoded()`: Middleware para parsear JSON y datos urlencoded.
4. **Endpoints**:
   - `POST /upload`: Sube un archivo utilizando `multer`.
   - `GET /uploads/:file`: Descarga un archivo específico del usuario autenticado.
   - `GET /uploads`: Lista todos los archivos subidos por el usuario autenticado.

### `server/multer.js`

Configura `multer` para manejar la subida de archivos, especificando dónde y cómo se guardarán.

#### Código:

```js
import multer from 'multer';
import fs from 'fs';

const PATH = './uploads/';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const userId = req.user?._id;
        if (!userId) return cb(new Error('User not found'));
        const path = `${PATH}${userId}`;
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
        }
        cb(null, path);
    },
    filename: function (req, file, cb) {
        const newFileName = req.body.fileName || file.originalname;
        const fileName = newFileName.split(' ').join('-');
        req.fileName = fileName;
        cb(null, fileName);
    }
});

const upload = multer({ storage: storage });
export default upload;
```

#### Explicación:

1. **Importaciones**: Se importan las librerías `multer` y `fs`.
2. **Configuración de `multer`**:
   - `destination`: Define la ruta de destino para los archivos subidos, creando directorios si no existen.
   - `filename`: Define el nombre del archivo, permitiendo la personalización del nombre del archivo subido.

## Frontend

### `client/App.jsx`

Componente principal de la aplicación React que gestiona la lista de archivos subidos y permite subir nuevos archivos.

#### Código:

```jsx
import Upload from "./Upload";
import Show from "./Show";
import './App.css';
import { useEffect, useState } from "react";

const API_URL = 'http://localhost:3010/uploads/';

function App() {
    const [uploadedFiles, setUploadedFiles] = useState([]);

    useEffect(() => {
        getFiles();
    }, []);

    async function getFiles() {
        const response = await fetch(API_URL);
        const data = await response.json();
        console.log("files", data);
        setUploadedFiles(data);
    }

    return (
        <div className="App">
            <Upload onUpload={getFiles} />
            <Show files={uploadedFiles} />
        </div>
    );
}

export default App;
```

#### Explicación:

1. **Importaciones**: Se importan los componentes `Upload` y `Show`, y se define el CSS.
2. **Estado y Efectos**:
   - `useState`: Define el estado `uploadedFiles` para almacenar la lista de archivos subidos.
   - `useEffect`: Llama a `getFiles` al montar el componente para obtener la lista de archivos.
3. **Funciones**:
   - `getFiles`: Hace una petición `GET` al servidor para obtener la lista de archivos subidos y actualiza el estado.

### `client/Show.jsx`

Componente que muestra la lista de archivos subidos y permite descargarlos o mostrarlos si son imágenes.

#### Código:

```jsx
import { useState } from 'react';

const API_URL = 'http://localhost:3010/uploads/';

const ShowUploadedFiles = ({ files }) => {
    const [selectedFile, setSelectedFile] = useState(null);

    async function getFile(fileName) {
        const url = `${API_URL}${fileName}`;
        const file = await fetch(url);
        const blob = await file.blob();
        const fileUrl = URL.createObjectURL(blob);
        if (blob.type.includes('image')) {
            setSelectedFile(fileUrl);
        } else {
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = fileName;
            link.click();
            URL.revokeObjectURL(fileUrl);
        }
    }

    return (
        <div>
            <h1>Archivos subidos</h1>
            <ul>
                {files.map(file => (
                    <li className="link" key={file} onClick={() => getFile(file)}>
                        <p href={file}>{file}</p>
                    </li>
                ))}
            </ul>
            {selectedFile && <img src={selectedFile} alt="Uploaded" />}
        </div>
    );
};

export default ShowUploadedFiles;
```

#### Explicación:

1. **Estado**:
   - `useState`: Define el estado `selectedFile` para almacenar el archivo seleccionado.
2. **Funciones**:
   - `getFile`: Descarga o muestra el archivo seleccionado. Si es una imagen, se muestra; si es otro tipo de archivo, se descarga.
3. **Renderizado**:
   - Muestra la lista de archivos subidos y maneja la selección de archivos para mostrarlos o descargarlos.

### `client/Upload.jsx`

Componente que permite al usuario seleccionar y subir un archivo al servidor.

#### Código:

```jsx
import { useState } from 'react';

const API_URL = 'http://localhost:3010/upload/';

function Upload({ onUpload }) {
    const [uploadFile, setUploadFile] = useState(null);
    const [fileName, setFileName] = useState("");

    async function upload(file) {
        const formData = new FormData();
        formData.append('fileName', fileName);
        formData.append('file', file);
        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        return data;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        const file = event.target.file.files[0];
        const data = await upload(file);
        console.log("respuesta del servidor:", data);
        if (data.error || !data.fileName) {
            return alert(data.error);
        }
        alert(`Archivo subido en la URL: ${API_URL}${data.fileName}`);
        onUpload();
    }

    function handleSelectFile(event) {
        const file = event.target.files[0];
        if (file.type.includes('image')) {
            setUploadFile(file);
        } else {
            setUploadFile(file.name);
        }
        setFileName(file.name);
    }

    function showUploadFile() {
        if (!uploadFile) {
            return <p>Selecione un archivo</p>;
        }
        if (typeof uploadFile === 'string') {
            return <p>Archivo seleccionado: <b>{uploadFile}</b></p>;
        }
        return <img src={URL.createObjectURL(uploadFile)} alt="Uploaded" />;
    }

    return (
        <>
            <h1>Subir archivo</h1>
            <div className="preview">
                {showUploadFile()}
            </div>
            <form action="/upload" method="post" onSubmit={handleSubmit}>
                <label htmlFor="file">Seleccione un archivo</label>
                <input type="file" name="file" onChange={handleSelectFile} />
                <label htmlFor="fileName">Nombre del archivo</label>
                <input type="text" name="fileName" value={fileName} onChange={e => setFileName(e.target.value)} />
                <button type="submit">Subir</button>
            </form>
        </>
    );
}

export default Upload;
```

#### Explicación:

1. **Estados**:
   - `uploadFile`: Almacena el archivo seleccionado para la vista previa.
   - `fileName`: Almacena el nombre del archivo.
2. **Funciones**:
   - `upload`: Sube el archivo al servidor utilizando `FormData`.
   - `handleSubmit`: Maneja el envío del formulario y llama a `upload`.
   - `handleSelectFile`: Actualiza los estados `uploadFile` y `fileName` al seleccionar un archivo.
   - `showUploadFile`: Muestra la vista previa del archivo seleccionado.
3. **Renderizado**:
   - Muestra un formulario para seleccionar y subir archivos, y una vista previa del archivo seleccionado.

---

## Ejecución

Con estos archivos, se puede crear una aplicación de subida de archivos con React y Node.js. Para ejecutar el proyecto, se deben instalar las dependencias y ejecutar el servidor y la aplicación React. 

1. **Instalación de dependencias**:

   ```bash
   cd server
   npm install
   cd ../client
   npm install
   ```

2. **Ejecución del servidor y la aplicación**:

   - **Servidor**:

     ```bash
     cd server
     npm run dev
     ```

   - **Aplicación**:

     ```bash
     cd client
     npm run dev
     ```

Con estos pasos, se podrá acceder a la aplicación en `http://localhost:5173` y subir archivos al servidor en `http://localhost:3010/uploads/`. Si se desea cambiar el puerto del servidor, se puede modificar en el archivo `server/index.js` y en los archivos de la aplicación React.

## Referencias
- [Multer | npm](https://www.npmjs.com/package/multer)
- [Multi-Form Data Uploads with React.js, Express, and Multer | medium](https://medium.com/@byte.talking/multi-form-data-uploads-with-react-js-express-and-multer-b19adb3c1de2)