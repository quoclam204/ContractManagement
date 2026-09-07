import React, { useEffect, useState } from 'react';
import './contracts.css';
import { TemplateList } from './components/TemplateList';
import { ContractDraftForm } from './components/ContractDraftForm';
import { ContractList } from './components/ContractList';
import { ContractDetailView } from './components/ContractDetailView';
import type { TemplateVersion, ContractDetail, ContractListItem } from './types';
import { ContractStatus } from './types';
import { contractApi } from './services/contractApi';
import { IconPlus } from './components/Icons';

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
      return (val / 1_000_000_000).toFixed(1) + ' tỷ ₫';
    }
    if (val >= 1_000_000) {
      return (val / 1_000_000).toFixed(0) + ' triệu ₫';
    }
    return new Intl.NumberFormat('vi-VN').format(val) + ' ₫';
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
    <div className="app-container">
      {/* Clean Header */}
      <div className="app-header">
        <div className="app-title-group">
          <h1>Quản Lý Hợp Đồng</h1>
          <p>Hệ thống quản lý vòng đời hợp đồng và mẫu văn bản</p>
        </div>

        {viewMode !== 'create' && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setSelectedTemplate(null);
              setViewMode('create');
            }}
          >
            <IconPlus size={14} />
            <span>Tạo hợp đồng</span>
          </button>
        )}
      </div>

      {/* Slim Metrics Strip */}
      <div className="stats-strip">
        <div className="stat-box">
          <div>
            <div className="stat-label">Tổng hợp đồng</div>
            <div className="stat-value">{totalContracts}</div>
          </div>
        </div>

        <div className="stat-box">
          <div>
            <div className="stat-label">Chờ phê duyệt</div>
            <div className="stat-value" style={{ color: '#d97706' }}>
              {pendingCount}
            </div>
          </div>
        </div>

        <div className="stat-box">
          <div>
            <div className="stat-label">Đang hiệu lực</div>
            <div className="stat-value" style={{ color: '#16a34a' }}>
              {activeCount}
            </div>
          </div>
        </div>

        <div className="stat-box">
          <div>
            <div className="stat-label">Tổng giá trị</div>
            <div className="stat-value">
              {formatCurrencyCompact(totalValue)}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-nav">
        <button
          type="button"
          className={`tab-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          <span>Danh sách hợp đồng</span>
          <span className="tab-counter">{totalContracts}</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${viewMode === 'templates' ? 'active' : ''}`}
          onClick={() => {
            setSelectedTemplate(null);
            setViewMode('templates');
          }}
        >
          <span>Mẫu văn bản</span>
        </button>

        {viewMode === 'create' && (
          <button type="button" className="tab-btn active">
            <span>Tạo mới</span>
          </button>
        )}

        {viewMode === 'detail' && (
          <button type="button" className="tab-btn active">
            <span>Chi tiết hợp đồng</span>
          </button>
        )}
      </div>

      {/* Content */}
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
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
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
            <div className="alert alert-error">Không tìm thấy thông tin hợp đồng.</div>
          )}
        </>
      )}
    </div>
  );
};
