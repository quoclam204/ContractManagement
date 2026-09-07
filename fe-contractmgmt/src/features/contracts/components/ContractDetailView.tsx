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
  IconPrinter,
  IconBuilding,
  IconCalendar,
  IconLock,
  IconHistory,
  IconCheckCircle,
  IconAlertCircle
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
    setTimeout(() => setCopied(false), 1800);
  };

  const handleSubmitForApproval = async () => {
    if (!window.confirm(`Xác nhận trình duyệt hợp đồng [${contract.contractNumber}] lên cấp quản lý phê duyệt?`)) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await contractApi.submitForApproval(contract.id);
      setMessage('Trình duyệt thành công! Hợp đồng đã chuyển sang trạng thái "Chờ phê duyệt".');
      const updated = await contractApi.getContractById(contract.id);
      onRefresh(updated);
    } catch (err: any) {
      setError(err.message || 'Không thể trình duyệt hợp đồng.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const calculateDaysRemaining = () => {
    const end = new Date(contract.expiryDate);
    const now = new Date();
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysLeft = calculateDaysRemaining();

  const isDraft = contract.status === ContractStatus.Draft;

  // Stepper state helper
  const isPassed = (step: number) => contract.status > step;
  const isActive = (step: number) => contract.status === step;

  return (
    <div>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button className="clm-btn clm-btn-outline clm-btn-sm" onClick={onBack}>
          <IconArrowLeft size={14} />
          <span>Quay lại danh sách</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="clm-btn clm-btn-outline clm-btn-sm" onClick={handlePrint}>
            <IconPrinter size={14} />
            <span>In / Xuất PDF</span>
          </button>

          {isDraft && (
            <button
              className="clm-btn clm-btn-primary clm-btn-sm"
              disabled={submitting}
              onClick={handleSubmitForApproval}
            >
              <IconSend size={14} />
              <span>{submitting ? 'Đang gửi...' : 'Trình Duyệt Lên Cấp Quản Lý'}</span>
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="clm-alert clm-alert-success">
          <IconCheckCircle size={18} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="clm-alert clm-alert-error">
          <IconAlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Contract Executive Header Card */}
      <div className="clm-panel" style={{ marginBottom: 24 }}>
        <div className="clm-panel-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div className="clm-code-pill">
                <span>{contract.contractNumber}</span>
                <button type="button" className="clm-btn-copy" onClick={handleCopyCode} title="Sao chép số hợp đồng">
                  {copied ? <IconCheck size={13} color="#059669" /> : <IconCopy size={13} />}
                </button>
              </div>
              <ContractBadge status={contract.status} />
              <span className="clm-badge-version">
                Phân loại: {contract.contractTypeName}
              </span>
            </div>

            <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: 'var(--clm-slate-900)' }}>
              {contract.title}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 13, color: 'var(--clm-slate-600)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconBuilding size={14} color="#64748b" />
                <span>Đối tác: <strong>{contract.partnerName || 'Chưa định danh'}</strong></span>
              </div>
              <div>
                Người tạo: <strong>{contract.ownerName}</strong>
              </div>
              <div>
                Ngày khởi tạo: <strong>{new Date(contract.createdAt).toLocaleDateString('vi-VN')}</strong>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--clm-slate-500)', textTransform: 'uppercase' }}>
              Tổng Giá Trị Hợp Đồng
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#059669', fontFamily: 'var(--clm-font-mono)' }}>
              {formatCurrency(contract.value)}
            </div>
            <div style={{ fontSize: 11, color: daysLeft > 0 ? '#059669' : '#dc2626', marginTop: 4, fontWeight: 600 }}>
              {daysLeft > 0 ? `Hiệu lực còn ${daysLeft} ngày` : 'Hợp đồng đã quá hạn'}
            </div>
          </div>
        </div>
      </div>

      {/* Contract Lifecycle & State Machine Visualizer */}
      <div className="clm-lifecycle-container">
        <div className="clm-lifecycle-header">
          <div className="clm-lifecycle-title">
            <IconHistory size={16} color="#2563eb" />
            <span>Tiến trình vòng đời hợp đồng (Contract Lifecycle State Machine)</span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--clm-slate-500)' }}>
            Quản trị trạng thái theo chuẩn Domain-Driven Design
          </span>
        </div>

        <div className="clm-stepper-track">
          {/* Step 0: Draft */}
          <div className={`clm-stepper-node ${isPassed(0) ? 'passed' : isActive(0) ? 'active' : ''}`}>
            <div className="clm-stepper-circle">{isPassed(0) ? '✓' : '1'}</div>
            <div className="clm-stepper-label">1. Bản nháp</div>
          </div>
          <div className={`clm-stepper-connector ${isPassed(0) ? 'passed' : ''}`} />

          {/* Step 1: PendingApproval */}
          <div className={`clm-stepper-node ${isPassed(1) ? 'passed' : isActive(1) ? 'active' : ''}`}>
            <div className="clm-stepper-circle">{isPassed(1) ? '✓' : '2'}</div>
            <div className="clm-stepper-label">2. Chờ phê duyệt</div>
          </div>
          <div className={`clm-stepper-connector ${isPassed(1) ? 'passed' : ''}`} />

          {/* Step 2: Approved */}
          <div className={`clm-stepper-node ${isPassed(2) ? 'passed' : isActive(2) ? 'active' : ''}`}>
            <div className="clm-stepper-circle">{isPassed(2) ? '✓' : '3'}</div>
            <div className="clm-stepper-label">3. Đã phê duyệt</div>
          </div>
          <div className={`clm-stepper-connector ${isPassed(2) ? 'passed' : ''}`} />

          {/* Step 3: Signed */}
          <div className={`clm-stepper-node ${isPassed(3) ? 'passed' : isActive(3) ? 'active' : ''}`}>
            <div className="clm-stepper-circle">{isPassed(3) ? '✓' : '4'}</div>
            <div className="clm-stepper-label">4. Đã ký số</div>
          </div>
          <div className={`clm-stepper-connector ${isPassed(3) ? 'passed' : ''}`} />

          {/* Step 4: Active */}
          <div className={`clm-stepper-node ${isPassed(4) ? 'passed' : isActive(4) ? 'active' : ''}`}>
            <div className="clm-stepper-circle">{isPassed(4) ? '✓' : '5'}</div>
            <div className="clm-stepper-label">5. Đang hiệu lực</div>
          </div>
          <div className={`clm-stepper-connector ${isPassed(4) ? 'passed' : ''}`} />

          {/* Step 7: Terminated */}
          <div className={`clm-stepper-node ${isActive(7) ? 'active' : ''}`}>
            <div className="clm-stepper-circle">{isActive(7) ? '✓' : '6'}</div>
            <div className="clm-stepper-label">6. Thanh lý / Kết thúc</div>
          </div>
        </div>
      </div>

      {/* 2-Column Detail: Technical Parameters + System Audit Info */}
      <div className="clm-studio-grid">
        {/* Left Column: Specifications */}
        <div className="clm-panel">
          <div className="clm-panel-header">
            <h4 className="clm-panel-title">Thông Số Pháp Lý & Điều Khoản</h4>
            <p className="clm-panel-desc">Chi tiết các điều khoản cam kết đã ghi nhận vào cơ sở dữ liệu.</p>
          </div>

          <div className="clm-panel-body" style={{ fontSize: 13 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', rowGap: 14, columnGap: 16 }}>
              <div style={{ color: 'var(--clm-slate-500)', fontWeight: 600 }}>Mã định danh hệ thống:</div>
              <div style={{ fontFamily: 'var(--clm-font-mono)', fontSize: 12 }}>{contract.id}</div>

              <div style={{ color: 'var(--clm-slate-500)', fontWeight: 600 }}>Thời hạn cam kết:</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconCalendar size={14} color="#64748b" />
                <span>
                  {new Date(contract.effectiveDate).toLocaleDateString('vi-VN')} đến{' '}
                  {new Date(contract.expiryDate).toLocaleDateString('vi-VN')}
                </span>
              </div>

              <div style={{ color: 'var(--clm-slate-500)', fontWeight: 600 }}>Tài liệu đính kèm:</div>
              <div>
                {contract.fileUrl ? (
                  <a href={contract.fileUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--clm-primary)', textDecoration: 'none', fontWeight: 600 }}>
                    {contract.fileUrl}
                  </a>
                ) : (
                  <span style={{ color: 'var(--clm-slate-400)' }}>Chưa tải lên tệp đính kèm</span>
                )}
              </div>

              <div style={{ color: 'var(--clm-slate-500)', fontWeight: 600 }}>Mẫu áp dụng:</div>
              <div>
                {contract.templateVersionUsedId ? (
                  <span className="clm-badge-version">Mẫu v2.0 ({contract.templateVersionUsedId})</span>
                ) : (
                  <span style={{ color: 'var(--clm-slate-400)' }}>Soạn thảo tùy chỉnh</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Audit Trail & Concurrency Lock */}
        <div className="clm-panel">
          <div className="clm-panel-header">
            <h4 className="clm-panel-title">Lịch Sử Kiểm Toán & Toàn Vẹn Dữ Liệu</h4>
            <p className="clm-panel-desc">Kiểm soát xung đột và dấu vết bảo mật hệ thống.</p>
          </div>

          <div className="clm-panel-body" style={{ fontSize: 13 }}>
            {/* RowVersion Concurrency Lock */}
            <div style={{ background: 'var(--clm-slate-50)', border: '1px solid var(--clm-slate-200)', borderRadius: 6, padding: '12px 14px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--clm-slate-800)', fontSize: 12, marginBottom: 4 }}>
                <IconLock size={14} color="#2563eb" />
                <span>Khóa Lạc Quan (Optimistic Concurrency Control)</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--clm-slate-600)', lineHeight: 1.4 }}>
                Mã băm RowVersion: <code style={{ fontFamily: 'var(--clm-font-mono)', color: 'var(--clm-primary)' }}>{contract.rowVersion || '0x000000000001B4'}</code>
              </div>
              <div style={{ fontSize: 11, color: 'var(--clm-slate-400)', marginTop: 4 }}>
                Đảm bảo ngăn chặn xung đột ghi đè đồng thời khi nhiều chuyên viên cùng xử lý.
              </div>
            </div>

            {/* Audit Trail Timeline */}
            <div style={{ borderLeft: '2px solid var(--clm-slate-200)', paddingLeft: 16, marginLeft: 6 }}>
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <div style={{ position: 'absolute', left: -22, top: 2, width: 10, height: 10, borderRadius: '50%', background: 'var(--clm-primary)' }} />
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clm-slate-900)' }}>
                  Khởi tạo bản nháp (Draft Created)
                </div>
                <div style={{ fontSize: 11, color: 'var(--clm-slate-500)', marginTop: 2 }}>
                  Bởi <strong>{contract.ownerName}</strong> lúc {new Date(contract.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>

              {contract.status >= ContractStatus.PendingApproval && (
                <div style={{ position: 'relative', marginBottom: 16 }}>
                  <div style={{ position: 'absolute', left: -22, top: 2, width: 10, height: 10, borderRadius: '50%', background: '#d97706' }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clm-slate-900)' }}>
                    Trình duyệt phê duyệt (Submitted for Approval)
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--clm-slate-500)', marginTop: 2 }}>
                    Chuyển sang trạng thái thẩm định bởi cấp quản lý
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
