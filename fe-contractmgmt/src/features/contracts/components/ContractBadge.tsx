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

  return (
    <span
      className="clm-badge"
      style={{
        color: config.color,
        backgroundColor: config.bg,
        border: `1px solid ${config.color}33`
      }}
    >
      ● {config.label}
    </span>
  );
};
