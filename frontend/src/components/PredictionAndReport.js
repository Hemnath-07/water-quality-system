import React, { useState } from 'react';
import { Download, AlertTriangle, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const DEFAULT_PARAMS = {
  ph: 7.2,
  Hardness: 190.5,
  Solids: 20500.0,
  Chloramines: 7.1,
  Sulfate: 333.3,
  Conductivity: 420.0,
  Organic_carbon: 14.2,
  Trihalomethanes: 66.3,
  Turbidity: 3.9
};

export default function PredictionAndReport({ trainedModelName }) {
  const [formData, setFormData] = useState(DEFAULT_PARAMS);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) || 0 });
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/predict`, formData);
      setPrediction(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate prediction. Train a model first.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/download-report`, formData, {
        responseType: 'blob'
      });

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Water_Quality_Screening_Report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download PDF report.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-1">Water Quality Screening Tool</h2>
      <p className="text-xs text-slate-500 mb-6">Enter measured parameters to evaluate water potability category.</p>

      <form onSubmit={handlePredict} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.keys(formData).map((param) => (
          <div key={param}>
            <label className="block text-xs font-medium text-slate-700 mb-1">{param}</label>
            <input
              type="number"
              step="any"
              name={param}
              value={formData[param]}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        ))}

        <div className="md:col-span-3 flex items-center justify-between mt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-colors flex items-center disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Predict Potability
          </button>

          {prediction && (
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="bg-slate-800 hover:bg-slate-900 text-white font-medium text-sm px-4 py-2.5 rounded-lg transition-colors flex items-center disabled:opacity-50"
            >
              {downloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Download Report (PDF)
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {prediction && (
        <div className="mt-6 border-t border-slate-200 pt-6">
          <div
            className={`p-4 rounded-xl border flex items-start space-x-4 ${
              prediction.prediction_code === 1
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {prediction.prediction_code === 1 ? (
              <ShieldCheck className="w-8 h-8 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-8 h-8 text-rose-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="text-base font-bold">{prediction.category}</h4>
              <p className="text-xs mt-1 opacity-90">
                Confidence Level: <strong>{(prediction.confidence * 100).toFixed(1)}%</strong>
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-2 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>{prediction.disclaimer}</span>
          </div>
        </div>
      )}
    </div>
  );
}
