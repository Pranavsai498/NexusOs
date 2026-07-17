'use client';
import { useState } from 'react';

export default function VaultPage() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    alert(`Uploading ${file.name}... The Document MCP will handle OCR and storage.`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Digital Vault</h1>
          <p className="text-gray-600">Secure document storage & AI retrieval.</p>
        </div>
        <a href="/dashboard" className="text-blue-600 hover:underline">&larr; Back to Dashboard</a>
      </header>

      <main className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Upload a new document</h2>
        <div className="flex gap-4 mb-8">
          <input type="file" onChange={handleFileChange} className="border p-2 rounded flex-1" />
          <button onClick={handleUpload} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Upload
          </button>
        </div>

        <h2 className="text-lg font-semibold mb-4">Recent Documents</h2>
        <ul className="space-y-2">
          <li className="p-4 border rounded hover:bg-gray-50 flex justify-between">
            <span>Tax Return 2025.pdf</span>
            <span className="text-sm text-gray-500">Processed by Document MCP</span>
          </li>
          <li className="p-4 border rounded hover:bg-gray-50 flex justify-between">
            <span>Birth Certificate.jpg</span>
            <span className="text-sm text-gray-500">Processed by Document MCP</span>
          </li>
        </ul>
      </main>
    </div>
  );
}
