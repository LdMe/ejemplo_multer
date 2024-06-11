import Upload from "./components/Upload";
import Show from "./components/Show";
import './App.css'
import { useEffect, useState } from "react";

/**
 * Componente principal
 * Se encarga de mostrar los archivos subidos y de subir nuevos archivos
 */

const API_URL = 'http://localhost:3010/uploads/'
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