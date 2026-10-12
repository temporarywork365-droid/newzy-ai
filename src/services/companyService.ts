import { apiClient } from '@/api/client';
import type { Company, CompanyDetail } from '@/types';

export const companyService = {
  list: (): Promise<Company[]> => apiClient.get('/companies'),
  byId: (id: string): Promise<CompanyDetail> => apiClient.get(`/companies/${encodeURIComponent(id)}`),
};
