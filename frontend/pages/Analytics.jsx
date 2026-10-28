import React from 'react';
import { Table, Droplet, Sliders } from 'lucide-react';

export default function Analytics({ parameterSummary }) {
  if (!parameterSummary || Object.keys(parameterSummary).length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center max-w-4xl mx-auto my-12">
        <Droplet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-700">No Parameter Statistics Loaded</h3>
        <p className="text-xs text-slate-500 mt-1">
          Upload and train a dataset on the Dashboard to view descriptive analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center space-x-2 mb-1">
          <Sliders className="w-5 h-5 text-sky-600" />
          <h2 className="text-lg font-semibold text-slate-800">Parameter Statistics & Range Summary</h2>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          Descriptive analytics calculated across cleaned dataset parameters after missing value imputation and IQR outlier handling.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Parameter</th>
                <th className="py-3 px-4">Mean</th>
                <th className="py-3 px-4">Median</th>
                <th className="py-3 px-4">Std Dev</th>
                <th className="py-3 px-4">Min</th>
                <th className="py-3 px-4">Max</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {Object.entries(parameterSummary).map(([param, stats]) => (
                <tr key={param} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-800">{param}</td>
                  <td className="py-3 px-4">{stats.mean}</td>
                  <td className="py-3 px-4">{stats.median}</td>
                  <td className="py-3 px-4">{stats.std}</td>
                  <td className="py-3 px-4 text-slate-500">{stats.min}</td>
                  <td className="py-3 px-4 text-slate-500">{stats.max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
