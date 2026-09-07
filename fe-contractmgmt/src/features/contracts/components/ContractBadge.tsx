import React from 'react';
import { ContractStatus, ContractStatusConfig } from '../types';

interface Props {
  status: ContractStatus;
}

export const ContractBadge: React.FC<Props> = ({ status }) => {
  const config = ContractStatusConfig[status] || {
    label: 'Không xác định'
  };

  const getBadgeClasses = (st: ContractStatus) => {
    switch (st) {
      case ContractStatus.Draft:
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case ContractStatus.PendingApproval:
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case ContractStatus.Approved:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case ContractStatus.Signed:
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case ContractStatus.Active:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case ContractStatus.Expiring:
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case ContractStatus.Renewed:
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case ContractStatus.Terminated:
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeClasses(status)}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {config.label}
    </span>
  );
};
