import React, { useEffect, useState } from 'react';
import { contractApi } from '../services/contractApi';
import type { TemplateVersion } from '../types';
import { IconRefresh, IconPlus } from './Icons';

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
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
        Đang tải danh sách mẫu...
      </div>
    );
  }

  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Kho Mẫu Hợp Đồng
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--color-text-muted)' }}>
            Các biểu mẫu chính thức phục vụ khởi tạo nhanh hợp đồng.
          </p>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={fetchTemplates}>
          <IconRefresh size={13} />
          <span>Làm mới</span>
        </button>
      </div>

      {templates.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
          Chưa có mẫu hợp đồng nào trong hệ thống.
        </div>
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tên Loại Hợp Đồng</th>
                <th style={{ width: 100 }}>Phiên Bản</th>
                <th>Mô Tả / Nội Dung</th>
                <th>Ngày Tạo</th>
                <th style={{ width: 140, textAlign: 'right' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((tpl) => (
                <tr key={tpl.id}>
                  <td>
                    <strong>{tpl.contractTypeName}</strong>
                  </td>
                  <td>
                    <span className="code-tag">v{tpl.version}.0</span>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
                    Mẫu chuẩn do Pháp chế ban hành, hỗ trợ điền tự động.
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {new Date(tpl.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => onSelectTemplate(tpl)}
                    >
                      <IconPlus size={12} />
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
