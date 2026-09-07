import React, { useEffect, useState } from 'react';
import { contractApi } from '../services/contractApi';
import type { ContractType, TemplateVersion, ContractDetail } from '../types';
import {
  IconFileText,
  IconSend,
  IconBuilding,
  IconCalendar,
  IconEye,
  IconAlertCircle
} from './Icons';

interface Props {
  selectedTemplate?: TemplateVersion | null;
  onSuccess: (contract: ContractDetail) => void;
  onCancel: () => void;
}

export const ContractDraftForm: React.FC<Props> = ({ selectedTemplate, onSuccess, onCancel }) => {
  const [types, setTypes] = useState<ContractType[]>([]);
  const [contractTypeId, setContractTypeId] = useState<string>(selectedTemplate?.contractTypeId || '');
  const templateVersionId = selectedTemplate?.id || '';

  const [title, setTitle] = useState<string>(
    selectedTemplate ? `Hợp đồng ${selectedTemplate.contractTypeName}` : 'Hợp đồng Cung cấp Dịch vụ Phần mềm CLM'
  );
  const [partnerName, setPartnerName] = useState<string>('Công ty TNHH Giải Pháp Công Nghệ Toàn Cầu');
  const [value, setValue] = useState<number>(150000000);
  const [effectiveDate, setEffectiveDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState<string>(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [fileUrl, setFileUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    contractApi.getContractTypes().then((data) => {
      setTypes(data);
      if (!contractTypeId && data.length > 0) {
        setContractTypeId(data[0].id);
      }
    });
  }, []);

  const selectedTypeName = types.find((t) => t.id === contractTypeId)?.name || selectedTemplate?.contractTypeName || 'Hợp đồng';

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const calculateDays = () => {
    const start = new Date(effectiveDate);
    const end = new Date(expiryDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysTotal = calculateDays();

  const handleSave = async (submitAfterCreate: boolean) => {
    setError(null);

    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề hợp đồng.');
      return;
    }

    if (!contractTypeId) {
      setError('Vui lòng chọn loại hợp đồng.');
      return;
    }

    if (new Date(expiryDate) < new Date(effectiveDate)) {
      setError('Ngày hết hạn phải lớn hơn hoặc bằng ngày hiệu lực.');
      return;
    }

    try {
      setLoading(true);
      const newContract = await contractApi.createDraft({
        title,
        contractTypeId,
        templateVersionUsedId: templateVersionId || undefined,
        value,
        effectiveDate: new Date(effectiveDate).toISOString(),
        expiryDate: new Date(expiryDate).toISOString(),
        fileUrl: fileUrl.trim() || undefined
      });

      if (submitAfterCreate) {
        // Automatically submit for approval
        await contractApi.submitForApproval(newContract.id);
        const refreshed = await contractApi.getContractById(newContract.id);
        onSuccess(refreshed);
      } else {
        onSuccess(newContract);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tạo bản nháp hợp đồng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="clm-alert clm-alert-error">
          <IconAlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 2-Column Studio: Form Left + Live Document Preview Right */}
      <div className="clm-studio-grid">
        {/* Left Form */}
        <div className="clm-panel">
          <div className="clm-panel-header">
            <h3 className="clm-panel-title">Soạn Thảo Hợp Đồng (Bản Nháp)</h3>
            <p className="clm-panel-desc">
              Nhập các trường thông tin pháp lý, đối tác và giá trị theo chuẩn quy định của doanh nghiệp.
            </p>
          </div>

          <div className="clm-panel-body">
            <div className="clm-form-section-title">
              <IconFileText size={14} color="#2563eb" />
              <span>1. Định danh & Phân loại hợp đồng</span>
            </div>

            <div className="clm-form-group">
              <label className="clm-form-label">Phân loại hợp đồng *</label>
              <select
                className="clm-form-select"
                value={contractTypeId}
                onChange={(e) => setContractTypeId(e.target.value)}
              >
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="clm-form-group">
              <label className="clm-form-label">Tiêu đề hợp đồng *</label>
              <input
                type="text"
                className="clm-form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Hợp đồng cung cấp dịch vụ hạ tầng đám mây..."
              />
            </div>

            <div className="clm-form-section-title">
              <IconBuilding size={14} color="#2563eb" />
              <span>2. Đối tác giao dịch (Bên B)</span>
            </div>

            <div className="clm-form-group">
              <label className="clm-form-label">Tên đầy đủ của Đối tác (Bên B) *</label>
              <input
                type="text"
                className="clm-form-input"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="VD: Công ty TNHH Phát triển Phần mềm ABC"
              />
            </div>

            <div className="clm-form-section-title">
              <IconCalendar size={14} color="#2563eb" />
              <span>3. Giá trị cam kết & Thời hạn hiệu lực</span>
            </div>

            <div className="clm-form-group">
              <label className="clm-form-label">Giá trị hợp đồng (VNĐ) *</label>
              <input
                type="number"
                step="1000000"
                className="clm-form-input"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
              />
              <div style={{ fontSize: 11, color: '#059669', fontWeight: 600, marginTop: 4 }}>
                Bằng chữ / Quy đổi: {formatCurrency(value)}
              </div>
            </div>

            <div className="clm-form-grid-2">
              <div className="clm-form-group">
                <label className="clm-form-label">Ngày bắt đầu hiệu lực *</label>
                <input
                  type="date"
                  className="clm-form-input"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                />
              </div>

              <div className="clm-form-group">
                <label className="clm-form-label">Ngày đáo hạn / kết thúc *</label>
                <input
                  type="date"
                  className="clm-form-input"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
            </div>

            <div style={{ fontSize: 12, color: 'var(--clm-slate-500)', background: 'var(--clm-slate-50)', padding: '8px 12px', borderRadius: 4, border: '1px solid var(--clm-slate-200)', marginBottom: 14 }}>
              Tổng thời gian thực thi cam kết: <strong>{daysTotal} ngày</strong>.
            </div>

            <div className="clm-form-group">
              <label className="clm-form-label">Đường dẫn tài liệu đính kèm (File URL)</label>
              <input
                type="text"
                className="clm-form-input"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://storage.enterprise.corp/contracts/draft_scan.pdf"
              />
            </div>
          </div>

          <div className="clm-panel-footer">
            <button type="button" className="clm-btn clm-btn-outline" onClick={onCancel}>
              Hủy bỏ
            </button>
            <button
              type="button"
              className="clm-btn clm-btn-outline"
              disabled={loading}
              onClick={() => handleSave(false)}
            >
              Lưu bản nháp (Draft)
            </button>
            <button
              type="button"
              className="clm-btn clm-btn-primary"
              disabled={loading}
              onClick={() => handleSave(true)}
            >
              <IconSend size={14} />
              <span>{loading ? 'Đang lưu...' : 'Lưu & Trình duyệt ngay'}</span>
            </button>
          </div>
        </div>

        {/* Right Side: LIVE DOCUMENT PREVIEW */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--clm-slate-700)', textTransform: 'uppercase' }}>
              <IconEye size={14} color="#2563eb" />
              <span>Xem trước văn bản thời gian thực (Live Preview)</span>
            </div>
            <span style={{ fontSize: 11, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: 9999, fontWeight: 600 }}>
              ● Tự động đồng bộ
            </span>
          </div>

          <div className="clm-doc-preview-wrapper">
            <div className="clm-doc-paper">
              <div className="clm-doc-official-header">
                <p className="clm-doc-republic">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                <p className="clm-doc-motto">Độc lập - Tự do - Hạnh phúc</p>
                <div className="clm-doc-line" />
              </div>

              <div className="clm-doc-title">
                {title || '[TIÊU ĐỀ HỢP ĐỒNG]'}
              </div>
              <div className="clm-doc-code">
                Mã dự kiến: <strong>HD-{new Date().getFullYear()}{String(new Date().getMonth() + 1).padStart(2, '0')}-XXXX</strong> • Phân loại: {selectedTypeName}
              </div>

              <p style={{ margin: '14px 0 8px' }}>
                Hôm nay, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}, chúng tôi gồm các bên:
              </p>

              <div className="clm-doc-section-head">BÊN A (BÊN SỬ DỤNG DỊCH VỤ):</div>
              <div style={{ paddingLeft: 12, borderLeft: '2px solid var(--clm-slate-200)', marginBottom: 10 }}>
                <div><strong>CÔNG TY CỔ PHẦN CÔNG NGHỆ DOANH NGHIỆP VIỆT NAM</strong></div>
                <div>Đại diện: Ban Giám Đốc • Mã số thuế: 0102030405</div>
              </div>

              <div className="clm-doc-section-head">BÊN B (ĐỐI TÁC THỰC HIỆN):</div>
              <div style={{ paddingLeft: 12, borderLeft: '2px solid var(--clm-primary)', marginBottom: 14 }}>
                <div>Tên đối tác: <span className="clm-doc-highlight">{partnerName || '[Chưa nhập Bên B]'}</span></div>
                <div>Đại diện: Giám đốc điều hành</div>
              </div>

              <div className="clm-doc-section-head">ĐIỀU 1: GIÁ TRỊ VÀ PHƯƠNG THỨC THANH TOÁN</div>
              <p style={{ margin: '4px 0 10px' }}>
                Tổng giá trị hợp đồng được hai bên thống nhất là:{' '}
                <span className="clm-doc-highlight" style={{ background: '#bbf7d0', color: '#166534' }}>
                  {formatCurrency(value)}
                </span>
                .
              </p>

              <div className="clm-doc-section-head">ĐIỀU 2: THỜI HẠN HIỆU LỰC</div>
              <p style={{ margin: '4px 0 14px' }}>
                Hợp đồng có hiệu lực từ ngày <strong>{new Date(effectiveDate).toLocaleDateString('vi-VN')}</strong> đến hết ngày <strong>{new Date(expiryDate).toLocaleDateString('vi-VN')}</strong> (thời hạn {daysTotal} ngày).
              </p>

              <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between', textAlign: 'center', paddingTop: 14, borderTop: '1px dashed var(--clm-slate-200)' }}>
                <div style={{ width: '45%' }}>
                  <strong>ĐẠI DIỆN BÊN A</strong>
                  <div style={{ height: 40 }} />
                  <div style={{ fontSize: 11, color: 'var(--clm-slate-400)' }}>(Ký và ghi rõ họ tên)</div>
                </div>
                <div style={{ width: '45%' }}>
                  <strong>ĐẠI DIỆN BÊN B</strong>
                  <div style={{ height: 40 }} />
                  <div style={{ fontSize: 11, color: 'var(--clm-slate-400)' }}>(Ký và ghi rõ họ tên)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
