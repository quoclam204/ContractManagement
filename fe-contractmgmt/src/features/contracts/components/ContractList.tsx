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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Danh Sách Hợp Đồng Của Bạn</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--clm-text-muted)' }}>
            Theo dõi toàn bộ hợp đồng từ khi soạn thảo nháp đến khi có hiệu lực và thanh lý.
          </p>
        </div>
        <button className="clm-btn clm-btn-primary" onClick={onCreateNew}>
          ➕ Soạn Hợp Đồng Mới
        </button>
      </div>

      {/* Bộ lọc và Tìm kiếm */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, display: 'flex', gap: 8 }}>
          <input
            type="text"
            className="clm-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo số hợp đồng hoặc tiêu đề..."
          />
          <button type="submit" className="clm-btn clm-btn-secondary">
            🔍 Tìm
          </button>
        </form>

        <select
          className="clm-select"
          style={{ width: 220 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">-- Tất cả trạng thái --</option>
          <option value={ContractStatus.Draft}>Bản nháp</option>
          <option value={ContractStatus.PendingApproval}>Chờ phê duyệt</option>
          <option value={ContractStatus.Approved}>Đã phê duyệt</option>
          <option value={ContractStatus.Signed}>Đã ký số</option>
          <option value={ContractStatus.Active}>Đang hiệu lực</option>
          <option value={ContractStatus.Expiring}>Sắp hết hạn</option>
          <option value={ContractStatus.Renewed}>Đã gia hạn</option>
          <option value={ContractStatus.Terminated}>Đã thanh lý</option>
        </select>
      </div>

      {error && <div className="clm-alert-error">{error}</div>}

      {loading ? (
        <div style={{ padding: 30, textAlign: 'center', color: 'var(--clm-text-muted)' }}>
          Đang tải danh sách hợp đồng...
        </div>
      ) : contracts.length === 0 ? (
        <div className="clm-card" style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: 'var(--clm-text-muted)', marginBottom: 16 }}>
            Không tìm thấy hợp đồng nào phù hợp.
          </p>
          <button className="clm-btn clm-btn-primary" onClick={onCreateNew}>
            ✍️ Bắt đầu soạn hợp đồng nháp đầu tiên
          </button>
        </div>
      ) : (
        <div className="clm-table-container">
          <table className="clm-table">
            <thead>
              <tr>
                <th>Số HĐ</th>
                <th>Tiêu đề hợp đồng</th>
                <th>Loại hợp đồng</th>
                <th>Giá trị</th>
                <th>Thời hạn</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, color: 'var(--clm-primary)' }}>{c.contractNumber}</td>
                  <td style={{ fontWeight: 600 }}>{c.title}</td>
                  <td>{c.contractTypeName}</td>
                  <td style={{ fontWeight: 600, color: '#16a34a' }}>
                    {formatCurrency(c.value)}
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--clm-text-muted)' }}>
                    {new Date(c.effectiveDate).toLocaleDateString('vi-VN')} -{' '}
                    {new Date(c.expiryDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td>
                    <ContractBadge status={c.status} />
                  </td>
                  <td>
                    <button
                      className="clm-btn clm-btn-secondary"
                      style={{ padding: '5px 12px', fontSize: 13 }}
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
