import axios from 'axios';
import { DataResponse, MetadataResponse } from '../types';

const API_BASE_URL = 'http://localhost:19006/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const dataService = {
  getMetadata: async (): Promise<MetadataResponse> => {
    const response = await apiClient.get<MetadataResponse>('/metadata/');
    return response.data;
  },

  getData: async (page: number = 1, pageSize: number = 50): Promise<DataResponse> => {
    const response = await apiClient.get<DataResponse>('/data/', {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },

  updateData: async (rowIndex: number, columnName: string, value: any): Promise<any> => {
    const response = await apiClient.post('/data/update/', {
      row_index: rowIndex,
      column_name: columnName,
      value: value,
    });
    return response.data;
  },
};
