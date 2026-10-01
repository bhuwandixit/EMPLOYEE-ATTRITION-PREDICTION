import axios from 'axios';
import {
  DashboardSummaryData,
  Employee,
  ModelMetadata,
  PredictionHistoryItem,
  PredictionResult,
} from '../types';

const API_BASE = '/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const api = {
  async getHealth() {
    const res = await client.get('/health');
    return res.data;
  },

  async getSummary(): Promise<DashboardSummaryData> {
    const res = await client.get('/analytics/summary');
    return res.data;
  },

  async getModelInfo(): Promise<ModelMetadata> {
    const res = await client.get('/analytics/model-info');
    return res.data;
  },

  async getEmployees(params?: {
    search?: string;
    department?: string;
    risk_level?: string;
    sort_by?: string;
    sort_order?: string;
    limit?: number;
    offset?: number;
  }): Promise<Employee[]> {
    const res = await client.get('/employees', { params });
    return res.data;
  },

  async getEmployeeById(id: number): Promise<Employee> {
    const res = await client.get(`/employees/${id}`);
    return res.data;
  },

  async createEmployee(data: Partial<Employee>): Promise<Employee> {
    const res = await client.post('/employees', data);
    return res.data;
  },

  async deleteEmployee(id: number): Promise<void> {
    await client.delete(`/employees/${id}`);
  },

  async predictAttrition(
    data: any,
    lowThresh = 0.3,
    highThresh = 0.6
  ): Promise<PredictionResult> {
    const res = await client.post('/predict', data, {
      params: { low_thresh: lowThresh, high_thresh: highThresh },
    });
    return res.data;
  },

  async getPredictionHistory(params?: {
    limit?: number;
    risk_level?: string;
  }): Promise<PredictionHistoryItem[]> {
    const res = await client.get('/predict/history', { params });
    return res.data;
  },
};
