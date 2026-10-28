import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export default function FileUpload({ onTrainingComplete }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid CSV file.');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/upload-and-train?target_column=Potability`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setSuccess(true);
      if (onTrainingComplete) {
        onTrainingComplete(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload dataset and train models.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-2">Upload Dataset & Train</h2>
      <p className="text-sm text-slate-500 mb-4">
        Upload a CSV dataset containing water quality parameters (e.g., pH, Turbidity, Hardness, Potability).
      </p>

      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="csv-upload-input"
        />
        <label htmlFor="csv-upload-input" className="flex flex-col items-center cursor-pointer">
          <Upload className="w-10 h-10 text-sky-600 mb-2" />
          <span className="text-sm font-medium text-slate-700">
            {file ? file.name : 'Click to browse or drag and drop CSV'}
          </span>
          <span className="text-xs text-slate-400 mt-1">CSV files up to 10MB</span>
        </label>
      </div>

      {file && (
        <div className="mt-4 flex items-center justify-between bg-sky-50 border border-sky-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-sky-800">
            <FileText className="w-5 h-5 text-sky-600" />
            <span className="text-sm font-medium truncate max-w-xs">{file.name}</span>
          </div>
          <button
            onClick={handleUpload}
            disabled={loading}
            className="flex items-center bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Training...
              </>
            ) : (
              'Train Models'
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mt-4 flex items-center space-x-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Models successfully trained and evaluated!</span>
        </div>
      )}
    </div>
  );
}
