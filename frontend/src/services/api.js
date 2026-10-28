import axios from 'axios';

// Configure Base API Endpoint
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60-second timeout for ML training tasks
});

// Response Interceptor for Global Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = 'An unexpected network error occurred.';
    
    if (error.response) {
      // Backend returned a specific error status and response
      errorMessage = error.response.data?.detail || `Error ${error.response.status}: Action failed.`;
    } else if (error.request) {
      // Request was sent but no response was received
      errorMessage = 'Cannot connect to the backend server. Please verify FastAPI is running.';
    } else {
      errorMessage = error.message;
    }

    return Promise.reject(new Error(errorMessage));
  }
);

/**
 * Health Check API
 */
export const checkApiHealth = async () => {
  const response = await apiClient.get('/');
  return response.data;
};

/**
 * Upload CSV Dataset and Trigger Model Training Pipeline
 * @param {File} csvFile - The raw CSV file object
 * @param {string} targetColumn - Target label column (Default: 'Potability')
 */
export const uploadAndTrainDataset = async (csvFile, targetColumn = 'Potability') => {
  const formData = new FormData();
  formData.append('file', csvFile);

  const response = await apiClient.post(
    `/api/upload-and-train?target_column=${encodeURIComponent(targetColumn)}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

/**
 * Predict Water Quality Category for a single sample
 * @param {Object} sampleParameters - Water parameters object (pH, Hardness, Turbidity, etc.)
 */
export const predictWaterQuality = async (sampleParameters) => {
  const response = await apiClient.post('/api/predict', sampleParameters);
  return response.data;
};

/**
 * Download Water Quality Assessment PDF Report
 * @param {Object} sampleParameters - Water parameters object
 */
export const downloadPdfReport = async (sampleParameters) => {
  const response = await apiClient.post('/api/download-report', sampleParameters, {
    responseType: 'blob',
  });

  // Create downloadable file blob in browser
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', 'Water_Quality_Screening_Report.pdf');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

export default apiClient;
