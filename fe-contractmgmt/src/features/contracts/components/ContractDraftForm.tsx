import React, { useEffect, useState } from 'react';
import { contractApi } from '../services/contractApi';
import type { ContractType, TemplateVersion, ContractDetail } from '../types';
import { IconSend } from './Icons';

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
  const [partnerName, setPartnerName] = useState<string>('');
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

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val) + ' ₫';
  };

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
    <div className="form-card">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {selectedTemplate ? `Tạo hợp đồng theo mẫu: ${selectedTemplate.contractTypeName}` : 'Soạn thảo hợp đồng mới'}
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)' }}>
          Nhập các thông số cơ bản để khởi tạo hợp đồng vào hệ thống.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label className="form-label">Phân loại hợp đồng *</label>
        <select
          className="form-select"
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

      <div className="form-group">
        <label className="form-label">Tiêu đề hợp đồng *</label>
        <input
          type="text"
          className="form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nhập tiêu đề hợp đồng..."
        />
      </div>

      <div className="form-group">
        <label className="form-label">Tên đối tác (Bên B)</label>
        <input
          type="text"
          className="form-input"
          value={partnerName}
          onChange={(e) => setPartnerName(e.target.value)}
          placeholder="Nhập tên công ty hoặc tổ chức đối tác..."
        />
      </div>

      <div className="form-group">
        <label className="form-label">Giá trị hợp đồng (VNĐ) *</label>
        <input
          type="number"
          step="1000000"
          className="form-input"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
        />
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
          Tương đương: <strong>{formatCurrency(value)}</strong>
        </div>
      </div>

      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">Ngày hiệu lực *</label>
          <input
            type="date"
            className="form-input"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Ngày hết hạn *</label>
          <input
            type="date"
            className="form-input"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Đường dẫn tệp đính kèm (nếu có)</label>
        <input
          type="text"
          className="form-input"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Hủy bỏ
        </button>
        <button
          type="button"
          className="btn btn-outline"
          disabled={loading}
          onClick={() => handleSave(false)}
        >
          Lưu bản nháp
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={loading}
          onClick={() => handleSave(true)}
        >
          <IconSend size={13} />
          <span>{loading ? 'Đang lưu...' : 'Lưu & Trình duyệt'}</span>
        </button>
      </div>
    </div>
  );
};
