import React, { useState } from 'react';
import './contracts.css';
import { TemplateList } from './components/TemplateList';
import { ContractDraftForm } from './components/ContractDraftForm';
import { ContractList } from './components/ContractList';
import { ContractDetailView } from './components/ContractDetailView';
import type { TemplateVersion, ContractDetail } from './types';
import { contractApi } from './services/contractApi';

type ViewMode = 'list' | 'create' | 'templates' | 'detail';

export const ContractsModule: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateVersion | null>(null);
  const [currentContract, setCurrentContract] = useState<ContractDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

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
  };

  return (
    <div className="clm-container">
      {/* Module Navigation Bar */}
      <div className="clm-header">
        <div>
          <h1 className="clm-title">📄 Quản Lý Hợp Đồng & Mẫu Văn Bản</h1>
          <span style={{ fontSize: 13, color: 'var(--clm-text-muted)' }}>
            Module Người 2: Contract Lifecycle Management
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="clm-tabs">
        <button
          className={`clm-tab-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          📋 Danh Sách Hợp Đồng
        </button>
        <button
          className={`clm-tab-btn ${viewMode === 'templates' ? 'active' : ''}`}
          onClick={() => {
            setSelectedTemplate(null);
            setViewMode('templates');
          }}
        >
          📑 Mẫu Hợp Đồng (Templates)
        </button>
        <button
          className={`clm-tab-btn ${viewMode === 'create' ? 'active' : ''}`}
          onClick={() => {
            setSelectedTemplate(null);
            setViewMode('create');
          }}
        >
          ✍️ Soạn Thảo Hợp Đồng Mới
        </button>
      </div>

      {/* Content Rendering */}
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
            <div style={{ padding: 40, textAlign: 'center' }}>Đang tải chi tiết hợp đồng...</div>
          ) : currentContract ? (
            <ContractDetailView
              contract={currentContract}
              onBack={() => setViewMode('list')}
              onRefresh={(updated) => setCurrentContract(updated)}
            />
          ) : (
            <div className="clm-alert-error">Không tìm thấy hợp đồng.</div>
          )}
        </>
      )}
    </div>
  );
};
