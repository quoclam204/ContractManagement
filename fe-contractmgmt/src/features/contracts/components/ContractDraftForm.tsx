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
    <div className="clm-card" style={{ maxWidth: 720, margin: '0 auto' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700 }}>
        ✍️ Soạn Thảo Bản Nháp Hợp Đồng Mới
      </h3>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--clm-text-muted)' }}>
        Hợp đồng sẽ được khởi tạo ở trạng thái <strong>Bản nháp (Draft)</strong>. Bạn có thể chỉnh sửa tự do trước khi bấm Trình duyệt.
      </p>

      {error && <div className="clm-alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="clm-form-group">
          <label className="clm-label">Tiêu đề hợp đồng *</label>
          <input
            type="text"
            className="clm-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Hợp đồng Cung cấp Dịch vụ Phần mềm Cloud"
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="clm-form-group">
            <label className="clm-label">Loại hợp đồng *</label>
            <select
              className="clm-select"
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
            <label className="clm-label">Giá trị hợp đồng (VNĐ) *</label>
            <input
              type="number"
              className="clm-input"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              min={0}
              step={1000000}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="clm-form-group">
            <label className="clm-label">Ngày hiệu lực *</label>
            <input
              type="date"
              className="clm-input"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              required
            />
          </div>

          <div className="clm-form-group">
            <label className="clm-label">Ngày hết hạn *</label>
            <input
              type="date"
              className="clm-input"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="clm-form-group">
          <label className="clm-label">Đường dẫn tệp đính kèm (File URL)</label>
          <input
            type="url"
            className="clm-input"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://storage.local/contracts/hopdong.pdf (Tùy chọn)"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
          <button type="button" className="clm-btn clm-btn-secondary" onClick={onCancel} disabled={loading}>
            Hủy bỏ
          </button>
          <button type="submit" className="clm-btn clm-btn-primary" disabled={loading}>
            {loading ? 'Đang lưu...' : '💾 Lưu Bản Nháp'}
          </button>
        </div>
      </form>
    </div>
  );
};
