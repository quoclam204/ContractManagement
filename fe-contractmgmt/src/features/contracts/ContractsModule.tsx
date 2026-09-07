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
      alert(err.message || 'Không thể lấy thông tin hợp đồng.');
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
    <div className="clm-wrapper">
      {/* Topbar & Breadcrumb */}
      <div className="clm-topbar">
        <div>
          <div className="clm-breadcrumb">
            <span>Quản trị doanh nghiệp</span>
            <span>/</span>
            <span className="clm-breadcrumb-active">Hợp đồng & Văn bản</span>
          </div>
          <h1 className="clm-main-title">Quản Lý Vòng Đời Hợp Đồng</h1>
        </div>

        <button
          className="clm-btn clm-btn-primary"
          onClick={() => {
            setSelectedTemplate(null);
            setViewMode('create');
          }}
        >
          <IconPlus size={15} />
          <span>Tạo Hợp Đồng Mới</span>
        </button>
      </div>

      {/* KPI Stats Row (Clean & Compact) */}
      <div className="clm-stats-row">
        <div className="clm-metric-card">
          <div>
            <div className="clm-metric-title">Tổng số hợp đồng</div>
            <div className="clm-metric-value">{totalContracts}</div>
          </div>
          <div className="clm-metric-icon-wrap" style={{ background: '#f0f9ff', color: '#0284c7' }}>
            <IconFileText size={20} />
          </div>
        </div>

        <div className="clm-metric-card">
          <div>
            <div className="clm-metric-title">Chờ phê duyệt</div>
            <div className="clm-metric-value" style={{ color: '#d97706' }}>
              {pendingCount}
            </div>
          </div>
          <div className="clm-metric-icon-wrap" style={{ background: '#fffbeb', color: '#d97706' }}>
            <IconClock size={20} />
          </div>
        </div>

        <div className="clm-metric-card">
          <div>
            <div className="clm-metric-title">Đang có hiệu lực</div>
            <div className="clm-metric-value" style={{ color: '#059669' }}>
              {activeCount}
            </div>
          </div>
          <div className="clm-metric-icon-wrap" style={{ background: '#ecfdf5', color: '#059669' }}>
            <IconCheckCircle size={20} />
          </div>
        </div>

        <div className="clm-metric-card">
          <div>
            <div className="clm-metric-title">Tổng giá trị cam kết</div>
            <div className="clm-metric-value" style={{ color: '#111827', fontSize: 18 }}>
              {formatCurrencyCompact(totalValue)}
            </div>
          </div>
          <div className="clm-metric-icon-wrap" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <IconTrendingUp size={20} />
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Underline Flat) */}
      <div className="clm-nav-tabs">
        <button
          className={`clm-nav-tab ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          <IconFileText size={16} />
          <span>Danh sách hợp đồng</span>
          <span className="clm-nav-tab-badge">{totalContracts}</span>
        </button>

        <button
          className={`clm-nav-tab ${viewMode === 'templates' ? 'active' : ''}`}
          onClick={() => {
            setSelectedTemplate(null);
            setViewMode('templates');
          }}
        >
          <IconTemplate size={16} />
          <span>Mẫu văn bản (Templates)</span>
        </button>

        <button
          className={`clm-nav-tab ${viewMode === 'create' ? 'active' : ''}`}
          onClick={() => {
            setSelectedTemplate(null);
            setViewMode('create');
          }}
        >
          <IconPlus size={15} />
          <span>Soạn thảo nháp</span>
        </button>
      </div>

      {/* Main Views */}
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
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--clm-text-muted)' }}>
              Đang tải chi tiết hợp đồng...
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
    </div>
  );
};
