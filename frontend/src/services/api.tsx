import axios from 'axios';
import { DataResponse, MetadataResponse } from '../types';

// 환경변수로 백엔드 서버 주소 지정 가능 (기본값: localhost)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:19006/api';

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

  getData: async (
    page: number = 1,
    pageSize: number = 50,
    patientNo?: string,
    interventionType?: string,
    antibiotic?: string,
    consultation?: string
  ): Promise<DataResponse> => {
    const params: any = { page, page_size: pageSize };

    if (patientNo) {
      params.patient_no = patientNo;
    }
    if (interventionType) {
      params.intervention_type = interventionType;
    }
    if (antibiotic) {
      params.antibiotic = antibiotic;
    }
    if (consultation) {
      params.consultation = consultation;
    }

    const response = await apiClient.get<DataResponse>('/data/', {
      params,
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
