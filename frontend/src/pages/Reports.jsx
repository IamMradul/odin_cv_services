import React, { useState } from 'react';
import { ReportList } from '../components/reports/ReportList';
import { ReportBuilder } from '../components/reports/ReportBuilder';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { useReports } from '../hooks/useReports';
import '../components/reports/reports.css';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('archive');
  const { reports, isLoading, error, refetch, createDraft, generate } = useReports();

  const handleBuilderSubmit = async ({ action, ...data }) => {
    const report = await createDraft(data);
    if (action === 'generate') {
      await generate(report.id);
    }
    setActiveTab('archive');
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <h1 className="page-title">Report Center</h1>
          <p className="page-subtitle">Generate, view, and export security intelligence reports.</p>
        </div>

        <div className="reports-tabs">
          <button
            className={`tab-btn ${activeTab === 'archive' ? 'active' : ''}`}
            onClick={() => setActiveTab('archive')}
          >
            Report Archive
          </button>
          <button
            className={`tab-btn ${activeTab === 'builder' ? 'active' : ''}`}
            onClick={() => setActiveTab('builder')}
          >
            Create New Report
          </button>
        </div>
      </div>

      <div className="reports-content">
        {activeTab === 'archive' ? (
          isLoading ? (
            <LoadingState rows={3} />
          ) : error ? (
            <ErrorState message="Unable to load reports." onRetry={refetch} />
          ) : (
            <ReportList reports={reports} onGenerate={generate} />
          )
        ) : (
          <ReportBuilder onSubmit={handleBuilderSubmit} />
        )}
      </div>
    </div>
  );
};

export default Reports;
