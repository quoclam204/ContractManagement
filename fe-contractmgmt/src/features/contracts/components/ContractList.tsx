import React, { useEffect, useState } from 'react';
import { contractApi } from '../services/contractApi';
import { ContractStatus } from '../types';
import type { ContractListItem } from '../types';
import { ContractBadge } from './ContractBadge';
import { IconSearch, IconRefresh, IconPlus, IconFileText } from './Icons';

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

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div>
      {/* Search & Filter Action Bar */}
      <div className="clm-action-bar">
        <form onSubmit={handleSearchSubmit} className="clm-search-box">
          <IconSearch size={15} color="#9ca3af" />
          <input
            type="text"
            className="clm-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo số HĐ hoặc tiêu đề..."
          />
        </form>

        <div style={{ display: 'flex', gap: 10 }}>
          <select
            className="clm-select-compact"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value={ContractStatus.Draft}>Bản nháp (Draft)</option>
            <option value={ContractStatus.PendingApproval}>Chờ duyệt (Pending)</option>
            <option value={ContractStatus.Approved}>Đã duyệt (Approved)</option>
            <option value={ContractStatus.Signed}>Đã ký (Signed)</option>
            <option value={ContractStatus.Active}>Hiệu lực (Active)</option>
            <option value={ContractStatus.Expiring}>Sắp hết hạn (Expiring)</option>
            <option value={ContractStatus.Renewed}>Đã gia hạn (Renewed)</option>
            <option value={ContractStatus.Terminated}>Đã thanh lý (Terminated)</option>
          </select>

          <button className="clm-btn clm-btn-outline" onClick={fetchContracts}>
            <IconRefresh size={14} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {error && <div className="clm-alert clm-alert-error">{error}</div>}

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--clm-text-muted)', fontSize: 13 }}>
          Đang tải danh sách hợp đồng...
        </div>
      ) : contracts.length === 0 ? (
        <div className="clm-card-panel" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <div style={{ color: 'var(--clm-text-light)', marginBottom: 12 }}>
            <IconFileText size={36} />
          </div>
          <h4 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600, color: 'var(--clm-text-title)' }}>
            Không tìm thấy hợp đồng nào
          </h4>
          <p style={{ color: 'var(--clm-text-muted)', margin: '0 0 16px', fontSize: 13 }}>
            Chưa có hợp đồng nào phù hợp với bộ lọc tìm kiếm hiện tại.
          </p>
          <button className="clm-btn clm-btn-primary" onClick={onCreateNew}>
            <IconPlus size={14} />
            <span>Soạn hợp đồng mới</span>
          </button>
        </div>
      ) : (
        <div className="clm-card-panel">
          <table className="clm-data-table">
            <thead>
              <tr>
                <th style={{ width: 140 }}>Số Hợp Đồng</th>
                <th>Tiêu Đề Hợp Đồng</th>
                <th>Phân Loại</th>
                <th style={{ width: 150 }}>Giá Trị</th>
                <th style={{ width: 180 }}>Thời Hạn</th>
                <th style={{ width: 140 }}>Trạng Thái</th>
                <th style={{ width: 90, textAlign: 'right' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className="clm-code-tag">{c.contractNumber}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--clm-text-title)', fontSize: 13 }}>
                      {c.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--clm-text-muted)', marginTop: 2 }}>
                      {c.partnerName}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: 13, color: 'var(--clm-text-body)' }}>
                      {c.contractTypeName}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#059669', fontSize: 13 }}>
                      {formatCurrency(c.value)}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: 12, color: 'var(--clm-text-body)' }}>
                      {new Date(c.effectiveDate).toLocaleDateString('vi-VN')} → {new Date(c.expiryDate).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td>
                    <ContractBadge status={c.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="clm-btn clm-btn-outline clm-btn-sm"
                      onClick={() => onSelectContract(c.id)}
                    >
                      Chi tiết
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
