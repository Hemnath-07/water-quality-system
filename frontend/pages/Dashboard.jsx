import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import { FeatureImportanceChart, ModelComparisonChart } from '../components/Charts';
import PredictionAndReport from '../components/PredictionAndReport';
import { Activity, BarChart3, Database, ShieldAlert } from 'lucide-react';

export default function Dashboard() {
  const [trainingData, setTrainingData] = useState(null);

  const handleTrainingComplete = (data) => {
    setTrainingData(data);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12">
      {/* Top Header Banner */}
      <header className="bg-slate-900 text-white py-6 px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Activity className="w-6 h-6 text-sky-400" />
              <h1 className="text-xl font-bold tracking-tight">Smart Water Quality Prediction System</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Data Preprocessing, Model Evaluation, and Predictive Screening Analysis
            </p>
          </div>
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/60 rounded-lg px-4 py-2 flex items-center space-x-3 text-xs text-amber-300">
            <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Screening Tool Only — Not a substitute for certified lab testing</span>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-8 space-y-8">
        
        {/* Section 1: Data Ingestion & Preprocessing */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <FileUpload onTrainingComplete={handleTrainingComplete} />
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-slate-800 mb-2">
                <Database className="w-5 h-5 text-sky-600" />
                <h2 className="text-lg font-semibold">Active Model Status</h2>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Overview of the trained models and automated preprocessing pipeline.
              </p>
            </div>

            {trainingData ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-500 font-medium block">Best Performing Model</span>
                  <span className="text-sm font-bold text-sky-700">{trainingData.best_model}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-500 font-medium block">Top Accuracy</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {(trainingData.model_evaluations[trainingData.best_model]?.accuracy * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-500 font-medium block">Top F1-Score</span>
                  <span className="text-sm font-bold text-indigo-600">
                    {(trainingData.model_evaluations[trainingData.best_model]?.f1_score * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-lg p-6 text-center border border-dashed border-slate-200">
                <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">
                  No trained dataset active. Upload a CSV file to evaluate Random Forest, Decision Tree, and Logistic Regression models.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Model Performance & Parameter Analysis Charts */}
        {trainingData && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ModelComparisonChart evaluations={trainingData.model_evaluations} />
            <FeatureImportanceChart featureImportance={trainingData.feature_importance} />
          </section>
        )}

        {/* Section 3: Live Parameter Prediction & Report Generation */}
        <section>
          <PredictionAndReport trainedModelName={trainingData?.best_model} />
        </section>
      </main>
    </div>
  );
}
