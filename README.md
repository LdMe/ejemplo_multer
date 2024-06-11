# Proyecto de Subida de Archivos con React y Node.js



## Índice

1. [Introducción](#introducción)
2. [Backend](#backend)
   - [server/index.js](#serverindexjs)
   - [server/multer.js](#servermulterjs)
3. [Frontend](#frontend)
   - [client/App.jsx](#clientappjsx)
   - [client/Show.jsx](#clientshowjsx)
   - [client/Upload.jsx](#clientuploadjsx)
4. [Ejecución](#ejecución)

## Introducción
Este proyecto es una guía paso a paso para crear una aplicación de subida de archivos utilizando React en el frontend y Node.js en el backend, con la ayuda de la librería multer para manejar las subidas de archivos en el servidor. 

El objetivo principal es permitir a los usuarios subir archivos, listarlos y descargarlos, asegurando que solo puedan ver sus propios archivos. En caso de querer mostrar los archivos de todos los usuarios, se puede modificar el backend para permitirlo. También se podrían subir múltiples archivos a la vez, pero para simplificar el proyecto, se ha optado por subir un archivo a la vez.

 La aplicación incluye un middleware de autenticación falso para simular la autenticación del usuario, lo que permite adaptar fácilmente el sistema a casos reales de uso donde se requiera autenticación. Sin embargo, si no es necesario conocer los datos del usuario que sube el archivo, este middleware se puede eliminar.

## Backend

El backend, implementado con Node.js y Express, se encarga de manejar la lógica de subida y descarga de archivos, así como de la autenticación simulada. Utiliza multer para manejar las subidas de archivos y fs para gestionar el sistema de archivos.

### `server/index.js`

Este archivo configura el servidor utilizando Express. Maneja los endpoints para subir y descargar archivos, y gestiona la autenticación simulada mediante un middleware. Aquí se importan las librerías necesarias, se configuran los middlewares para el manejo de CORS y el parseo de JSON, y se definen los endpoints principales.

Aspectos clave:

1. Importaciones: Librerías necesarias para el servidor y manejo de archivos (*express*, *cors*, *multer*, *fs*).
2. Middleware de Autenticación: Simula la autenticación del usuario asignando un ID ficticio a req.user.
3. Configuraciones de Express:
    - *cors()*: Habilita CORS para permitir peticiones de otros orígenes.
    - *express.json()* y *express.urlencoded()*: Parseo de JSON y datos urlencoded.
4. Endpoints:
    - POST */upload*: Para subir un archivo.
    - GET */uploads/*:file: Para descargar un archivo específico.
    - GET */uploads*: Para listar todos los archivos subidos por el usuario.

#### Código:

```js
import express from 'express';
import cors from 'cors'; // librería para permitir peticiones de otros origenes
import upload from './multer.js'; // librería para subir archivos
import fs from 'fs'; // librería para manejar archivos

const app = express();
const port = 3010;

/**
 * Middleware falso para verificar se o usuário está autenticado y guardar los datos en req.user
 */
const isAuthMiddleware = (req, res, next) => {
    /*
    Acciones necesarias para autenticar el usuario (jwt, etc)
    */

    /*...*/
    
    req.user = {_id: '122'} // TODO: cambiar por el usuario real que se autentique
    next()
}


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Endpoint para subir archivos
 */
app.post('/upload', isAuthMiddleware, upload.single('file'), (req, res) => {
    res.json({ // devolvemos un json con el nombre del archivo subido
        fileName: req.fileName
    });
});

/**
 * Endpoint para obtener archivos subidos
 */
app.get("/uploads/:file",isAuthMiddleware, (req, res) => {
    const {  file } = req.params; // nombre del archivo en la ruta
    const userId  = req.user._id; // sacamos el usuario de la petición, después de pasar por el middleware isAuthMiddleware
    const filePath = `./uploads/${userId}/${file}`; // ruta donde se encuentra el archivo
    if (!fs.existsSync(filePath)) { // si el archivo no existe
        res.status(404).send("File not found"); // devolvemos un error
        return;
    }
    res.sendFile(filePath, { root: "." }); // devolvemos el archivo. Es necesario root: "." para que la ruta sea relativa
});

/**
 * Endpoint para obtener la lista de archivos subidos por el usuario
 */
app.get("/uploads", isAuthMiddleware, (req, res) => {
    const userId  = req.user?._id; // sacamos el usuario de la petición, asegurandonos de pasar por el middleware isAuthMiddleware.
    const path = `./uploads/${userId}`; // ruta donde se encuentran los archivos
    if (!fs.existsSync(path)) { // si el directorio no existe
        res.status(404).send("Directory not found"); // devolvemos un error
        return;
    }
    const files = fs.readdirSync(path); // lista de archivos
    res.json(files); // devolvemos la lista de archivos
});
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
```

### `server/multer.js`

Este archivo configura multer para manejar la subida de archivos, especificando dónde y cómo se guardarán. Define la ruta de destino y el nombre de los archivos subidos, asegurando que los directorios necesarios existen y se crean si no existen.

Aspectos clave:

1. Importaciones: Librerías *multer* y *fs*.
2. Configuración de multer:
    - *destination*: Define la ruta de destino para los archivos subidos, creando directorios si no existen.
    - *filename*: Define el nombre del archivo, permitiendo la personalización.

#### Código:

```js
import multer from 'multer'
import fs from 'fs'

const PATH = './uploads/' // ruta raíz donde se guardan los archivos

/**
 * Middleware que define donde y con qué nombre se guardan los archivos
 */
const storage = multer.diskStorage({

    destination: function (req, file, cb) { // Destino del archivo
        const userId = req.user?._id  // sacamos el usuario de la petición
        if (!userId) return cb(new Error('User not found'))//  Si no hay usuario, devolverá un error
        const path = `${PATH}${userId}` // ruta final donde se guarda el archivo.
        if (!fs.existsSync(path)) { // Crear directorio si no existe
            fs.mkdirSync(path, { recursive: true })
        }
        cb(null, path) // devolvemos la ruta donde se guarda el archivo
    },
    filename: function (req, file, cb) { // Nombre del archivo
        const newFileName = req.body.fileName || file.originalname // si no se envía un nombre, se toma el nombre original del archivo
        const fileName = newFileName.split(' ').join('-') // reemplazar espacios por guiones
        req.fileName = fileName // guardamos el nombre por si lo necesitamos después
        cb(null, fileName) // devolvemos el nombre del archivo
    }
})

const upload = multer({ storage: storage })
export default upload
```

## Frontend

El frontend, implementado con React, se encarga de proporcionar una interfaz de usuario para la subida, visualización y descarga de archivos. Utiliza componentes para gestionar el estado y las interacciones del usuario, y hace peticiones al backend para obtener y manipular los archivos.

### `client/App.jsx`

Este componente principal de la aplicación React gestiona la lista de archivos subidos y permite subir nuevos archivos. Se encarga de obtener la lista de archivos desde el servidor y de renderizar los componentes Upload y Show.

Aspectos clave:

1. Estado y Efectos:

    - *useState*: Define el estado para almacenar la lista de archivos subidos.
    - *useEffect*: Llama a getFiles al montar el componente para obtener la lista de archivos.
2. Funciones:

    - *getFiles*: Hace una petición GET al servidor para obtener la lista de archivos y actualiza el estado.

#### Código:

```jsx

import Upload from "./Upload";
import Show from "./Show";
import './App.css'
import { useEffect, useState } from "react";

const API_URL = 'http://localhost:3010/uploads/'

/**
 * Componente principal
 * Se encarga de mostrar los archivos subidos y de subir nuevos archivos
 */
function App() {
    const [uploadedFiles, setUploadedFiles] = useState([]) // lista de archivos subidos
    useEffect(() => { // cuando se monta el componente, obtenemos la lista de archivos subidos
        getFiles()
    }, [])

    /**
     * Obtiene la lista de archivos subidos por el usuario. Cada vez que se suba un archivo, se actualiza la lista
     */
    async function getFiles() {
        const response = await fetch(API_URL) // obtenemos la lista de archivos subidos. Modificar en caso de usar autenticación por token o cookies
        if(!response.ok) { // si hay un error cancelamos la operación
            console.error("archivos no encontrados");
            return;
        }
        const data = await response.json()
        console.log("files", data)
        setUploadedFiles(data) // actualizamos la lista
    }
    return (
        <div className="App">
            <Upload onUpload={getFiles}/>
            <Show  files={uploadedFiles}/>
        </div>
    );
}

export default App
```


### `client/Show.jsx`

Este componente muestra la lista de archivos subidos y permite descargarlos o mostrarlos si son imágenes. Gestiona la selección de archivos y su visualización o descarga.

Aspectos clave:

1. Estado: Define el estado para almacenar el archivo seleccionado.
2. Funciones:
    - *getFile*: Descarga o muestra el archivo seleccionado.
3. Renderizado: Muestra la lista de archivos subidos y maneja la selección de archivos para mostrarlos o descargarlos.

#### Código:

```jsx

import { useState } from 'react'

const API_URL = 'http://localhost:3010/uploads/' // ruta donde se almacenan los archivos. Pasar a archivo .env para poder reemplazarlo en todos los archivos

/**
 * Componente para mostrar los archivos subidos. Cuando se hace click en un archivo, se muestra si es una imagen, o se descarga el archivo si es otro tipo de archivo
 * @param {Array} files - Lista de archivos subidos
 */
const ShowUploadedFiles = ({ files }) => {
    const [selectedFile, setSelectedFile] = useState(null) // estado para mostrar la imagen o el archivo seleccionado

    /**
     * Función para obtener el archivo. Si es una imagen, se muestra la imagen. Si es otro tipo de archivo, se descarga el archivo
     * @param {*} fileName  - Nombre del archivo
     * @returns  - No devuelve nada
     */
    async function getFile(fileName) {
        const url = `${API_URL}${fileName}` // url del archivo
        const file = await fetch(url) // obtenemos el archivo
        if(!file.ok) { // si hay un error, cancelamos la operación
            console.error("archivo no encontrado");
            return;
        }
        const blob = await file.blob() // lo convertimos en un blob. Esto es necesario para mostrar la imagen o descargar el archivo
        const fileUrl = URL.createObjectURL(blob) // crea una URL para mostrar la imagen o descargar el archivo
        // si es una imagen
        if (blob.type.includes('image')) {
            setSelectedFile(fileUrl)   // se guarda la URL generada con el blob
            return
        }
        else {
            // descargamos el archivo
            const link = document.createElement('a') // creamos un enlace para descargar el archivo
            link.href = fileUrl // asignamos la URL generada con el blob
            link.download = fileName // asignamos el nombre del archivo
            link.click() // descargamos el archivo
            URL.revokeObjectURL(fileUrl) // liberamos la URL generada
            return
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
    )
}

export default ShowUploadedFiles
```

### `client/Upload.jsx`

Este componente permite al usuario seleccionar y subir un archivo al servidor. Gestiona la selección del archivo, su vista previa y el proceso de subida al servidor.

Aspectos clave:

1. Estados:
    - *uploadFile*: Almacena el archivo seleccionado para la vista previa.
    - *fileName*: Almacena el nombre del archivo.
2. Funciones:
    - *upload*: Sube el archivo al servidor utilizando FormData.
    - *handleSubmit*: Maneja el envío del formulario y llama a upload.
    - *handleSelectFile*: Actualiza los estados al seleccionar un archivo.
    - *showUploadFile*: Muestra la vista previa del archivo seleccionado.
3. Renderizado: Muestra un formulario para seleccionar y subir archivos, y una vista previa del archivo seleccionado.
#### Código:

```jsx
import { useState } from 'react'

const API_URL = 'http://localhost:3010/upload/'

/**
   * Componente que permite subir un archivo. Una vez seleccionado el archivo, muestra una vist previa en caso de imágen o el nombre del archivo en caso de otro tipo de archivo
*/
function Upload({ onUpload }) {
  const [uploadFile, setUploadFile] = useState(null) // archivo a subir. Usado par la vista previa
  const [fileName, setFileName] = useState("") // nombre del archivo. Usado para modificar el nombre del archivo

  /**
   *  Sube un archivo seleccionado
   * @param {*} file  - archivo a subir
   * @returns  - No devuelve nada
   */
  async function upload(file) {
    const formData = new FormData() // FormData nos permite subir archivos
    formData.append('fileName', fileName) // nuevo nombre del archivo. **Importante**, cualquier variable que queramos usar en multer debe ir antes del archivo para que multer la pueda leer
    formData.append('file', file) // añadimos el archivo
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData
    })
    const data = await response.json()
    return data
  }

  /**
   * Gestiona el envío del formulario
   * @param {*} event  - evento de formulario
   * @returns  - No devuelve nada
   */
  async function handleSubmit(event) {
    event.preventDefault() // evita que se recargue la página
    const file = event.target.file.files[0] // Selecciona el archivo a subir. Si quisieramos subir múltiples archivos habría que modificarlo
    const data = await upload(file) // sube el archivo
    console.log("respuesta del servidor:", data)
    if (data.error || !data.fileName) {
      return alert(data.error)
    }
    alert(`Archivo subido en la URL: ${API_URL}${data.fileName}`)
    onUpload() // avisa al componente principal de que se ha subido un archivo, para que se actualice la lista de archivos
  }

  /**
   * Gestiona la selección de un archivo para la vista previa
   * @param {*} event  - evento de formulario
   * @returns  - No devuelve nada
   */
  function handleSelectFile(event) {
    const file = event.target.files[0]
    if (file.type.includes('image')) { // si es una imagen, se muestra la vista previa
      setUploadFile(file)
    }
    else{ // si no es una imagen, se muestra el nombre del archivo
      setUploadFile(file.name)
    }
    setFileName(file.name) // se actualiza el nombre del archivo
  }

  /**
   * Muestra la vista previa del archivo
   * @returns  {JSX.Element} - Vista previa del archivo
   */
  function showUploadFile() {
    if (!uploadFile) { // si no hay archivo, muestra un mensaje 
      return <p>Selecione un archivo</p>
    }
    if (typeof uploadFile === 'string') { // si es un string, muestra el nombre del archivo
      return <p>Archivo seleccionado: <b>{uploadFile}</b></p>
    }
    return <img src={URL.createObjectURL(uploadFile)} alt="Uploaded" /> // si es una imagen, muestra la vista previa
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
        <input type="text" name="fileName" value={fileName} onChange={e => setFileName(e.target.value)}  />
        <button type="submit">Subir</button>
      </form>
    </>
  )
}

export default Upload

```


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

   - **Cliente**:

     ```bash
     cd client
     npm run dev
     ```

Con estos pasos, se podrá acceder a la aplicación de React en `http://localhost:5173` y subir archivos al servidor en `http://localhost:3010/uploads/`. Si se desea cambiar el puerto del servidor, se puede modificar en el archivo `server/index.js` y en los archivos de la aplicación React.

## Referencias
- [Multer | npm](https://www.npmjs.com/package/multer)
- [Multi-Form Data Uploads with React.js, Express, and Multer | medium](https://medium.com/@byte.talking/multi-form-data-uploads-with-react-js-express-and-multer-b19adb3c1de2)