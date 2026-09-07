import React, { useEffect, useState } from 'react';
import './contracts.css';
import { TemplateList } from './components/TemplateList';
import { ContractDraftForm } from './components/ContractDraftForm';
import { ContractList } from './components/ContractList';
import { ContractDetailView } from './components/ContractDetailView';
import type { TemplateVersion, ContractDetail, ContractListItem } from './types';
import { ContractStatus } from './types';
import { contractApi } from './services/contractApi';
import {
  IconShield,
  IconFileText,
  IconPlus,
  IconClock,
  IconCheckCircle,
  IconTrendingUp,
  IconTemplate
} from './components/Icons';

type ViewMode = 'list' | 'create' | 'templates' | 'detail';

export const ContractsModule: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateVersion | null>(null);
  const [currentContract, setCurrentContract] = useState<ContractDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [contractsSummary, setContractsSummary] = useState<ContractListItem[]>([]);

  const loadStats = async () => {
    try {
      const res = await contractApi.getContracts({ pageSize: 100 });
      setContractsSummary(res.items);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadStats();
  }, [viewMode]);

  const totalContracts = contractsSummary.length;
  const pendingCount = contractsSummary.filter((c) => c.status === ContractStatus.PendingApproval).length;
  const activeCount = contractsSummary.filter((c) => c.status === ContractStatus.Active).length;
  const totalValue = contractsSummary.reduce((sum, c) => sum + (c.value || 0), 0);

  const formatCurrencyCompact = (val: number) => {
    if (val >= 1_000_000_000) {
      return (val / 1_000_000_000).toFixed(2) + ' tỷ VNĐ';
    }
    if (val >= 1_000_000) {
      return (val / 1_000_000).toFixed(1) + ' triệu VNĐ';
    }
    return new Intl.NumberFormat('vi-VN').format(val) + ' VNĐ';
  };

  const handleSelectTemplate = (template: TemplateVersion) => {
    setSelectedTemplate(template);
    setViewMode('create');
  };

  const handleSelectContract = async (contractId: string) => {
    try {
      setLoadingDetail(true);
      const detail = await contractApi.getContractById(contractId);
      setCurrentContract(detail);
      setViewMode('detail');
    } catch (err: any) {
      alert(err.message || 'Không thể lấy thông tin chi tiết hợp đồng.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCreateSuccess = (newContract: ContractDetail) => {
    setCurrentContract(newContract);
    setViewMode('detail');
    loadStats();
  };

  return (
    <div className="clm-shell">
      {/* Enterprise Executive Header */}
      <header className="clm-header">
        <div className="clm-brand-wrap">
          <div className="clm-brand-icon">
            <IconShield size={20} color="#ffffff" />
          </div>
          <div>
            <div className="clm-brand-title">
              <span>CLM ENTERPRISE</span>
              <span className="clm-badge-version">v1.0 • Person 2</span>
            </div>
            <div className="clm-brand-subtitle">
              Quản lý vòng đời hợp đồng, mẫu văn bản & trạng thái State Machine
            </div>
          </div>
        </div>

        <div className="clm-header-right">
          <div className="clm-db-status">
            <span className="clm-db-dot" />
            <span>SQL Server: Kết nối ổn định</span>
          </div>

          <div className="clm-user-chip">
            <div className="clm-user-avatar">P2</div>
            <div className="clm-user-info">
              <div className="clm-user-name">Người Số 2</div>
              <div className="clm-user-role">Chuyên viên Hợp đồng & Pháp chế</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="clm-main">
        {/* Page Title & Quick Action */}
        <div className="clm-page-header">
          <div className="clm-page-title-group">
            <h1>Trung Tâm Quản Trị Hợp Đồng</h1>
            <p className="clm-page-desc">
              Theo dõi toàn diện tiến trình thẩm định, ký duyệt, hiệu lực và lưu trữ văn bản pháp lý doanh nghiệp.
            </p>
          </div>

          <button
            type="button"
            className="clm-btn clm-btn-primary"
            onClick={() => {
              setSelectedTemplate(null);
              setViewMode('create');
            }}
          >
            <IconPlus size={15} />
            <span>Soạn Hợp Đồng Mới</span>
          </button>
        </div>

        {/* Executive KPI Stats Strip */}
        <div className="clm-kpi-grid">
          <div className="clm-kpi-card">
            <div>
              <div className="clm-kpi-label">Tổng số hợp đồng</div>
              <div className="clm-kpi-number">{totalContracts}</div>
              <div className="clm-kpi-sub">Toàn bộ hồ sơ trên hệ thống</div>
            </div>
            <div className="clm-kpi-icon-pill" style={{ background: 'var(--clm-slate-100)', color: 'var(--clm-slate-700)' }}>
              <IconFileText size={22} />
            </div>
          </div>

          <div className="clm-kpi-card">
            <div>
              <div className="clm-kpi-label">Chờ thẩm định & duyệt</div>
              <div className="clm-kpi-number" style={{ color: '#d97706' }}>
                {pendingCount}
              </div>
              <div className="clm-kpi-sub">Cần cấp quản lý xem xét</div>
            </div>
            <div className="clm-kpi-icon-pill" style={{ background: '#fffbeb', color: '#d97706' }}>
              <IconClock size={22} />
            </div>
          </div>

          <div className="clm-kpi-card">
            <div>
              <div className="clm-kpi-label">Đang có hiệu lực</div>
              <div className="clm-kpi-number" style={{ color: '#059669' }}>
                {activeCount}
              </div>
              <div className="clm-kpi-sub">Đang thực thi cam kết</div>
            </div>
            <div className="clm-kpi-icon-pill" style={{ background: '#ecfdf5', color: '#059669' }}>
              <IconCheckCircle size={22} />
            </div>
          </div>

          <div className="clm-kpi-card">
            <div>
              <div className="clm-kpi-label">Tổng giá trị cam kết</div>
              <div className="clm-kpi-number" style={{ fontSize: 20, color: 'var(--clm-slate-900)' }}>
                {formatCurrencyCompact(totalValue)}
              </div>
              <div className="clm-kpi-sub">Quy mô tài chính cam kết</div>
            </div>
            <div className="clm-kpi-icon-pill" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <IconTrendingUp size={22} />
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="clm-tab-nav">
          <div className="clm-tabs-left">
            <button
              type="button"
              className={`clm-tab-item ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <IconFileText size={15} />
              <span>Danh sách hợp đồng</span>
              <span className="clm-tab-badge">{totalContracts}</span>
            </button>

            <button
              type="button"
              className={`clm-tab-item ${viewMode === 'templates' ? 'active' : ''}`}
              onClick={() => {
                setSelectedTemplate(null);
                setViewMode('templates');
              }}
            >
              <IconTemplate size={15} />
              <span>Kho mẫu văn bản (Templates)</span>
            </button>

            <button
              type="button"
              className={`clm-tab-item ${viewMode === 'create' ? 'active' : ''}`}
              onClick={() => {
                setSelectedTemplate(null);
                setViewMode('create');
              }}
            >
              <IconPlus size={14} />
              <span>Soạn thảo hợp đồng mới</span>
            </button>
          </div>
        </div>

        {/* Content Views */}
        {viewMode === 'list' && (
          <ContractList
            onSelectContract={handleSelectContract}
            onCreateNew={() => {
              setSelectedTemplate(null);
              setViewMode('create');
            }}
          />
        )}

        {viewMode === 'templates' && (
          <TemplateList onSelectTemplate={handleSelectTemplate} />
        )}

        {viewMode === 'create' && (
          <ContractDraftForm
            selectedTemplate={selectedTemplate}
            onSuccess={handleCreateSuccess}
            onCancel={() => setViewMode('list')}
          />
        )}

        {viewMode === 'detail' && (
          <>
            {loadingDetail ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--clm-slate-500)', fontSize: 13 }}>
                Đang truy xuất thông tin chi tiết hợp đồng...
              </div>
            ) : currentContract ? (
              <ContractDetailView
                contract={currentContract}
                onBack={() => setViewMode('list')}
                onRefresh={(updated) => {
                  setCurrentContract(updated);
                  loadStats();
                }}
              />
            ) : (
              <div className="clm-alert clm-alert-error">Không tìm thấy thông tin hợp đồng.</div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
