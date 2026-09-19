import React, { useState } from 'react';
import { FootageCard } from '../components/footage/FootageCard';
import { FootageViewer } from '../components/footage/FootageViewer';
import { FootageFilters } from '../components/footage/FootageFilters';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { useFootage } from '../hooks/useFootage';
import { Video } from 'lucide-react';
import '../components/footage/footage.css';

const FootageDatabase = () => {
  const [filters, setFilters] = useState({ camera: 'all', date: '' });
  const { clips, isLoading, error, refetch } = useFootage(filters);
  const [selectedClip, setSelectedClip] = useState(null);

  return (
    <div className="footage-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Footage Database</h1>
          <p className="page-subtitle">Browse and review recorded surveillance clips.</p>
        </div>
      </div>

      <FootageFilters filters={filters} onFilterChange={setFilters} />

      {isLoading ? (
        <LoadingState rows={6} />
      ) : error ? (
        <ErrorState message="Unable to load footage." onRetry={refetch} />
      ) : clips.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No footage found"
          description="No clips match the selected filters."
          action={() => setFilters({ camera: 'all', date: '' })}
          actionLabel="Clear Filters"
          actionVariant="secondary"
        />
      ) : (
        <div className="footage-grid">
          {clips.map(clip => (
            <FootageCard key={clip.id} clip={clip} onClick={setSelectedClip} />
          ))}
        </div>
      )}

      <FootageViewer
        clip={selectedClip}
        isOpen={!!selectedClip}
        onClose={() => setSelectedClip(null)}
      />
    </div>
  );
};

export default FootageDatabase;
