import { useState } from 'react'
const API_URL = 'http://localhost:3010/upload/'
/**
   * Componente que permite subir un archivo. Una vez seleccionado el archivo, muestra una vist previa en caso de imágen o el nombre del archivo en caso de otro tipo de archivo
*/
function Upload({onUpload}) {
  const [uploadFile, setUploadFile] = useState(null) // archivo a subir. Usado par la vista previa
  const [fileName, setFileName] = useState("") // nombre del archivo. Usado para modificar el nombre del archivo

  /**
   *  Sube un archivo seleccionado
   * @param {*} file  - archivo a subir
   * @returns  - No devuelve nada
   */
  async function upload(file) {
    const formData = new FormData() // FormData nos permite subir archivos
    formData.append('fileName', fileName) // nuevo nombre del archivo. ¡Importante!, cualquier variable que queramos usar en multer debe ir antes del archivo para que multer la pueda leer
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
