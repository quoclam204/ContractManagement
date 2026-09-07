import React, { useEffect, useState } from 'react';
import { contractApi } from '../services/contractApi';
import type { ContractType, TemplateVersion, ContractDetail } from '../types';
import { IconFileText } from './Icons';

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
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
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
    <div className="clm-form-container">
      <div className="clm-form-header">
        <h3 className="clm-form-title">Khởi Tạo Bản Nháp Hợp Đồng</h3>
        <p className="clm-form-desc">
          Hợp đồng sẽ được khởi tạo ở trạng thái <strong>Bản nháp (Draft)</strong>. Dữ liệu có thể điều chỉnh trước khi trình duyệt.
        </p>
      </div>

      {error && <div className="clm-alert clm-alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="clm-form-group">
          <label className="clm-form-label">Tiêu đề hợp đồng *</label>
          <input
            type="text"
            className="clm-input-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Hợp đồng Cung cấp Dịch vụ Phần mềm Quản trị"
            required
          />
        </div>

        <div className="clm-grid-2col">
          <div className="clm-form-group">
            <label className="clm-form-label">Loại hợp đồng *</label>
            <select
              className="clm-input-full"
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

          <div className="clm-form-group">
            <label className="clm-form-label">Mẫu văn bản đính kèm</label>
            <input
              type="text"
              className="clm-input-full"
              style={{ background: '#f3f4f6', color: 'var(--clm-text-muted)' }}
              value={
                selectedTemplate
                  ? `Mẫu v${selectedTemplate.version} (${selectedTemplate.contractTypeName})`
                  : 'Tự động lấy phiên bản mới nhất'
              }
              disabled
            />
          </div>
        </div>

        <div className="clm-form-group">
          <label className="clm-form-label">Giá trị hợp đồng (VNĐ) *</label>
          <input
            type="number"
            className="clm-input-full"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            min={0}
            step={1000000}
            required
          />
        </div>

        <div className="clm-grid-2col">
          <div className="clm-form-group">
            <label className="clm-form-label">Ngày bắt đầu hiệu lực *</label>
            <input
              type="date"
              className="clm-input-full"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              required
            />
          </div>

          <div className="clm-form-group">
            <label className="clm-form-label">Ngày hết hạn *</label>
            <input
              type="date"
              className="clm-input-full"
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
              color: 'var(--clm-text-muted)',
              background: '#f3f4f6',
              padding: '8px 12px',
              borderRadius: 'var(--clm-radius-sm)',
              marginBottom: 16
            }}
          >
            Thời gian hiệu lực cam kết: <strong>{days} ngày</strong> (~{(days / 30).toFixed(1)} tháng)
          </div>
        )}

        <div className="clm-form-group">
          <label className="clm-form-label">Đường dẫn tệp đính kèm (File URL)</label>
          <input
            type="url"
            className="clm-input-full"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://storage.local/contracts/hopdong.pdf (Tùy chọn)"
          />
        </div>

        <div
          style={{
            borderTop: '1px solid var(--clm-border-color)',
            paddingTop: 18,
            marginTop: 24,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10
          }}
        >
          <button type="button" className="clm-btn clm-btn-outline" onClick={onCancel} disabled={loading}>
            Hủy bỏ
          </button>
          <button type="submit" className="clm-btn clm-btn-primary" disabled={loading}>
            <IconFileText size={15} />
            <span>{loading ? 'Đang lưu...' : 'Lưu Bản Nháp Hợp Đồng'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
