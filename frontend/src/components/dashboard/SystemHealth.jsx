import React from 'react';
import { CheckCircle, AlertCircle, Cpu, Wifi } from 'lucide-react';
import { useStats } from '../../hooks/useStats';
import './dashboard.css';

export const SystemHealth = () => {
  const { health = [], isLoading } = useStats();
  
  if (isLoading) return <div className="p-4">Loading health data...</div>;

  const services = health || [];
  const healthy = services.filter(s => s.status === 'ok').length;

  return (
    <div className="system-health">
      <div className="sh-summary">
        <Cpu size={16} className="text-success" />
        <span className="sh-count">{healthy}/{services.length} services operational</span>
      </div>
      <div className="sh-list">
        {services.length === 0 ? <div className="p-4 text-muted">No health data available</div> : services.map(svc => (
          <div key={svc.name} className="sh-item">
            {svc.status === 'ok'
              ? <CheckCircle size={14} className="text-success" />
              : <AlertCircle size={14} className="text-warning" />}
            <span className="sh-name">{svc.name}</span>
            <span className="sh-latency">{svc.latency}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
