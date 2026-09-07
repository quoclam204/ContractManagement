import React from 'react';
import { ContractStatus, ContractStatusConfig } from '../types';

interface Props {
  status: ContractStatus;
}

export const ContractBadge: React.FC<Props> = ({ status }) => {
  const config = ContractStatusConfig[status] || {
    label: 'Không xác định',
    color: '#6b7280',
    bg: '#f3f4f6'
  };

  return (
    <span
      className="clm-status-pill"
      style={{
        color: config.color,
        backgroundColor: config.bg,
        border: `1px solid ${config.color}25`
      }}
    >
      <span className="clm-status-dot" style={{ backgroundColor: config.color }} />
      {config.label}
    </span>
  );
};
