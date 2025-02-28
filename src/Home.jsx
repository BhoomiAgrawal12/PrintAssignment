// src/Home.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setFiles(uploadedFiles);
  };

  const handleProceed = () => {
    navigate('/preview', { state: { files } });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Upload Your Files</h1>
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg text-center">
        <input
          type="file"
          multiple
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
        />
        <div className="mt-4 text-left">
          {files.map((file, index) => (
            <div key={index} className="p-2 bg-gray-200 rounded my-1 text-gray-700">
              <span className="font-medium">{file.name}</span> - {file.type}
            </div>
          ))}
        </div>
        {files.length > 0 && (
          <button
            onClick={handleProceed}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-all"
          >
            Proceed to Preview
          </button>
        )}
      </div>
    </div>
  );
}
