import React, { useState } from 'react';
import { ArrowLeft, Send, Copy, Check, Printer } from 'lucide-react';
import { contractApi } from '../services/contractApi';
import { ContractStatus } from '../types';
import type { ContractDetail } from '../types';
import { ContractBadge } from './ContractBadge';

interface Props {
  contract: ContractDetail;
  onBack: () => void;
  onRefresh: (updatedContract: ContractDetail) => void;
}

export const ContractDetailView: React.FC<Props> = ({ contract, onBack, onRefresh }) => {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(contract.contractNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSubmitForApproval = async () => {
    if (!window.confirm(`Xác nhận trình duyệt hợp đồng ${contract.contractNumber}?`)) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await contractApi.submitForApproval(contract.id);
      setMessage('Hợp đồng đã được chuyển sang trạng thái "Chờ phê duyệt".');
      const updated = await contractApi.getContractById(contract.id);
      onRefresh(updated);
    } catch (err: any) {
      setError(err.message || 'Không thể trình duyệt hợp đồng.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val) + ' ₫';
  };

  const isDraft = contract.status === ContractStatus.Draft;
  const isPassed = (step: number) => contract.status > step;
  const isActive = (step: number) => contract.status === step;

  return (
    <div className="max-w-4xl">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <button
          type="button"
          className="border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm px-3.5 py-1.5 rounded-lg font-medium shadow-xs transition-colors flex items-center gap-1.5 bg-white cursor-pointer"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm px-3.5 py-1.5 rounded-lg font-medium shadow-xs transition-colors flex items-center gap-1.5 bg-white cursor-pointer"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4" />
            <span>In</span>
          </button>

          {isDraft && (
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              disabled={submitting}
              onClick={handleSubmitForApproval}
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Đang gửi...' : 'Trình duyệt'}</span>
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="p-3.5 mb-5 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
          {message}
        </div>
      )}

      {error && (
        <div className="p-3.5 mb-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Header Info */}
      <div className="border border-slate-200 bg-white rounded-xl p-5 mb-5 shadow-xs">
        <div className="flex items-center gap-2.5 mb-2.5">
          <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200 text-slate-700 whitespace-nowrap inline-flex items-center gap-1.5">
            {contract.contractNumber}
            <button
              type="button"
              className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer p-0.5"
              onClick={handleCopyCode}
              title="Sao chép"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            </button>
          </span>
          <ContractBadge status={contract.status} />
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-1">
          {contract.title}
        </h2>
        <div className="text-xs text-slate-500">
          Phân loại: <strong className="text-slate-700">{contract.contractTypeName}</strong> • Đối tác: <strong className="text-slate-700">{contract.partnerName || 'Chưa cập nhật'}</strong>
        </div>
      </div>

      {/* State Machine Stepper */}
      <div className="border border-slate-200 bg-white rounded-xl p-4 sm:p-5 mb-5 shadow-xs flex items-center justify-between text-xs font-medium">
        <div className={`flex items-center gap-2 ${isPassed(0) ? 'text-emerald-600' : isActive(0) ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isPassed(0) ? 'bg-emerald-600 text-white' : isActive(0) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
            {isPassed(0) ? '✓' : '1'}
          </span>
          <span>Bản nháp</span>
        </div>
        <div className={`flex-1 h-0.5 mx-3 ${isPassed(0) ? 'bg-emerald-600' : 'bg-slate-200'}`} />

        <div className={`flex items-center gap-2 ${isPassed(1) ? 'text-emerald-600' : isActive(1) ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isPassed(1) ? 'bg-emerald-600 text-white' : isActive(1) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
            {isPassed(1) ? '✓' : '2'}
          </span>
          <span>Chờ duyệt</span>
        </div>
        <div className={`flex-1 h-0.5 mx-3 ${isPassed(1) ? 'bg-emerald-600' : 'bg-slate-200'}`} />

        <div className={`flex items-center gap-2 ${isPassed(2) ? 'text-emerald-600' : isActive(2) ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isPassed(2) ? 'bg-emerald-600 text-white' : isActive(2) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
            {isPassed(2) ? '✓' : '3'}
          </span>
          <span>Đã duyệt</span>
        </div>
        <div className={`flex-1 h-0.5 mx-3 ${isPassed(2) ? 'bg-emerald-600' : 'bg-slate-200'}`} />

        <div className={`flex items-center gap-2 ${isPassed(3) ? 'text-emerald-600' : isActive(3) ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isPassed(3) ? 'bg-emerald-600 text-white' : isActive(3) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
            {isPassed(3) ? '✓' : '4'}
          </span>
          <span>Đã ký số</span>
        </div>
        <div className={`flex-1 h-0.5 mx-3 ${isPassed(3) ? 'bg-emerald-600' : 'bg-slate-200'}`} />

        <div className={`flex items-center gap-2 ${isPassed(4) ? 'text-emerald-600' : isActive(4) ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isPassed(4) ? 'bg-emerald-600 text-white' : isActive(4) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
            {isPassed(4) ? '✓' : '5'}
          </span>
          <span>Hiệu lực</span>
        </div>
        <div className={`flex-1 h-0.5 mx-3 ${isActive(7) ? 'bg-emerald-600' : 'bg-slate-200'}`} />

        <div className={`flex items-center gap-2 ${isActive(7) ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isActive(7) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
            6
          </span>
          <span>Thanh lý</span>
        </div>
      </div>

      {/* Specifications Grid */}
      <div className="border border-slate-200 bg-white rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
          Thông tin chi tiết hợp đồng
        </h3>

        <dl className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-y-3 text-sm">
          <dt className="text-slate-500">Giá trị hợp đồng:</dt>
          <dd className="font-bold text-slate-900">{formatCurrency(contract.value)}</dd>

          <dt className="text-slate-500">Thời hạn hiệu lực:</dt>
          <dd className="text-slate-800">
            {new Date(contract.effectiveDate).toLocaleDateString('vi-VN')} đến{' '}
            {new Date(contract.expiryDate).toLocaleDateString('vi-VN')}
          </dd>

          <dt className="text-slate-500">Người tạo hồ sơ:</dt>
          <dd className="text-slate-800">{contract.ownerName}</dd>

          <dt className="text-slate-500">Thời gian tạo:</dt>
          <dd className="text-slate-800">{new Date(contract.createdAt).toLocaleString('vi-VN')}</dd>

          <dt className="text-slate-500">Tệp đính kèm:</dt>
          <dd>
            {contract.fileUrl ? (
              <a href={contract.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                {contract.fileUrl}
              </a>
            ) : (
              <span className="text-slate-400">Không có tệp đính kèm</span>
            )}
          </dd>

          <dt className="text-slate-500">Mã khóa (RowVersion):</dt>
          <dd>
            <code className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700">
              {contract.rowVersion || '0x000000000001B4'}
            </code>
          </dd>
        </dl>
      </div>
    </div>
  );
};
