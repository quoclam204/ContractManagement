import React, { useEffect, useState } from 'react';
import { contractApi } from '../services/contractApi';
import { ContractStatus } from '../types';
import type { ContractListItem } from '../types';
import { ContractBadge } from './ContractBadge';

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
      {/* Toolbar: Search + Filter + Actions */}
      <div className="clm-toolbar">
        <form onSubmit={handleSearchSubmit} className="clm-search-wrap">
          <span className="clm-search-icon">🔍</span>
          <input
            type="text"
            className="clm-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã số HĐ hoặc tiêu đề..."
          />
        </form>

        <div style={{ display: 'flex', gap: 12 }}>
          <select
            className="clm-field-select"
            style={{ width: 220, padding: '10px 14px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">🔘 Tất cả trạng thái</option>
            <option value={ContractStatus.Draft}>Draft (Bản nháp)</option>
            <option value={ContractStatus.PendingApproval}>Pending (Chờ duyệt)</option>
            <option value={ContractStatus.Approved}>Approved (Đã duyệt)</option>
            <option value={ContractStatus.Signed}>Signed (Đã ký)</option>
            <option value={ContractStatus.Active}>Active (Đang hiệu lực)</option>
            <option value={ContractStatus.Expiring}>Expiring (Sắp hết hạn)</option>
            <option value={ContractStatus.Renewed}>Renewed (Đã gia hạn)</option>
            <option value={ContractStatus.Terminated}>Terminated (Đã thanh lý)</option>
          </select>

          <button className="clm-btn clm-btn-secondary" onClick={fetchContracts}>
            <span>🔄</span> Làm mới
          </button>
        </div>
      </div>

      {error && <div className="clm-alert-error">{error}</div>}

      {loading ? (
        <div style={{ padding: 50, textAlign: 'center', color: 'var(--color-slate-500)' }}>
          Đang tải danh sách hợp đồng...
        </div>
      ) : contracts.length === 0 ? (
        <div className="clm-table-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <h4 style={{ margin: '0 0 8px', fontSize: 16, color: 'var(--color-slate-800)' }}>
            Chưa có hợp đồng nào trong danh mục
          </h4>
          <p style={{ color: 'var(--color-slate-500)', margin: '0 0 20px', fontSize: 14 }}>
            Bắt đầu tạo hợp đồng nháp đầu tiên từ mẫu hoặc tạo mới hoàn toàn.
          </p>
          <button className="clm-btn clm-btn-primary" onClick={onCreateNew}>
            ✍️ Soạn Hợp Đồng Ngay
          </button>
        </div>
      ) : (
        <div className="clm-table-card">
          <table className="clm-table">
            <thead>
              <tr>
                <th>Mã Số HĐ</th>
                <th>Tiêu Đề & Đối Tác</th>
                <th>Loại Hợp Đồng</th>
                <th>Giá Trị</th>
                <th>Thời Hạn Hiệu Lực</th>
                <th>Trạng Thái</th>
                <th style={{ textAlign: 'right' }}>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className="clm-contract-code">{c.contractNumber}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--color-slate-900)' }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-slate-500)', marginTop: 2 }}>
                      🏢 {c.partnerName}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-slate-700)' }}>
                      {c.contractTypeName}
                    </span>
                  </td>
                  <td>
                    <span className="clm-amount">{formatCurrency(c.value)}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: 13, color: 'var(--color-slate-700)' }}>
                      {new Date(c.effectiveDate).toLocaleDateString('vi-VN')}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-slate-400)' }}>
                      đến {new Date(c.expiryDate).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td>
                    <ContractBadge status={c.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="clm-btn clm-btn-secondary clm-btn-sm"
                      onClick={() => onSelectContract(c.id)}
                    >
                      Chi tiết →
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
