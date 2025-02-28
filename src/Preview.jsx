import { useState, useEffect } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { useLocation } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';

export default function Preview() {
  const location = useLocation();
  const { files: initialFiles } = location.state || { files: [] };
  const [files, setFiles] = useState(initialFiles);
  const [previewContent, setPreviewContent] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [layout, setLayout] = useState('portrait');
  const [borderSize, setBorderSize] = useState(0);
  const [docFiles, setDocFiles] = useState([]);
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);

  useEffect(() => {
    if (files.length > 0) {
      renderFile(files[0]);
    }
  }, [files, width, height, layout]); 

  const renderFile = async (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target.result;
      switch (file.type) {
        case 'application/pdf':
          setPreviewContent(
            <div style={{ width: `${width}%`, height: `${height}%` }}>
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.10.111/build/pdf.worker.min.js">
                <Viewer fileUrl={URL.createObjectURL(file)} />
              </Worker>
            </div>
          );
          break;
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
          const { value: html } = await mammoth.convertToHtml({ arrayBuffer: content });
          setPreviewContent(
            <div style={{ width: `${width}%`, height: `${height}%`, overflow: 'auto' }} dangerouslySetInnerHTML={{ __html: html }} />
          );
          break;
        }
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
          const workbook = XLSX.read(content, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const sheetHtml = XLSX.utils.sheet_to_html(sheet);
          setPreviewContent(
            <div style={{ width: `${width}%`, height: `${height}%`, overflow: 'auto' }} dangerouslySetInnerHTML={{ __html: sheetHtml }} />
          );
          break;
        }
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
          setDocFiles([{ uri: URL.createObjectURL(file), fileType: "pptx" }]);
          break;
        case 'image/jpeg':
        case 'image/png':
        case 'image/jpg':
          setPreviewContent(
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              style={{
                width: `${width}%`,
                height: `${height}%`,
                transform: layout === 'landscape' ? 'rotate(90deg)' : 'none',
                objectFit: 'contain'
              }}
            />
          );
          break;
        default:
          setPreviewContent(<p>Unsupported file type.</p>);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const onDrop = (acceptedFiles) => {
    setFiles([...files, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: '*/*' });

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8">File Preview & Customization</h1>
      <div {...getRootProps()} className="border-dashed border-2 p-6 w-full text-center cursor-pointer bg-white mb-4">
        <input {...getInputProps()} />
        <p>Drag & drop files here, or click to select files</p>
      </div>
      <div className="flex w-full max-w-6xl gap-8">
        <div className="w-1/4 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Customization Options</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Background Color</label>
              <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium">Layout</label>
              <select value={layout} onChange={(e) => setLayout(e.target.value)} className="w-full p-2 border rounded">
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Border Size</label>
              <input type="range" min="0" max="10" value={borderSize} onChange={(e) => setBorderSize(e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium">Width (%)</label>
              <input type="range" min="50" max="200" value={width} onChange={(e) => setWidth(e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium">Height (%)</label>
              <input type="range" min="50" max="200" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full" />
            </div>
          </div>
        </div>
        <div
          className="w-3/4 bg-white p-4 rounded shadow flex flex-col items-center"
          style={{
            backgroundColor,
            border: `${borderSize}px solid black`,
            width: `${width}%`,
            height: `${height}%`,
            transform: layout === 'landscape' ? 'rotate(0deg)' : 'none',
            overflow: 'hidden'
          }}
        >
          <h2 className="text-lg font-semibold mb-4">Preview</h2>
          <div className="w-full h-96 flex justify-center items-center overflow-auto preview-content"
            style={{
              transform: layout === 'landscape' ? 'rotate(90deg)' : 'none',
            }}>
            {docFiles.length > 0 ? (
              <DocViewer documents={docFiles} pluginRenderers={DocViewerRenderers} />
            ) : (
              previewContent
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
