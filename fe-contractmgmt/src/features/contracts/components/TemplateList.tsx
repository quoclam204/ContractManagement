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

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--color-slate-500)' }}>
        Đang tải danh sách mẫu hợp đồng chuẩn...
      </div>
    );
  }

  if (error) return <div className="clm-alert-error">{error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: 'var(--color-slate-900)' }}>
            Kho Mẫu Hợp Đồng Chuẩn Doanh Nghiệp
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-slate-500)' }}>
            Các mẫu văn bản hợp đồng chính thức đang có hiệu lực (Active) hỗ trợ tạo lập nhanh chóng.
          </p>
        </div>
        <button className="clm-btn clm-btn-secondary clm-btn-sm" onClick={fetchTemplates}>
          <span>🔄</span> Làm mới danh sách
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="clm-table-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📑</div>
          <h4 style={{ margin: '0 0 8px', fontSize: 16 }}>Chưa có mẫu hợp đồng nào</h4>
          <p style={{ color: 'var(--color-slate-500)', fontSize: 13 }}>
            Các mẫu hợp đồng sẽ xuất hiện khi quản trị viên tạo mới.
          </p>
        </div>
      ) : (
        <div className="clm-templates-grid">
          {templates.map((tpl) => (
            <div key={tpl.id} className="clm-template-card">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--color-primary)',
                      background: 'var(--color-primary-bg)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    Phiên bản v{tpl.version}
                  </span>
                  <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>● Đang sử dụng</span>
                </div>

                <h4 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: 'var(--color-slate-900)' }}>
                  {tpl.contractTypeName}
                </h4>

                <p style={{ fontSize: 13, color: 'var(--color-slate-500)', margin: '0 0 16px', lineHeight: 1.5 }}>
                  {tpl.contentJson
                    ? 'Mẫu chuẩn hóa đã cấu hình các trường động và điều khoản tự động điền.'
                    : 'Mẫu hợp đồng văn bản cơ bản được doanh nghiệp quy chuẩn.'}
                </p>
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--color-slate-100)',
                  paddingTop: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontSize: 12, color: 'var(--color-slate-400)' }}>
                  {new Date(tpl.createdAt).toLocaleDateString('vi-VN')}
                </span>
                <button
                  className="clm-btn clm-btn-primary clm-btn-sm"
                  onClick={() => onSelectTemplate(tpl)}
                >
                  ✍️ Dùng Mẫu Này
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
