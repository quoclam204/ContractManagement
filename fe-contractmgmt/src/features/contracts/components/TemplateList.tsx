import React, { useEffect, useState } from 'react';
import { contractApi } from '../services/contractApi';
import type { TemplateVersion } from '../types';
import {
  IconFileText,
  IconRefresh,
  IconTemplate,
  IconEye,
  IconPlus,
  IconLayers,
  IconCheck
} from './Icons';

interface Props {
  onSelectTemplate: (template: TemplateVersion) => void;
}

export const TemplateList: React.FC<Props> = ({ onSelectTemplate }) => {
  const [templates, setTemplates] = useState<TemplateVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateVersion | null>(null);

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
      <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--clm-slate-500)', fontSize: 13 }}>
        Đang tải kho mẫu hợp đồng tiêu chuẩn doanh nghiệp...
      </div>
    );
  }

  if (error) return <div className="clm-alert clm-alert-error">{error}</div>;

  return (
    <div>
      {/* Catalog Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--clm-slate-900)' }}>
            Kho Mẫu Hợp Đồng Chuẩn Doanh Nghiệp (Templates Library)
          </h3>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--clm-slate-500)' }}>
            Các mẫu văn bản hợp đồng được chuẩn hóa bởi Phòng Pháp chế, tích hợp biến số tự động điền.
          </p>
        </div>
        <button className="clm-btn clm-btn-outline clm-btn-sm" onClick={fetchTemplates}>
          <IconRefresh size={14} />
          <span>Làm mới</span>
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="clm-panel" style={{ textAlign: 'center', padding: '64px 20px' }}>
          <div style={{ color: 'var(--clm-slate-300)', marginBottom: 14 }}>
            <IconTemplate size={48} />
          </div>
          <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: 'var(--clm-slate-900)' }}>
            Chưa có mẫu hợp đồng nào trong hệ thống
          </h4>
          <p style={{ color: 'var(--clm-slate-500)', fontSize: 13, margin: 0 }}>
            Quản trị viên có thể tạo mới các phiên bản mẫu hợp đồng qua API `POST /api/templates`.
          </p>
        </div>
      ) : (
        <div className="clm-template-grid">
          {templates.map((tpl) => (
            <div key={tpl.id} className="clm-template-card">
              <div>
                {/* Top Badge Strip */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="clm-badge-version">
                      v{tpl.version}.0
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#059669', background: '#ecfdf5', padding: '1px 7px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <IconCheck size={11} />
                      Đang áp dụng
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--clm-slate-400)' }}>
                    <IconLayers size={13} />
                  </span>
                </div>

                <h4 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: 'var(--clm-slate-900)' }}>
                  {tpl.contractTypeName}
                </h4>

                <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--clm-slate-600)', lineHeight: 1.5 }}>
                  Mẫu thỏa thuận thương mại chuẩn định dạng pháp lý, bảo vệ quyền lợi doanh nghiệp với điều khoản phân định trách nhiệm rõ ràng.
                </p>

                {/* Variable Tags */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--clm-slate-500)', marginBottom: 6 }}>
                    Trường dữ liệu tự động (Placeholders):
                  </div>
                  <span className="clm-var-tag">&#123;&#123;TEN_BEN_B&#125;&#125;</span>
                  <span className="clm-var-tag">&#123;&#123;GIA_TRI&#125;&#125;</span>
                  <span className="clm-var-tag">&#123;&#123;NGAY_HIEU_LUC&#125;&#125;</span>
                  <span className="clm-var-tag">&#123;&#123;DAI_DIEN&#125;&#125;</span>
                </div>
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--clm-slate-200)',
                  paddingTop: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <button
                  type="button"
                  className="clm-btn clm-btn-outline clm-btn-sm"
                  onClick={() => setPreviewTemplate(tpl)}
                  title="Xem trước mẫu"
                >
                  <IconEye size={13} />
                  <span>Xem mẫu</span>
                </button>

                <button
                  type="button"
                  className="clm-btn clm-btn-primary clm-btn-sm"
                  onClick={() => onSelectTemplate(tpl)}
                >
                  <IconPlus size={13} />
                  <span>Áp dụng mẫu này</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20
          }}
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="clm-panel"
            style={{ maxWidth: 640, width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="clm-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                  Chi tiết mẫu: {previewTemplate.contractTypeName} (v{previewTemplate.version})
                </h4>
                <span style={{ fontSize: 12, color: 'var(--clm-slate-500)' }}>
                  ID: {previewTemplate.id}
                </span>
              </div>
              <button
                className="clm-btn clm-btn-outline clm-btn-sm"
                onClick={() => setPreviewTemplate(null)}
              >
                Đóng
              </button>
            </div>

            <div className="clm-panel-body" style={{ overflowY: 'auto' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--clm-slate-500)', marginBottom: 6 }}>
                Nội dung định nghĩa mẫu (Schema / Raw Content):
              </div>
              <pre
                style={{
                  background: 'var(--clm-slate-900)',
                  color: '#e2e8f0',
                  padding: 16,
                  borderRadius: 6,
                  fontSize: 12,
                  fontFamily: 'var(--clm-font-mono)',
                  overflowX: 'auto',
                  margin: 0
                }}
              >
                {previewTemplate.contentJson || '{"template": "Dịch vụ phần mềm", "version": 2, "clauses": ["Bảo hành", "Thanh toán", "Bảo mật thông tin"]}'}
              </pre>
            </div>

            <div className="clm-panel-footer">
              <button
                className="clm-btn clm-btn-primary"
                onClick={() => {
                  const t = previewTemplate;
                  setPreviewTemplate(null);
                  onSelectTemplate(t);
                }}
              >
                <IconFileText size={14} />
                <span>Khởi tạo hợp đồng từ mẫu này</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
