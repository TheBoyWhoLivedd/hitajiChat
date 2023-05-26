import axios from "axios";
import { ChangeEvent, FormEvent, useState } from "react";

function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [numFilesSelected, setNumFilesSelected] = useState(0);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFile(files[0]);
      setNumFilesSelected(files.length);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (file) {
      const formData = new FormData();
      formData.append("pdf", file);
      try {
        const response = await axios.post("/api/upload", formData);
        setContent(response.data.content);
      } catch (error: any) {
        console.error("Error:", error.message);
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>{" "}
      <br />
      <div>
        {numFilesSelected > 0 && <p>{numFilesSelected} file(s) selected.</p>}
        <p>{content}</p>
      </div>
    </>
  );
}

export default FileUpload;
