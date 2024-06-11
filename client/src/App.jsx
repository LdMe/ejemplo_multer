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
        if(!response.ok) {
            console.error("archivos no encontrados");
            return;
        }
        const data = await response.json();
        console.log("archivos", data);
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
