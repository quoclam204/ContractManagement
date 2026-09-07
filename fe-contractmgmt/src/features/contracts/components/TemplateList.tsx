import React, { useEffect, useState } from 'react';
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

  if (loading) return <div style={{ padding: 20 }}>Đang tải danh sách mẫu hợp đồng...</div>;
  if (error) return <div className="clm-alert-error">{error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Danh Sách Mẫu Hợp Đồng Chuẩn</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--clm-text-muted)' }}>
            Các mẫu hợp đồng đang có hiệu lực (Active) được phê duyệt sử dụng trong doanh nghiệp.
          </p>
        </div>
        <button className="clm-btn clm-btn-secondary" onClick={fetchTemplates}>
          🔄 Làm mới
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="clm-card" style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: 'var(--clm-text-muted)', marginBottom: 12 }}>Chưa có mẫu hợp đồng nào đang hoạt động.</p>
        </div>
      ) : (
        <div className="clm-grid">
          {templates.map((tpl) => (
            <div key={tpl.id} className="clm-card">
              <div className="clm-card-header">
                <div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--clm-primary)',
                      background: '#eff6ff',
                      padding: '2px 8px',
                      borderRadius: 4
                    }}
                  >
                    Phiên bản v{tpl.version}
                  </span>
                  <h4 className="clm-card-title" style={{ marginTop: 8 }}>
                    {tpl.contractTypeName}
                  </h4>
                </div>
              </div>

              <div className="clm-card-desc">
                {tpl.contentJson ? (
                  <span>Đã tích hợp cấu trúc trường động JSON</span>
                ) : (
                  <span>Mẫu văn bản cơ bản tiêu chuẩn</span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                <span style={{ fontSize: 12, color: 'var(--clm-text-muted)' }}>
                  Ngày tạo: {new Date(tpl.createdAt).toLocaleDateString('vi-VN')}
                </span>
                <button
                  className="clm-btn clm-btn-primary"
                  onClick={() => onSelectTemplate(tpl)}
                >
                  ✍️ Soạn HĐ từ mẫu này
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
