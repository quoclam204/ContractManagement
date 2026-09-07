import React, { useEffect, useState } from 'react';
import './contracts.css';
import { TemplateList } from './components/TemplateList';
import { ContractDraftForm } from './components/ContractDraftForm';
import { ContractList } from './components/ContractList';
import { ContractDetailView } from './components/ContractDetailView';
import type { TemplateVersion, ContractDetail, ContractListItem } from './types';
import { ContractStatus } from './types';
import { contractApi } from './services/contractApi';

type ViewMode = 'list' | 'create' | 'templates' | 'detail';

export const ContractsModule: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateVersion | null>(null);
  const [currentContract, setCurrentContract] = useState<ContractDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [contractsSummary, setContractsSummary] = useState<ContractListItem[]>([]);

  // Tải thống kê nhanh cho KPI cards
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

  const formatBillion = (val: number) => {
    if (val >= 1_000_000_000) {
      return (val / 1_000_000_000).toFixed(2) + ' Tỷ đ';
    }
    if (val >= 1_000_000) {
      return (val / 1_000_000).toFixed(1) + ' Tr đ';
    }
    return new Intl.NumberFormat('vi-VN').format(val) + ' đ';
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
    <div className="clm-container">
      {/* Top Header */}
      <div className="clm-header">
        <div className="clm-title-area">
          <div className="clm-title-icon">📜</div>
          <div>
            <h1 className="clm-title">Quản Lý Vòng Đời Hợp Đồng</h1>
            <p className="clm-subtitle">
              Module Người 2 • Soạn thảo, quản trị mẫu văn bản, theo dõi tiến trình và trạng thái
            </p>
          </div>
        </div>

        <button
          className="clm-btn clm-btn-primary"
          onClick={() => {
            setSelectedTemplate(null);
            setViewMode('create');
          }}
        >
          <span>➕</span> Soạn Hợp Đồng Mới
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="clm-stats-grid">
        <div className="clm-stat-card">
          <div className="clm-stat-info">
            <span className="clm-stat-label">Tổng Hợp Đồng</span>
            <span className="clm-stat-val">{totalContracts}</span>
          </div>
          <div className="clm-stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
            📁
          </div>
        </div>

        <div className="clm-stat-card">
          <div className="clm-stat-info">
            <span className="clm-stat-label">Chờ Phê Duyệt</span>
            <span className="clm-stat-val" style={{ color: '#d97706' }}>
              {pendingCount}
            </span>
          </div>
          <div className="clm-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            ⏳
          </div>
        </div>

        <div className="clm-stat-card">
          <div className="clm-stat-info">
            <span className="clm-stat-label">Đang Có Hiệu Lực</span>
            <span className="clm-stat-val" style={{ color: '#059669' }}>
              {activeCount}
            </span>
          </div>
          <div className="clm-stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            🟢
          </div>
        </div>

        <div className="clm-stat-card">
          <div className="clm-stat-info">
            <span className="clm-stat-label">Tổng Giá Trị</span>
            <span className="clm-stat-val" style={{ color: '#4f46e5' }}>
              {formatBillion(totalValue)}
            </span>
          </div>
          <div className="clm-stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            💎
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="clm-tabs">
        <button
          className={`clm-tab-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          <span>📋</span> Danh Sách Hợp Đồng
        </button>
        <button
          className={`clm-tab-btn ${viewMode === 'templates' ? 'active' : ''}`}
          onClick={() => {
            setSelectedTemplate(null);
            setViewMode('templates');
          }}
        >
          <span>📑</span> Kho Mẫu Hợp Đồng (Templates)
        </button>
        <button
          className={`clm-tab-btn ${viewMode === 'create' ? 'active' : ''}`}
          onClick={() => {
            setSelectedTemplate(null);
            setViewMode('create');
          }}
        >
          <span>✍️</span> Soạn Thảo Mới
        </button>
      </div>

      {/* Main Content Views */}
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
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--color-slate-500)' }}>
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
            <div className="clm-alert-error">Không tìm thấy hợp đồng.</div>
          )}
        </>
      )}
    </div>
  );
};
