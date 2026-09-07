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
      {/* 1-Row Filter Bar */}
      <div className="filter-row">
        <div className="filter-left">
          <form onSubmit={handleSearchSubmit} className="search-input-wrap">
            <span className="search-icon">
              <IconSearch size={14} />
            </span>
            <input
              type="text"
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo số HĐ, tiêu đề hoặc đối tác..."
            />
          </form>

          <select
            className="status-dropdown"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value={ContractStatus.Draft}>Bản nháp</option>
            <option value={ContractStatus.PendingApproval}>Chờ phê duyệt</option>
            <option value={ContractStatus.Approved}>Đã duyệt</option>
            <option value={ContractStatus.Signed}>Đã ký</option>
            <option value={ContractStatus.Active}>Đang hiệu lực</option>
            <option value={ContractStatus.Expiring}>Sắp hết hạn</option>
            <option value={ContractStatus.Terminated}>Đã thanh lý</option>
          </select>
        </div>

        <div className="filter-right">
          <button type="button" className="btn btn-outline btn-sm" onClick={handleExportCSV} title="Xuất file CSV">
            <IconDownload size={13} />
            <span>Xuất CSV</span>
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={fetchContracts} title="Làm mới">
            <IconRefresh size={13} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
            Đang tải dữ liệu hợp đồng...
          </div>
        ) : contracts.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 12px', color: 'var(--color-text-muted)', fontSize: 13 }}>
              Không tìm thấy hợp đồng nào phù hợp.
            </p>
            <button type="button" className="btn btn-primary btn-sm" onClick={onCreateNew}>
              <IconPlus size={13} />
              <span>Tạo hợp đồng mới</span>
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 160 }}>Số Hợp Đồng</th>
                <th>Tiêu Đề Hợp Đồng</th>
                <th>Đối Tác</th>
                <th>Phân Loại</th>
                <th style={{ textAlign: 'right' }}>Giá Trị</th>
                <th>Thời Hạn</th>
                <th>Trạng Thái</th>
                <th style={{ width: 80, textAlign: 'right' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => {
                const isCopied = copiedId === c.id;

                return (
                  <tr
                    key={c.id}
                    onClick={() => onSelectContract(c.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <span className="code-tag" title="Click để sao chép">
                        {c.contractNumber}
                        <button
                          type="button"
                          className="btn-copy-code"
                          onClick={(e) => handleCopy(e, c.contractNumber, c.id)}
                          title="Sao chép số hợp đồng"
                        >
                          {isCopied ? <IconCheck size={12} color="#10b981" /> : <IconCopy size={12} />}
                        </button>
                      </span>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {c.title}
                      </div>
                    </td>

                    <td>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
                        {c.partnerName || '—'}
                      </span>
                    </td>

                    <td>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
                        {c.contractTypeName}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {formatCurrency(c.value)}
                    </td>

                    <td style={{ fontSize: 12, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(c.effectiveDate).toLocaleDateString('vi-VN')} – {new Date(c.expiryDate).toLocaleDateString('vi-VN')}
                    </td>

                    <td>
                      <ContractBadge status={c.status} />
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
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
        )}

        {/* Footer info */}
        <div className="table-footer">
          <span>Tổng số: <strong>{contracts.length}</strong> hợp đồng</span>
          <span>Trang 1 / 1</span>
        </div>
      </div>
    </div>
  );
};
