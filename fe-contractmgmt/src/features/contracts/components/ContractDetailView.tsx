import React, { useState } from 'react';
import { contractApi } from '../services/contractApi';
import { ContractStatus } from '../types';
import type { ContractDetail } from '../types';
import { ContractBadge } from './ContractBadge';
import { IconArrowLeft, IconSend } from './Icons';

interface Props {
  contract: ContractDetail;
  onBack: () => void;
  onRefresh: (updatedContract: ContractDetail) => void;
}

export const ContractDetailView: React.FC<Props> = ({ contract, onBack, onRefresh }) => {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitForApproval = async () => {
    if (!window.confirm('Xác nhận trình duyệt hợp đồng này lên cấp phê duyệt?')) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await contractApi.submitForApproval(contract.id);
      setMessage('Hợp đồng đã được trình duyệt thành công!');
      const updated = await contractApi.getContractById(contract.id);
      onRefresh(updated);
    } catch (err: any) {
      setError(err.message || 'Không thể trình duyệt hợp đồng.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const getStepClass = (stepStatus: ContractStatus) => {
    if (contract.status === stepStatus) return 'active';
    if (contract.status > stepStatus) return 'passed';
    return '';
  };

  return (
    <div className="clm-form-container" style={{ maxWidth: 840 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button className="clm-btn clm-btn-outline clm-btn-sm" onClick={onBack}>
          <IconArrowLeft size={14} />
          <span>Quay lại</span>
        </button>
        <ContractBadge status={contract.status} />
      </div>

      {message && <div className="clm-alert clm-alert-success">{message}</div>}
      {error && <div className="clm-alert clm-alert-error">{error}</div>}

      {/* Contract Title & Code Header */}
      <div style={{ borderBottom: '1px solid var(--clm-border-color)', paddingBottom: 16, marginBottom: 20 }}>
        <span className="clm-code-tag">{contract.contractNumber}</span>
        <h2 style={{ margin: '8px 0 4px', fontSize: 20, fontWeight: 700, color: 'var(--clm-text-title)' }}>
          {contract.title}
        </h2>
        <div style={{ fontSize: 12, color: 'var(--clm-text-muted)' }}>
          Người tạo: <strong>{contract.ownerName}</strong> • Thời gian tạo:{' '}
          {new Date(contract.createdAt).toLocaleString('vi-VN')}
        </div>
      </div>

      {/* Timeline Stepper (Clean Flat Style) */}
      <div className="clm-lifecycle-stepper">
        <div className={`clm-lifecycle-step ${getStepClass(ContractStatus.Draft)}`}>
          <div className="clm-step-num">1</div>
          <span>Bản nháp</span>
        </div>
        <div className="clm-step-divider" />

        <div className={`clm-lifecycle-step ${getStepClass(ContractStatus.PendingApproval)}`}>
          <div className="clm-step-num">2</div>
          <span>Chờ duyệt</span>
        </div>
        <div className="clm-step-divider" />

        <div className={`clm-lifecycle-step ${getStepClass(ContractStatus.Approved)}`}>
          <div className="clm-step-num">3</div>
          <span>Đã duyệt</span>
        </div>
        <div className="clm-step-divider" />

        <div className={`clm-lifecycle-step ${getStepClass(ContractStatus.Signed)}`}>
          <div className="clm-step-num">4</div>
          <span>Đã ký số</span>
        </div>
        <div className="clm-step-divider" />

        <div className={`clm-lifecycle-step ${getStepClass(ContractStatus.Active)}`}>
          <div className="clm-step-num">5</div>
          <span>Hiệu lực</span>
        </div>
      </div>

      {/* Specs Grid */}
      <div className="clm-grid-2col" style={{ gap: 16, marginBottom: 20 }}>
        <div style={{ background: '#f9fafb', border: '1px solid var(--clm-border-color)', padding: 14, borderRadius: 6 }}>
          <div className="clm-form-label" style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--clm-text-muted)' }}>
            Loại Hợp Đồng
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--clm-text-title)' }}>
            {contract.contractTypeName}
          </div>
          <div style={{ fontSize: 12, color: 'var(--clm-text-muted)', marginTop: 2 }}>
            Phiên bản mẫu: v{contract.templateVersionNumber}
          </div>
        </div>

        <div style={{ background: '#f9fafb', border: '1px solid var(--clm-border-color)', padding: 14, borderRadius: 6 }}>
          <div className="clm-form-label" style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--clm-text-muted)' }}>
            Giá Trị Hợp Đồng
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#059669' }}>
            {formatCurrency(contract.value)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--clm-text-muted)', marginTop: 2 }}>
            Đối tác: {contract.partnerName}
          </div>
        </div>

        <div style={{ background: '#f9fafb', border: '1px solid var(--clm-border-color)', padding: 14, borderRadius: 6 }}>
          <div className="clm-form-label" style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--clm-text-muted)' }}>
            Ngày Hiệu Lực
          </div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>
            {new Date(contract.effectiveDate).toLocaleDateString('vi-VN')}
          </div>
        </div>

        <div style={{ background: '#f9fafb', border: '1px solid var(--clm-border-color)', padding: 14, borderRadius: 6 }}>
          <div className="clm-form-label" style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--clm-text-muted)' }}>
            Ngày Hết Hạn
          </div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>
            {new Date(contract.expiryDate).toLocaleDateString('vi-VN')}
          </div>
        </div>
      </div>

      {/* File URL */}
      <div style={{ marginBottom: 20 }}>
        <div className="clm-form-label" style={{ fontSize: 12, color: 'var(--clm-text-muted)' }}>
          Tài liệu văn bản đính kèm
        </div>
        {contract.fileUrl ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f3f4f6', padding: '10px 14px', borderRadius: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--clm-text-title)' }}>{contract.fileUrl}</span>
            <a href={contract.fileUrl} target="_blank" rel="noreferrer" className="clm-btn clm-btn-outline clm-btn-sm">
              Mở file
            </a>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: 'var(--clm-text-light)', fontStyle: 'italic' }}>
            Chưa có tệp văn bản đính kèm.
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div
        style={{
          borderTop: '1px solid var(--clm-border-color)',
          paddingTop: 16,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 12
        }}
      >
        {contract.status === ContractStatus.Draft && (
          <button
            className="clm-btn clm-btn-success"
            onClick={handleSubmitForApproval}
            disabled={submitting}
          >
            <IconSend size={14} />
            <span>{submitting ? 'Đang gửi duyệt...' : 'Trình Duyệt Phê Duyệt'}</span>
          </button>
        )}

        {contract.status === ContractStatus.PendingApproval && (
          <div style={{ fontSize: 13, color: '#d97706', fontWeight: 500 }}>
            Hợp đồng đang chờ người duyệt xem xét (Module Người 4)
          </div>
        )}

        {contract.status === ContractStatus.Approved && (
          <div style={{ fontSize: 13, color: '#0284c7', fontWeight: 600 }}>
            Hợp đồng đã được duyệt toàn bộ, sẵn sàng để ký số
          </div>
        )}
      </div>
    </div>
  );
};
