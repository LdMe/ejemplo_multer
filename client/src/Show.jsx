import { useState } from 'react';

const API_URL = 'http://localhost:3010/uploads/';

const ShowUploadedFiles = ({ files }) => {
    const [selectedFile, setSelectedFile] = useState(null);

    async function getFile(fileName) {
        const url = `${API_URL}${fileName}`;
        const file = await fetch(url);
        if(!file.ok) {
            console.error("archivo no encontrado");
            return;
        }
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