import React, { useState } from 'react';
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

  const handleSubmitForApproval = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn trình duyệt hợp đồng này lên cấp phê duyệt?')) {
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

  return (
    <div className="clm-card" style={{ maxWidth: 840, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button className="clm-btn clm-btn-secondary" onClick={onBack}>
          ← Quay lại danh sách
        </button>
        <ContractBadge status={contract.status} />
      </div>

      {message && <div className="clm-alert-success">{message}</div>}
      {error && <div className="clm-alert-error">{error}</div>}

      <div style={{ borderBottom: '1px solid var(--clm-border)', paddingBottom: 16, marginBottom: 20 }}>
        <span style={{ fontSize: 13, color: 'var(--clm-text-muted)', fontWeight: 600 }}>
          Số HĐ: {contract.contractNumber}
        </span>
        <h2 style={{ margin: '6px 0 0', fontSize: 22, fontWeight: 700, color: '#0f172a' }}>
          {contract.title}
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 24 }}>
        <div>
          <label className="clm-label">Loại hợp đồng</label>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{contract.contractTypeName}</div>
        </div>

        <div>
          <label className="clm-label">Giá trị hợp đồng</label>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#16a34a' }}>
            {formatCurrency(contract.value)}
          </div>
        </div>

        <div>
          <label className="clm-label">Ngày hiệu lực</label>
          <div style={{ fontSize: 14 }}>{new Date(contract.effectiveDate).toLocaleDateString('vi-VN')}</div>
        </div>

        <div>
          <label className="clm-label">Ngày hết hạn</label>
          <div style={{ fontSize: 14 }}>{new Date(contract.expiryDate).toLocaleDateString('vi-VN')}</div>
        </div>

        <div>
          <label className="clm-label">Phiên bản mẫu áp dụng</label>
          <div style={{ fontSize: 14 }}>v{contract.templateVersionNumber} (Snapshot lúc tạo)</div>
        </div>

        <div>
          <label className="clm-label">Tệp văn bản hợp đồng</label>
          <div>
            {contract.fileUrl ? (
              <a href={contract.fileUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--clm-primary)', fontWeight: 600 }}>
                📄 Xem file đính kèm
              </a>
            ) : (
              <span style={{ color: 'var(--clm-text-muted)', fontSize: 13 }}>Chưa có file đính kèm</span>
            )}
          </div>
        </div>
      </div>

      {/* Hành động theo State Machine */}
      <div style={{ borderTop: '1px solid var(--clm-border)', paddingTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        {contract.status === ContractStatus.Draft && (
          <button
            className="clm-btn clm-btn-success"
            onClick={handleSubmitForApproval}
            disabled={submitting}
          >
            {submitting ? 'Đang gửi duyệt...' : '🚀 Trình Duyệt Phê Duyệt'}
          </button>
        )}

        {contract.status === ContractStatus.PendingApproval && (
          <span style={{ fontSize: 13, color: 'var(--clm-text-muted)', fontStyle: 'italic', alignSelf: 'center' }}>
            ⏳ Hợp đồng đang chờ người duyệt (Người 4) phê duyệt trên hệ thống...
          </span>
        )}

        {contract.status === ContractStatus.Approved && (
          <span style={{ fontSize: 13, color: '#2563eb', fontWeight: 600, alignSelf: 'center' }}>
            ✓ Hợp đồng đã được duyệt! Đang chờ ký số.
          </span>
        )}
      </div>
    </div>
  );
};
