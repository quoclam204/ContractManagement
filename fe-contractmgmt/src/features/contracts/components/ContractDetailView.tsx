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
    if (!window.confirm('Xác nhận trình duyệt hợp đồng này lên cấp quản lý?')) {
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

  // Tính trạng thái của stepper
  const getStepClass = (stepStatus: ContractStatus) => {
    if (contract.status === stepStatus) return 'active';
    if (contract.status > stepStatus) return 'passed';
    return '';
  };

  return (
    <div className="clm-form-card" style={{ maxWidth: 880 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button className="clm-btn clm-btn-secondary clm-btn-sm" onClick={onBack}>
          ← Quay lại danh sách
        </button>
        <ContractBadge status={contract.status} />
      </div>

      {message && <div className="clm-alert-success">{message}</div>}
      {error && <div className="clm-alert-error">{error}</div>}

      {/* Contract Title & Code Header */}
      <div style={{ borderBottom: '1px solid var(--color-slate-200)', paddingBottom: 20, marginBottom: 28 }}>
        <span className="clm-contract-code" style={{ fontSize: 14 }}>
          {contract.contractNumber}
        </span>
        <h2 style={{ margin: '10px 0 6px', fontSize: 24, fontWeight: 800, color: 'var(--color-slate-900)' }}>
          {contract.title}
        </h2>
        <div style={{ fontSize: 13, color: 'var(--color-slate-500)' }}>
          Người tạo: <strong>{contract.ownerName}</strong> • Tạo lúc:{' '}
          {new Date(contract.createdAt).toLocaleString('vi-VN')}
        </div>
      </div>

      {/* State Machine Lifecycle Visualizer (Timeline Stepper) */}
      <div className="clm-form-section">
        <h4 className="clm-section-title">
          <span>🔄</span> Tiến Trình Vòng Đời Hợp Đồng (State Machine)
        </h4>

        <div className="clm-stepper">
          <div className={`clm-step ${getStepClass(ContractStatus.Draft)}`}>
            <div className="clm-step-circle">1</div>
            <div className="clm-step-label">Bản nháp</div>
          </div>

          <div className={`clm-step ${getStepClass(ContractStatus.PendingApproval)}`}>
            <div className="clm-step-circle">2</div>
            <div className="clm-step-label">Chờ duyệt</div>
          </div>

          <div className={`clm-step ${getStepClass(ContractStatus.Approved)}`}>
            <div className="clm-step-circle">3</div>
            <div className="clm-step-label">Đã duyệt</div>
          </div>

          <div className={`clm-step ${getStepClass(ContractStatus.Signed)}`}>
            <div className="clm-step-circle">4</div>
            <div className="clm-step-label">Đã ký số</div>
          </div>

          <div className={`clm-step ${getStepClass(ContractStatus.Active)}`}>
            <div className="clm-step-circle">5</div>
            <div className="clm-step-label">Hiệu lực</div>
          </div>
        </div>
      </div>

      {/* Key Specifications Grid */}
      <div className="clm-form-section">
        <h4 className="clm-section-title">
          <span>📑</span> Chi Tiết Điều Khoản & Dữ Liệu Hợp Đồng
        </h4>

        <div className="clm-form-row" style={{ gap: 24 }}>
          <div className="clm-card" style={{ padding: 18, background: '#f8fafc' }}>
            <span className="clm-field-label">Phân Loại Hợp Đồng</span>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-slate-900)' }}>
              {contract.contractTypeName}
            </div>
            <span style={{ fontSize: 12, color: 'var(--color-slate-500)', marginTop: 4, display: 'block' }}>
              Mẫu áp dụng: Phiên bản v{contract.templateVersionNumber}
            </span>
          </div>

          <div className="clm-card" style={{ padding: 18, background: '#f8fafc' }}>
            <span className="clm-field-label">Giá Trị Cam Kết</span>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#059669' }}>
              {formatCurrency(contract.value)}
            </div>
            <span style={{ fontSize: 12, color: 'var(--color-slate-500)', marginTop: 4, display: 'block' }}>
              Chưa bao gồm các phụ lục gia hạn
            </span>
          </div>

          <div className="clm-card" style={{ padding: 18, background: '#f8fafc' }}>
            <span className="clm-field-label">Thời Hạn Bắt Đầu (Effective)</span>
            <div style={{ fontSize: 15, fontWeight: 700 }}>
              📅 {new Date(contract.effectiveDate).toLocaleDateString('vi-VN')}
            </div>
          </div>

          <div className="clm-card" style={{ padding: 18, background: '#f8fafc' }}>
            <span className="clm-field-label">Thời Hạn Hết Hạn (Expiry)</span>
            <div style={{ fontSize: 15, fontWeight: 700 }}>
              ⏰ {new Date(contract.expiryDate).toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>

        {/* Tệp đính kèm */}
        <div style={{ marginTop: 20 }}>
          <span className="clm-field-label">Tài Liệu Hợp Đồng Đính Kèm</span>
          {contract.fileUrl ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: '#ffffff',
                border: '1px solid var(--color-slate-200)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <span style={{ fontSize: 24 }}>📄</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Tệp văn bản hợp đồng gốc</div>
                <a
                  href={contract.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 12, color: 'var(--color-primary)', textDecoration: 'none' }}
                >
                  {contract.fileUrl}
                </a>
              </div>
              <a
                href={contract.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="clm-btn clm-btn-secondary clm-btn-sm"
              >
                Mở tệp
              </a>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--color-slate-500)', fontStyle: 'italic' }}>
              Chưa đính kèm tệp văn bản PDF/Word (Người 3 sẽ cung cấp module tải tệp).
            </div>
          )}
        </div>
      </div>

      {/* Action Bar Footer */}
      <div
        style={{
          borderTop: '1px solid var(--color-slate-200)',
          paddingTop: 24,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 16
        }}
      >
        {contract.status === ContractStatus.Draft && (
          <>
            <span style={{ fontSize: 13, color: 'var(--color-slate-500)' }}>
              Kiểm tra thông tin trước khi chuyển sang bước duyệt
            </span>
            <button
              className="clm-btn clm-btn-success"
              onClick={handleSubmitForApproval}
              disabled={submitting}
            >
              {submitting ? 'Đang gửi...' : '🚀 Trình Duyệt Phê Duyệt'}
            </button>
          </>
        )}

        {contract.status === ContractStatus.PendingApproval && (
          <div
            style={{
              background: '#fef3c7',
              border: '1px solid #fde68a',
              color: '#92400e',
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: 13,
              fontWeight: 600
            }}
          >
            ⏳ Hợp đồng đang trong quy trình chờ phê duyệt (Module Người 4)
          </div>
        )}

        {contract.status === ContractStatus.Approved && (
          <div
            style={{
              background: '#dbeafe',
              border: '1px solid #bfdbfe',
              color: '#1e40af',
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: 13,
              fontWeight: 600
            }}
          >
            ✓ Hợp đồng đã được duyệt toàn bộ! Đang chờ thực hiện ký số.
          </div>
        )}
      </div>
    </div>
  );
};
