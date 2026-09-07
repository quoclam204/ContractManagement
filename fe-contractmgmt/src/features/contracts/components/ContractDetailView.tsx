import React, { useState } from 'react';
import { contractApi } from '../services/contractApi';
import { ContractStatus } from '../types';
import type { ContractDetail } from '../types';
import { ContractBadge } from './ContractBadge';
import {
  IconArrowLeft,
  IconSend,
  IconCopy,
  IconCheck,
  IconPrinter
} from './Icons';

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
    <div style={{ maxWidth: 900 }}>
      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button type="button" className="btn btn-outline btn-sm" onClick={onBack}>
          <IconArrowLeft size={13} />
          <span>Quay lại</span>
        </button>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => window.print()}>
            <IconPrinter size={13} />
            <span>In</span>
          </button>

          {isDraft && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={submitting}
              onClick={handleSubmitForApproval}
            >
              <IconSend size={13} />
              <span>{submitting ? 'Đang gửi...' : 'Trình duyệt'}</span>
            </button>
          )}
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Contract Header */}
      <div className="table-card" style={{ padding: '20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span className="code-tag">
            {contract.contractNumber}
            <button type="button" className="btn-copy-code" onClick={handleCopyCode} title="Sao chép">
              {copied ? <IconCheck size={12} color="#10b981" /> : <IconCopy size={12} />}
            </button>
          </span>
          <ContractBadge status={contract.status} />
        </div>

        <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {contract.title}
        </h2>
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
          Phân loại: <strong>{contract.contractTypeName}</strong> • Đối tác: <strong>{contract.partnerName || 'Chưa cập nhật'}</strong>
        </div>
      </div>

      {/* Lifecycle Stepper */}
      <div className="lifecycle-bar">
        <div className={`lifecycle-step ${isPassed(0) ? 'passed' : isActive(0) ? 'active' : ''}`}>
          <span className="step-circle">{isPassed(0) ? '✓' : '1'}</span>
          <span>Bản nháp</span>
        </div>
        <div className={`step-line ${isPassed(0) ? 'passed' : ''}`} />

        <div className={`lifecycle-step ${isPassed(1) ? 'passed' : isActive(1) ? 'active' : ''}`}>
          <span className="step-circle">{isPassed(1) ? '✓' : '2'}</span>
          <span>Chờ duyệt</span>
        </div>
        <div className={`step-line ${isPassed(1) ? 'passed' : ''}`} />

        <div className={`lifecycle-step ${isPassed(2) ? 'passed' : isActive(2) ? 'active' : ''}`}>
          <span className="step-circle">{isPassed(2) ? '✓' : '3'}</span>
          <span>Đã duyệt</span>
        </div>
        <div className={`step-line ${isPassed(2) ? 'passed' : ''}`} />

        <div className={`lifecycle-step ${isPassed(3) ? 'passed' : isActive(3) ? 'active' : ''}`}>
          <span className="step-circle">{isPassed(3) ? '✓' : '4'}</span>
          <span>Đã ký</span>
        </div>
        <div className={`step-line ${isPassed(3) ? 'passed' : ''}`} />

        <div className={`lifecycle-step ${isPassed(4) ? 'passed' : isActive(4) ? 'active' : ''}`}>
          <span className="step-circle">{isPassed(4) ? '✓' : '5'}</span>
          <span>Hiệu lực</span>
        </div>
        <div className={`step-line ${isPassed(4) ? 'passed' : ''}`} />

        <div className={`lifecycle-step ${isActive(7) ? 'active' : ''}`}>
          <span className="step-circle">{isActive(7) ? '✓' : '6'}</span>
          <span>Thanh lý</span>
        </div>
      </div>

      {/* Specifications */}
      <div className="table-card" style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          Thông tin chi tiết
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 12, fontSize: 13 }}>
          <div style={{ color: 'var(--color-text-muted)' }}>Giá trị hợp đồng:</div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{formatCurrency(contract.value)}</div>

          <div style={{ color: 'var(--color-text-muted)' }}>Thời hạn hiệu lực:</div>
          <div>
            {new Date(contract.effectiveDate).toLocaleDateString('vi-VN')} đến{' '}
            {new Date(contract.expiryDate).toLocaleDateString('vi-VN')}
          </div>

          <div style={{ color: 'var(--color-text-muted)' }}>Người tạo:</div>
          <div>{contract.ownerName}</div>

          <div style={{ color: 'var(--color-text-muted)' }}>Ngày tạo:</div>
          <div>{new Date(contract.createdAt).toLocaleString('vi-VN')}</div>

          <div style={{ color: 'var(--color-text-muted)' }}>Tệp đính kèm:</div>
          <div>
            {contract.fileUrl ? (
              <a href={contract.fileUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>
                {contract.fileUrl}
              </a>
            ) : (
              'Không có tệp đính kèm'
            )}
          </div>

          <div style={{ color: 'var(--color-text-muted)' }}>Mã phiên bản (RowVersion):</div>
          <div>
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{contract.rowVersion || '0x000000000001B4'}</code>
          </div>
        </div>
      </div>
    </div>
  );
};
