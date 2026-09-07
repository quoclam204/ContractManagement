import React, { useEffect, useState } from 'react';
import { RefreshCw, Plus } from 'lucide-react';
import { contractApi } from '../services/contractApi';
import type { TemplateVersion } from '../types';

interface Props {
  onSelectTemplate: (template: TemplateVersion) => void;
}

export const TemplateList: React.FC<Props> = ({ onSelectTemplate }) => {
  const [templates, setTemplates] = useState<TemplateVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contractApi.getActiveTemplates();
      setTemplates(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách mẫu hợp đồng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-sm text-slate-500 shadow-xs">
        Đang tải danh sách mẫu hợp đồng...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3.5 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Kho Mẫu Hợp Đồng</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Các biểu mẫu chuẩn hóa hỗ trợ tự động điền và tạo lập hợp đồng nhanh chóng
          </p>
        </div>
        <button
          type="button"
          className="border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm px-3.5 py-2 rounded-lg font-medium shadow-xs transition-colors flex items-center gap-1.5 bg-white cursor-pointer"
          onClick={fetchTemplates}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Làm mới</span>
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-sm text-slate-500 shadow-xs">
          Chưa có mẫu hợp đồng nào trong kho lưu trữ.
        </div>
      ) : (
        <div className="border border-slate-200 bg-white rounded-xl shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200">
                <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Loại Hợp Đồng
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Phiên Bản
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Mô Tả Tiêu Chuẩn
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Ngày Ban Hành
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">
                  Thao Tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {templates.map((tpl) => (
                <tr key={tpl.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {tpl.contractTypeName}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                      v{tpl.version}.0
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    Mẫu hợp đồng chuẩn hóa do Pháp chế ban hành, có hiệu lực sử dụng.
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-xs whitespace-nowrap">
                    {new Date(tpl.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-xs transition-colors cursor-pointer"
                      onClick={() => onSelectTemplate(tpl)}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Dùng mẫu</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
