import React, { useEffect, useState } from 'react';
import { contractApi } from '../services/contractApi';
import { ContractStatus } from '../types';
import type { ContractListItem } from '../types';
import { ContractBadge } from './ContractBadge';
import {
  IconSearch,
  IconRefresh,
  IconPlus,
  IconCopy,
  IconCheck,
  IconDownload
} from './Icons';

interface Props {
  onSelectContract: (id: string) => void;
  onCreateNew: () => void;
}

export const ContractList: React.FC<Props> = ({ onSelectContract, onCreateNew }) => {
  const [contracts, setContracts] = useState<ContractListItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await contractApi.getContracts({
        status: statusFilter !== '' ? (Number(statusFilter) as ContractStatus) : undefined,
        search: search.trim() || undefined
      });
      setContracts(res.items);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách hợp đồng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContracts();
  };

  const handleCopy = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val) + ' ₫';
  };

  const handleExportCSV = () => {
    if (contracts.length === 0) {
      alert('Không có dữ liệu để xuất file.');
      return;
    }

    const headers = ['Số Hợp Đồng', 'Tiêu Đề', 'Đối Tác', 'Loại HĐ', 'Giá Trị (VNĐ)', 'Ngày Hiệu Lực', 'Ngày Hết Hạn', 'Trạng Thái'];
    const rows = contracts.map((c) => [
      `"${c.contractNumber}"`,
      `"${c.title.replace(/"/g, '""')}"`,
      `"${(c.partnerName || '').replace(/"/g, '""')}"`,
      `"${c.contractTypeName}"`,
      c.value,
      `"${new Date(c.effectiveDate).toLocaleDateString('vi-VN')}"`,
      `"${new Date(c.expiryDate).toLocaleDateString('vi-VN')}"`,
      c.status
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Danh_sach_hop_dong_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Toolbar: Search input, status dropdown, Export and Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex flex-1 items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-72 sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <IconSearch size={15} />
            </span>
            <input
              type="text"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400 shadow-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo số HĐ, tiêu đề, đối tác..."
            />
          </form>

          <select
            className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 shadow-xs cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value={ContractStatus.Draft}>Bản nháp</option>
            <option value={ContractStatus.PendingApproval}>Chờ phê duyệt</option>
            <option value={ContractStatus.Approved}>Đã duyệt</option>
            <option value={ContractStatus.Signed}>Đã ký số</option>
            <option value={ContractStatus.Active}>Đang hiệu lực</option>
            <option value={ContractStatus.Expiring}>Sắp hết hạn</option>
            <option value={ContractStatus.Terminated}>Đã thanh lý</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm px-3.5 py-2 rounded-lg font-medium shadow-xs transition-colors flex items-center gap-1.5 bg-white cursor-pointer"
            onClick={handleExportCSV}
            title="Xuất file CSV"
          >
            <IconDownload size={14} />
            <span>Xuất CSV</span>
          </button>

          <button
            type="button"
            className="border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm px-3.5 py-2 rounded-lg font-medium shadow-xs transition-colors flex items-center gap-1.5 bg-white cursor-pointer"
            onClick={fetchContracts}
            title="Làm mới"
          >
            <IconRefresh size={14} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Đang tải dữ liệu hợp đồng...
          </div>
        ) : contracts.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-sm text-slate-500 mb-3">
              Không tìm thấy hợp đồng nào phù hợp với bộ lọc hiện tại.
            </p>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-medium shadow-xs transition-colors cursor-pointer"
              onClick={onCreateNew}
            >
              <IconPlus size={13} />
              <span>Tạo hợp đồng mới</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200">
                  <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                    Số Hợp Đồng
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Tiêu Đề Hợp Đồng
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Đối Tác
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Phân Loại
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">
                    Giá Trị
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Thời Hạn
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Trạng Thái
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contracts.map((c) => {
                  const isCopied = copiedId === c.id;

                  return (
                    <tr
                      key={c.id}
                      onClick={() => onSelectContract(c.id)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200 text-slate-700 whitespace-nowrap inline-flex items-center gap-1.5">
                          {c.contractNumber}
                          <button
                            type="button"
                            className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer p-0.5"
                            onClick={(e) => handleCopy(e, c.contractNumber, c.id)}
                            title="Sao chép số hợp đồng"
                          >
                            {isCopied ? <IconCheck size={13} color="#10b981" /> : <IconCopy size={13} />}
                          </button>
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 line-clamp-1">
                          {c.title}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {c.partnerName || '—'}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {c.contractTypeName}
                      </td>

                      <td className="py-3 px-4 text-right font-semibold text-slate-900 whitespace-nowrap">
                        {formatCurrency(c.value)}
                      </td>

                      <td className="py-3 px-4 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(c.effectiveDate).toLocaleDateString('vi-VN')} – {new Date(c.expiryDate).toLocaleDateString('vi-VN')}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <ContractBadge status={c.status} />
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectContract(c.id);
                          }}
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info */}
        <div className="py-3 px-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Tổng số: <strong>{contracts.length}</strong> hợp đồng</span>
          <span>Trang 1 / 1</span>
        </div>
      </div>
    </div>
  );
};
