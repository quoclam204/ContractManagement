import React from 'react';
import { ContractStatus, ContractStatusConfig } from '../types';

interface Props {
  status: ContractStatus;
}

export const ContractBadge: React.FC<Props> = ({ status }) => {
  const config = ContractStatusConfig[status] || {
    label: 'Không xác định',
    color: '#64748b',
    bg: '#f1f5f9'
  };

  const getStatusClass = (st: ContractStatus) => {
    switch (st) {
      case ContractStatus.Draft:
        return 'draft';
      case ContractStatus.PendingApproval:
        return 'pending';
      case ContractStatus.Approved:
        return 'approved';
      case ContractStatus.Signed:
        return 'signed';
      case ContractStatus.Active:
        return 'active';
      case ContractStatus.Expiring:
        return 'expiring';
      case ContractStatus.Renewed:
        return 'active';
      case ContractStatus.Terminated:
        return 'terminated';
      default:
        return 'draft';
    }
  };

  return (
    <span className={`status-badge ${getStatusClass(status)}`}>
      <span className="status-dot" />
      {config.label}
    </span>
  );
};
