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
    
    req.user = {_id: '120'} // TODO: cambiar por el usuario real que se autentique
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
    const userId  = req.user?._id; // sacamos el usuario de la petición, después de pasar por el middleware isAuthMiddleware
    const filePath = `./uploads/${userId}/${file}`; // ruta donde se encuentra el archivo
    if (!fs.existsSync(filePath)) { // si el archivo no existe
        res.status(404).send("File not found"); // devolvemos un error
        return;
    }
    res.sendFile(filePath, { root: "." }); // devolvemos el archivo. Es necesario root: "." para que la ruta sea relativa
});
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});