import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export function FeatureImportanceChart({ featureImportance }) {
  if (!featureImportance || Object.keys(featureImportance).length === 0) {
    return <p className="text-sm text-slate-400 text-center py-8">No feature importance data available.</p>;
  }

  const data = Object.entries(featureImportance)
    .map(([feature, importance]) => ({
      feature,
      importance: Number((importance * 100).toFixed(2))
    }))
    .sort((a, b) => b.importance - a.importance);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-base font-semibold text-slate-800 mb-1">Feature Importance (%)</h3>
      <p className="text-xs text-slate-500 mb-4">
        Parameters that carry the highest influence in water potability predictions.
      </p>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
            <XAxis type="number" unit="%" tick={{ fontSize: 12, fill: '#64748B' }} />
            <YAxis dataKey="feature" type="category" tick={{ fontSize: 12, fill: '#334155' }} />
            <Tooltip
              formatter={(value) => [`${value}%`, 'Importance']}
              contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px' }}
            />
            <Bar dataKey="importance" fill="#0284C7" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ModelComparisonChart({ evaluations }) {
  if (!evaluations || Object.keys(evaluations).length === 0) {
    return null;
  }

  const data = Object.entries(evaluations).map(([model, metrics]) => ({
    model,
    Accuracy: Number((metrics.accuracy * 100).toFixed(1)),
    F1_Score: Number((metrics.f1_score * 100).toFixed(1))
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-base font-semibold text-slate-800 mb-1">Model Performance Comparison (%)</h3>
      <p className="text-xs text-slate-500 mb-4">Accuracy and F1-Score metrics across trained algorithms.</p>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="model" tick={{ fontSize: 12, fill: '#334155' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748B' }} />
            <Tooltip
              formatter={(val) => [`${val}%`]}
              contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Bar dataKey="Accuracy" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
            <Bar dataKey="F1_Score" fill="#6366F1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
