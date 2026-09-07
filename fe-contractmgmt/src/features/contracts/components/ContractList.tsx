import React, { useEffect, useState } from 'react';
import { contractApi } from '../services/contractApi';
import { ContractStatus } from '../types';
import type { ContractListItem } from '../types';
import { ContractBadge } from './ContractBadge';
import {
  IconSearch,
  IconRefresh,
  IconPlus,
  IconFileText,
  IconCopy,
  IconCheck,
  IconDownload,
  IconBuilding,
  IconCalendar
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
    setTimeout(() => setCopiedId(null), 1800);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const calculateDaysRemaining = (expiryDate: string) => {
    const end = new Date(expiryDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Export to CSV with UTF-8 BOM for Microsoft Excel compatibility
  const handleExportCSV = () => {
    if (contracts.length === 0) {
      alert('Không có dữ liệu để xuất file.');
      return;
    }

    const headers = ['Mã Hợp Đồng', 'Tiêu Đề', 'Đối Tác', 'Loại Hợp Đồng', 'Giá Trị (VNĐ)', 'Ngày Hiệu Lực', 'Ngày Hết Hạn', 'Trạng Thái'];
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
    link.setAttribute('download', `Danh_Sach_Hop_Dong_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="clm-table-container">
        {/* Filter and Command Bar */}
        <div className="clm-filter-bar">
          <form onSubmit={handleSearchSubmit} className="clm-search-box">
            <IconSearch size={15} color="#94a3b8" />
            <input
              type="text"
              className="clm-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo số HĐ, tiêu đề hoặc đối tác..."
            />
          </form>

          {/* Quick Filter Chips */}
          <div className="clm-quick-filters">
            <button
              type="button"
              className={`clm-filter-chip ${statusFilter === '' ? 'active' : ''}`}
              onClick={() => setStatusFilter('')}
            >
              Tất cả
            </button>
            <button
              type="button"
              className={`clm-filter-chip ${statusFilter === String(ContractStatus.Draft) ? 'active' : ''}`}
              onClick={() => setStatusFilter(String(ContractStatus.Draft))}
            >
              Bản nháp
            </button>
            <button
              type="button"
              className={`clm-filter-chip ${statusFilter === String(ContractStatus.PendingApproval) ? 'active' : ''}`}
              onClick={() => setStatusFilter(String(ContractStatus.PendingApproval))}
            >
              Chờ phê duyệt
            </button>
            <button
              type="button"
              className={`clm-filter-chip ${statusFilter === String(ContractStatus.Active) ? 'active' : ''}`}
              onClick={() => setStatusFilter(String(ContractStatus.Active))}
            >
              Đang hiệu lực
            </button>
            <button
              type="button"
              className={`clm-filter-chip ${statusFilter === String(ContractStatus.Terminated) ? 'active' : ''}`}
              onClick={() => setStatusFilter(String(ContractStatus.Terminated))}
            >
              Đã thanh lý
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="clm-btn clm-btn-outline clm-btn-sm" onClick={handleExportCSV} title="Xuất file Excel CSV">
              <IconDownload size={14} />
              <span>Xuất CSV</span>
            </button>

            <button className="clm-btn clm-btn-outline clm-btn-sm" onClick={fetchContracts} title="Làm mới danh sách">
              <IconRefresh size={14} />
              <span>Làm mới</span>
            </button>

            <button className="clm-btn clm-btn-primary clm-btn-sm" onClick={onCreateNew}>
              <IconPlus size={14} />
              <span>Tạo hợp đồng</span>
            </button>
          </div>
        </div>

        {error && <div className="clm-alert clm-alert-error">{error}</div>}

        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--clm-slate-500)', fontSize: 13 }}>
            <div style={{ marginBottom: 8 }}>Đang truy vấn cơ sở dữ liệu hợp đồng...</div>
          </div>
        ) : contracts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 20px' }}>
            <div style={{ color: 'var(--clm-slate-300)', marginBottom: 14 }}>
              <IconFileText size={48} />
            </div>
            <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: 'var(--clm-slate-900)' }}>
              Không tìm thấy hợp đồng nào
            </h4>
            <p style={{ color: 'var(--clm-slate-500)', margin: '0 0 18px', fontSize: 13, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
              Chưa có dữ liệu nào khớp với tiêu chí tìm kiếm hoặc trạng thái lọc đã chọn.
            </p>
            <button className="clm-btn clm-btn-primary" onClick={onCreateNew}>
              <IconPlus size={15} />
              <span>Khởi tạo hợp đồng mới</span>
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="clm-data-table">
              <thead>
                <tr>
                  <th style={{ width: 160 }}>Số Hợp Đồng</th>
                  <th>Tiêu Đề & Đối Tác (Bên B)</th>
                  <th style={{ width: 150 }}>Phân Loại HĐ</th>
                  <th style={{ width: 150, textAlign: 'right' }}>Giá Trị Hợp Đồng</th>
                  <th style={{ width: 190 }}>Thời Hạn Hiệu Lực</th>
                  <th style={{ width: 140 }}>Trạng Thái</th>
                  <th style={{ width: 110, textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((c) => {
                  const daysLeft = calculateDaysRemaining(c.expiryDate);
                  const isCopied = copiedId === c.id;

                  return (
                    <tr
                      key={c.id}
                      onClick={() => onSelectContract(c.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div className="clm-code-pill" title="Click icon để copy">
                          <span>{c.contractNumber}</span>
                          <button
                            type="button"
                            className="clm-btn-copy"
                            onClick={(e) => handleCopy(e, c.contractNumber, c.id)}
                            title="Sao chép số hợp đồng"
                          >
                            {isCopied ? <IconCheck size={13} color="#059669" /> : <IconCopy size={13} />}
                          </button>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--clm-slate-900)', fontSize: 13, marginBottom: 3 }}>
                          {c.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--clm-slate-500)' }}>
                          <IconBuilding size={13} color="#64748b" />
                          <span>{c.partnerName || 'Chưa định danh đối tác'}</span>
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--clm-slate-700)' }}>
                          {c.contractTypeName}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <span style={{ fontFamily: 'var(--clm-font-mono)', fontWeight: 700, color: 'var(--clm-slate-900)', fontSize: 13 }}>
                          {formatCurrency(c.value)}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--clm-slate-700)' }}>
                          <IconCalendar size={13} color="#64748b" />
                          <span>
                            {new Date(c.effectiveDate).toLocaleDateString('vi-VN')} → {new Date(c.expiryDate).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: daysLeft > 30 ? 'var(--clm-slate-400)' : '#d97706', marginTop: 2 }}>
                          {daysLeft > 0 ? `Còn ${daysLeft} ngày` : 'Đã hết hạn'}
                        </div>
                      </td>

                      <td>
                        <ContractBadge status={c.status} />
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="clm-btn clm-btn-outline clm-btn-sm"
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

        {/* Table Footer */}
        <div className="clm-table-footer">
          <div>
            Tổng số: <strong>{contracts.length}</strong> hợp đồng trong hệ thống
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Đang xem trang 1 / 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
