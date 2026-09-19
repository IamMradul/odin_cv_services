import React from 'react';
import { ReportCard } from './ReportCard';
import { EmptyState } from '../common/EmptyState';
import { FileText } from 'lucide-react';
import './reports.css';

export const ReportList = ({ reports, onView, onGenerate }) => {
  if (reports.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No reports yet"
        description="Create your first report using the builder."
      />
    );
  }

  return (
    <div className="report-list">
      {reports.map(report => (
        <ReportCard
          key={report.id}
          report={report}
          onView={onView}
          onGenerate={onGenerate}
        />
      ))}
    </div>
  );
};
