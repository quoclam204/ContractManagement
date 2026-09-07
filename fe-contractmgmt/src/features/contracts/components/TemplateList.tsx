import React, { useEffect, useState } from 'react';
import { contractApi } from '../services/contractApi';
import type { TemplateVersion } from '../types';
import { IconFileText, IconRefresh, IconTemplate } from './Icons';

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
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--clm-text-muted)', fontSize: 13 }}>
        Đang tải danh sách mẫu hợp đồng chuẩn...
      </div>
    );
  }

  if (error) return <div className="clm-alert clm-alert-error">{error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--clm-text-title)' }}>
            Kho Mẫu Hợp Đồng Doanh Nghiệp
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--clm-text-muted)' }}>
            Danh mục các bản mẫu chính thức đang có hiệu lực (Active) phục vụ khởi tạo hợp đồng nhanh.
          </p>
        </div>
        <button className="clm-btn clm-btn-outline clm-btn-sm" onClick={fetchTemplates}>
          <IconRefresh size={14} />
          <span>Làm mới</span>
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="clm-card-panel" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <div style={{ color: 'var(--clm-text-light)', marginBottom: 12 }}>
            <IconTemplate size={36} />
          </div>
          <h4 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600 }}>Chưa có mẫu hợp đồng nào</h4>
          <p style={{ color: 'var(--clm-text-muted)', fontSize: 13, margin: 0 }}>
            Quản trị viên có thể cấu hình và cập nhật phiên bản mẫu hợp đồng qua API.
          </p>
        </div>
      ) : (
        <div className="clm-template-grid">
          {templates.map((tpl) => (
            <div key={tpl.id} className="clm-template-item">
              <div>
                <div className="clm-template-header">
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--clm-primary)',
                      background: 'var(--clm-primary-light)',
                      padding: '2px 7px',
                      borderRadius: 4
                    }}
                  >
                    Phiên bản v{tpl.version}
                  </span>
                  <span style={{ fontSize: 12, color: '#059669', fontWeight: 500 }}>● Đang sử dụng</span>
                </div>

                <h4 className="clm-template-title">{tpl.contractTypeName}</h4>

                <div className="clm-template-meta">
                  {tpl.contentJson
                    ? 'Mẫu chuẩn hóa đã tích hợp cấu trúc trường động JSON.'
                    : 'Mẫu văn bản tiêu chuẩn do phòng pháp chế ban hành.'}
                </div>
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--clm-border-light)',
                  paddingTop: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontSize: 12, color: 'var(--clm-text-light)' }}>
                  Ngày tạo: {new Date(tpl.createdAt).toLocaleDateString('vi-VN')}
                </span>
                <button
                  className="clm-btn clm-btn-primary clm-btn-sm"
                  onClick={() => onSelectTemplate(tpl)}
                >
                  <IconFileText size={14} />
                  <span>Áp dụng mẫu</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
