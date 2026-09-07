import type {
  ContractType,
  TemplateVersion,
  ContractListItem,
  ContractDetail,
  CreateContractDraftInput,
  UpdateContractDraftInput,
  ContractStatus
} from '../types';

const API_BASE = 'http://localhost:5296/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMsg = `Lỗi HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson?.message) {
        errorMsg = errorJson.message;
      }
    } catch {
      // Bỏ qua nếu không parse được JSON
    }
    throw new Error(errorMsg);
  }
  return response.json();
}

export const contractApi = {
  // Loại hợp đồng
  async getContractTypes(): Promise<ContractType[]> {
    const res = await fetch(`${API_BASE}/contract-types`);
    return handleResponse<ContractType[]>(res);
  },

  async createContractType(name: string): Promise<ContractType> {
    const res = await fetch(`${API_BASE}/contract-types`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    return handleResponse<ContractType>(res);
  },

  // Mẫu hợp đồng
  async getActiveTemplates(): Promise<TemplateVersion[]> {
    const res = await fetch(`${API_BASE}/templates/active`);
    return handleResponse<TemplateVersion[]>(res);
  },

  async getTemplateVersionsByType(contractTypeId: string): Promise<TemplateVersion[]> {
    const res = await fetch(`${API_BASE}/templates/by-type/${contractTypeId}`);
    return handleResponse<TemplateVersion[]>(res);
  },

  async createTemplateVersion(input: {
    contractTypeId: string;
    templateFileUrl?: string;
    contentJson?: string;
  }): Promise<TemplateVersion> {
    const res = await fetch(`${API_BASE}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    return handleResponse<TemplateVersion>(res);
  },

  // Hợp đồng
  async getContracts(params?: {
    status?: ContractStatus;
    contractTypeId?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ totalItems: number; page: number; pageSize: number; totalPages: number; items: ContractListItem[] }> {
    const searchParams = new URLSearchParams();
    if (params?.status !== undefined) searchParams.set('status', params.status.toString());
    if (params?.contractTypeId) searchParams.set('contractTypeId', params.contractTypeId);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());

    const res = await fetch(`${API_BASE}/contracts?${searchParams.toString()}`);
    return handleResponse(res);
  },

  async getContractById(id: string): Promise<ContractDetail> {
    const res = await fetch(`${API_BASE}/contracts/${id}`);
    return handleResponse<ContractDetail>(res);
  },

  async createDraft(input: CreateContractDraftInput): Promise<ContractDetail> {
    const res = await fetch(`${API_BASE}/contracts/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    return handleResponse<ContractDetail>(res);
  },

  async updateDraft(id: string, input: UpdateContractDraftInput): Promise<{ message: string; id: string }> {
    const res = await fetch(`${API_BASE}/contracts/${id}/draft`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    return handleResponse(res);
  },

  async submitForApproval(id: string): Promise<{ message: string; id: string; status: ContractStatus; statusName: string }> {
    const res = await fetch(`${API_BASE}/contracts/${id}/submit`, {
      method: 'POST'
    });
    return handleResponse(res);
  }
};
