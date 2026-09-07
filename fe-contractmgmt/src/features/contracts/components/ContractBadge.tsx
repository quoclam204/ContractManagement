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
        return 'clm-badge-draft';
      case ContractStatus.PendingApproval:
        return 'clm-badge-pending';
      case ContractStatus.Approved:
        return 'clm-badge-approved';
      case ContractStatus.Signed:
        return 'clm-badge-signed';
      case ContractStatus.Active:
        return 'clm-badge-active';
      case ContractStatus.Expiring:
        return 'clm-badge-expiring';
      case ContractStatus.Renewed:
        return 'clm-badge-renewed';
      case ContractStatus.Terminated:
        return 'clm-badge-terminated';
      default:
        return 'clm-badge-draft';
    }
  };

  return (
    <span className={`clm-badge ${getStatusClass(status)}`}>
      <span className="clm-badge-dot" />
      {config.label}
    </span>
  );
};
