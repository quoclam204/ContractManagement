import React, { useEffect, useState } from 'react';
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
    <div className="min-h-screen bg-slate-50/50 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header: H1 & Subtitle + Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản Lý Hợp Đồng</h1>
            <p className="text-sm text-slate-500 mt-1">
              Quản lý danh sách, vòng đời trạng thái và mẫu biểu hợp đồng doanh nghiệp
            </p>
          </div>

          {viewMode !== 'create' && (
            <div>
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                onClick={() => {
                  setSelectedTemplate(null);
                  setViewMode('create');
                }}
              >
                <IconPlus size={15} />
                <span>Tạo hợp đồng</span>
              </button>
            </div>
          )}
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Tổng số hợp đồng
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalContracts}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Chờ phê duyệt
            </div>
            <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Đang có hiệu lực
            </div>
            <div className="text-2xl font-bold text-emerald-600">{activeCount}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Tổng giá trị cam kết
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrencyCompact(totalValue)}
            </div>
          </div>
        </div>

        {/* Tabs: Danh sách hợp đồng / Mẫu văn bản */}
        <div className="flex border-b border-slate-200 gap-6 mb-6">
          <button
            type="button"
            className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              viewMode === 'list'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
            onClick={() => setViewMode('list')}
          >
            <span>Danh sách hợp đồng</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                viewMode === 'list' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {totalContracts}
            </span>
          </button>

          <button
            type="button"
            className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              viewMode === 'templates'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
            onClick={() => {
              setSelectedTemplate(null);
              setViewMode('templates');
            }}
          >
            <span>Mẫu văn bản</span>
          </button>

          {viewMode === 'create' && (
            <button
              type="button"
              className="pb-3 text-sm font-semibold border-b-2 border-blue-600 text-blue-600"
            >
              Tạo hợp đồng mới
            </button>
          )}

          {viewMode === 'detail' && (
            <button
              type="button"
              className="pb-3 text-sm font-semibold border-b-2 border-blue-600 text-blue-600"
            >
              Chi tiết hợp đồng
            </button>
          )}
        </div>

        {/* Dynamic Views */}
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
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
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
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm">
                Không tìm thấy dữ liệu hợp đồng yêu cầu.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
