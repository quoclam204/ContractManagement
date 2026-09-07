import React, { useEffect, useState } from 'react';
import { contractApi } from '../services/contractApi';
import type { ContractType, TemplateVersion, ContractDetail } from '../types';

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
    selectedTemplate ? `Hợp đồng ${selectedTemplate.contractTypeName}` : ''
  );
  const [value, setValue] = useState<number>(100000000);
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

  const calculateDays = () => {
    const start = new Date(effectiveDate);
    const end = new Date(expiryDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return null;
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const days = calculateDays();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      onSuccess(newContract);
    } catch (err: any) {
      setError(err.message || 'Không thể tạo bản nháp hợp đồng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clm-form-card">
      <div style={{ borderBottom: '1px solid var(--color-slate-200)', paddingBottom: 16, marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800, color: 'var(--color-slate-900)' }}>
          ✍️ Soạn Thảo Bản Nháp Hợp Đồng Mới
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-slate-500)' }}>
          Hợp đồng sẽ được khởi tạo ở trạng thái <strong>Bản nháp (Draft)</strong>. Bạn có thể chỉnh sửa tự do trước khi bấm Trình duyệt.
        </p>
      </div>

      {error && <div className="clm-alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Section 1 */}
        <div className="clm-form-section">
          <div className="clm-section-title">
            <span>📌</span> 1. Thông Tin Nhận Diện & Loại Hợp Đồng
          </div>

          <div className="clm-field">
            <label className="clm-field-label">Tiêu đề hợp đồng *</label>
            <input
              type="text"
              className="clm-field-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Hợp đồng Cung cấp Dịch vụ Phần mềm Cloud"
              required
            />
          </div>

          <div className="clm-form-row">
            <div className="clm-field">
              <label className="clm-field-label">Loại hợp đồng *</label>
              <select
                className="clm-field-select"
                value={contractTypeId}
                onChange={(e) => setContractTypeId(e.target.value)}
                required
              >
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="clm-field">
              <label className="clm-field-label">Mẫu văn bản áp dụng</label>
              <input
                type="text"
                className="clm-field-input"
                style={{ background: '#f8fafc', color: 'var(--color-slate-600)' }}
                value={
                  selectedTemplate
                    ? `Mẫu v${selectedTemplate.version} (${selectedTemplate.contractTypeName})`
                    : 'Tự động lấy phiên bản mới nhất'
                }
                disabled
              />
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="clm-form-section">
          <div className="clm-section-title">
            <span>💰</span> 2. Giá Trị & Thời Hạn Hiệu Lực
          </div>

          <div className="clm-field">
            <label className="clm-field-label">Giá trị hợp đồng (VNĐ) *</label>
            <input
              type="number"
              className="clm-field-input"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              min={0}
              step={1000000}
              required
            />
          </div>

          <div className="clm-form-row">
            <div className="clm-field">
              <label className="clm-field-label">Ngày bắt đầu hiệu lực *</label>
              <input
                type="date"
                className="clm-field-input"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                required
              />
            </div>

            <div className="clm-field">
              <label className="clm-field-label">Ngày hết hạn *</label>
              <input
                type="date"
                className="clm-field-input"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
              />
            </div>
          </div>

          {days !== null && (
            <div
              style={{
                fontSize: 12,
                color: 'var(--color-slate-600)',
                background: '#f1f5f9',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 16
              }}
            >
              ⏱️ Thời gian hiệu lực dự kiến: <strong>{days} ngày</strong> (~{(days / 30).toFixed(1)} tháng)
            </div>
          )}

          <div className="clm-field">
            <label className="clm-field-label">Đường dẫn tệp đính kèm (File URL)</label>
            <input
              type="url"
              className="clm-field-input"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://storage.local/contracts/hopdong.pdf (Tùy chọn)"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            borderTop: '1px solid var(--color-slate-200)',
            paddingTop: 20,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12
          }}
        >
          <button type="button" className="clm-btn clm-btn-secondary" onClick={onCancel} disabled={loading}>
            Hủy bỏ
          </button>
          <button type="submit" className="clm-btn clm-btn-primary" disabled={loading}>
            {loading ? 'Đang xử lý...' : '💾 Lưu Bản Nháp Hợp Đồng'}
          </button>
        </div>
      </form>
    </div>
  );
};
