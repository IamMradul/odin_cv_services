import React, { useState } from 'react';
import { AlertTable } from '../components/alerts/AlertTable';
import { AlertFilters } from '../components/alerts/AlertFilters';
import { AlertDetailsPanel } from '../components/alerts/AlertDetailsPanel';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { useAlerts } from '../hooks/useAlerts';
import { Bell } from 'lucide-react';
import '../components/alerts/alerts.css';

const Alerts = () => {
  const [filters, setFilters] = useState({ severity: 'all', status: 'all' });
  const { alerts, isLoading, error, refetch, updateStatus, addNote } = useAlerts(filters);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const handleAction = async (action, alert, noteText) => {
    const STATUS_MAP = {
      acknowledge: 'Acknowledged',
      investigate: 'Investigating',
      resolve:     'Resolved',
    };

    if (action === 'view') {
      setSelectedAlert(alert);
    } else if (STATUS_MAP[action]) {
      await updateStatus(alert.id, STATUS_MAP[action]);
      if (selectedAlert?.id === alert.id) {
        setSelectedAlert(prev => prev ? { ...prev, status: STATUS_MAP[action] } : null);
      }
    } else if (action === 'note' && noteText) {
      await addNote(alert.id, noteText);
    }
  };

  return (
    <div className="alerts-page">
      <div className="alerts-page-header">
        <div>
          <h1 className="page-title">Alert Center</h1>
          <p className="page-subtitle">Manage and investigate system alerts in real-time.</p>
        </div>
      </div>

      <AlertFilters filters={filters} onFilterChange={setFilters} />

      {isLoading ? (
        <LoadingState rows={6} variant="table" />
      ) : error ? (
        <ErrorState message="Unable to load alerts." onRetry={refetch} />
      ) : alerts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No alerts found"
          description="No alerts match the selected filters."
          action={() => setFilters({ severity: 'all', status: 'all' })}
          actionLabel="Clear Filters"
          actionVariant="secondary"
        />
      ) : (
        <div className="alerts-content-layout">
          <AlertTable
            alerts={alerts}
            onRowClick={(alert) => setSelectedAlert(alert)}
            onAction={handleAction}
          />
        </div>
      )}

      <AlertDetailsPanel
        alert={selectedAlert}
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onAction={handleAction}
      />
    </div>
  );
};

export default Alerts;
