export const ContractStatus = {
  Draft: 0,
  PendingApproval: 1,
  Approved: 2,
  Signed: 3,
  Active: 4,
  Expiring: 5,
  Renewed: 6,
  Terminated: 7
} as const;

export type ContractStatus = typeof ContractStatus[keyof typeof ContractStatus];

export const ContractStatusConfig: Record<ContractStatus, { label: string; color: string; bg: string }> = {
  [ContractStatus.Draft]: { label: 'Bản nháp', color: '#64748b', bg: '#f1f5f9' },
  [ContractStatus.PendingApproval]: { label: 'Chờ phê duyệt', color: '#d97706', bg: '#fef3c7' },
  [ContractStatus.Approved]: { label: 'Đã phê duyệt', color: '#2563eb', bg: '#dbeafe' },
  [ContractStatus.Signed]: { label: 'Đã ký số', color: '#7c3aed', bg: '#ede9fe' },
  [ContractStatus.Active]: { label: 'Đang hiệu lực', color: '#16a34a', bg: '#dcfce7' },
  [ContractStatus.Expiring]: { label: 'Sắp hết hạn', color: '#ea580c', bg: '#ffedd5' },
  [ContractStatus.Renewed]: { label: 'Đã gia hạn', color: '#0891b2', bg: '#cffafe' },
  [ContractStatus.Terminated]: { label: 'Đã thanh lý', color: '#dc2626', bg: '#fee2e2' }
};

export interface ContractType {
  id: string;
  name: string;
  createdAt: string;
  activeTemplateVersion: number;
  totalContractsCount: number;
}

export interface TemplateVersion {
  id: string;
  contractTypeId: string;
  contractTypeName: string;
  version: number;
  templateFileUrl?: string;
  contentJson?: string;
  workflowDefinitionId?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface ContractListItem {
  id: string;
  contractNumber: string;
  title: string;
  contractTypeId: string;
  contractTypeName: string;
  partnerId: string;
  partnerName: string;
  value: number;
  effectiveDate: string;
  expiryDate: string;
  status: ContractStatus;
  createdAt: string;
}

export interface ContractDetail {
  id: string;
  contractNumber: string;
  title: string;
  contractTypeId: string;
  contractTypeName: string;
  templateVersionUsedId: string;
  templateVersionNumber: number;
  partnerId: string;
  partnerName: string;
  ownerId: string;
  ownerName: string;
  value: number;
  signedDate?: string;
  effectiveDate: string;
  expiryDate: string;
  status: ContractStatus;
  fileUrl?: string;
  parentContractId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateContractDraftInput {
  title: string;
  contractTypeId: string;
  templateVersionUsedId?: string;
  partnerId?: string;
  value: number;
  effectiveDate: string;
  expiryDate: string;
  fileUrl?: string;
}

export interface UpdateContractDraftInput {
  title: string;
  value: number;
  effectiveDate: string;
  expiryDate: string;
  fileUrl?: string;
}
