import { useState, useEffect } from 'react'

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