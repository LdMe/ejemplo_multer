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