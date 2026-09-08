import React, { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
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
    <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 max-w-3xl shadow-xs">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900">
          {selectedTemplate ? `Soạn hợp đồng từ mẫu: ${selectedTemplate.contractTypeName}` : 'Soạn thảo hợp đồng mới'}
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Nhập thông tin chi tiết để khởi tạo bản ghi hợp đồng vào hệ thống
        </p>
      </div>

      {error && (
        <div className="p-3.5 mb-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Phân loại hợp đồng *
          </label>
          <select
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 shadow-xs"
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

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Tiêu đề hợp đồng *
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 shadow-xs placeholder:text-slate-400"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Hợp đồng cung cấp dịch vụ hạ tầng mạng..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Tên đối tác (Bên B)
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 shadow-xs placeholder:text-slate-400"
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
            placeholder="Tên công ty hoặc đối tác ký kết..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Giá trị hợp đồng (VNĐ) *
          </label>
          <input
            type="number"
            step="1000000"
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 shadow-xs"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
          />
          <div className="text-xs text-slate-500 mt-1">
            Quy đổi: <span className="font-semibold text-slate-800">{formatCurrency(value)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Ngày hiệu lực *
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 shadow-xs"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Ngày hết hạn *
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 shadow-xs"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Đường dẫn tệp tài liệu đính kèm (URL)
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 shadow-xs placeholder:text-slate-400"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-8 pt-5 border-t border-slate-200">
        <button
          type="button"
          className="border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm px-4 py-2 rounded-lg font-medium shadow-xs transition-colors cursor-pointer"
          onClick={onCancel}
        >
          Hủy bỏ
        </button>

        <button
          type="button"
          className="border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm px-4 py-2 rounded-lg font-medium shadow-xs transition-colors cursor-pointer"
          disabled={loading}
          onClick={() => handleSave(false)}
        >
          Lưu bản nháp
        </button>

        <button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          disabled={loading}
          onClick={() => handleSave(true)}
        >
          <Send className="w-4 h-4" />
          <span>{loading ? 'Đang lưu...' : 'Lưu & Trình duyệt'}</span>
        </button>
      </div>
    </div>
  );
};
