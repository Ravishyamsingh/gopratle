import axios from 'axios';
import type { CreatedRequirement, RequirementFormValues } from './types';

const configuredUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: configuredUrl.replace(/\/$/, ''),
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out. Please check your connection.'));
    }
    if (error.response?.status === 500) {
      return Promise.reject(new Error('Server error. Please try again later.'));
    }
    return Promise.reject(error);
  }
);

export async function postRequirement(payload: RequirementFormValues) {
  const response = await api.post<{ success: true; data: CreatedRequirement }>('/requirements', payload);
  return response.data.data;
}

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string') return message;
    const errMsg = error.message;
    if (errMsg && errMsg !== 'Network Error') return errMsg;
  }
  return 'We could not save your requirement. Please try again.';
}
