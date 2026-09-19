import React, { useState } from 'react';
import { FaceCard } from '../components/faces/FaceCard';
import { FaceGrid } from '../components/faces/FaceGrid';
import { FaceDetails } from '../components/faces/FaceDetails';
import { FaceFilters } from '../components/faces/FaceFilters';
import { AddPersonModal } from '../components/faces/AddPersonModal';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { useFaces } from '../hooks/useFaces';
import { Users, Info, UserPlus } from 'lucide-react';
import '../components/faces/faces.css';

const FaceDatabase = () => {
  const [filters, setFilters] = useState({ query: '', status: 'all' });
  const { faces, isLoading, error, refetch } = useFaces(filters);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="face-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Face Database</h1>
          <p className="page-subtitle">Authorized face records and OSINT pipeline integration.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <UserPlus size={16} />
          Add Person
        </button>
      </div>

      {/* Privacy Notice */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3) var(--space-4)', background: 'var(--info-light)', border: '1px solid var(--info-border)', borderRadius: 'var(--radius-card)', marginBottom: 'var(--space-5)', fontSize: 'var(--font-sm)', color: 'var(--info-color)' }}>
        <Info size={16} />
        <span><strong>Privacy:</strong> A face match is NOT proof of identity. Labels such as "Potential Match" are used to indicate possible associations only.</span>
      </div>

      <FaceFilters filters={filters} onFilterChange={setFilters} />

      {isLoading ? (
        <LoadingState rows={6} />
      ) : error ? (
        <ErrorState message="Unable to load face records." onRetry={refetch} />
      ) : faces.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No face records found"
          description="No records match the current filters."
          action={() => setFilters({ query: '', status: 'all' })}
          actionLabel="Clear Filters"
          actionVariant="secondary"
        />
      ) : (
        <FaceGrid>
          {faces.map(person => (
            <FaceCard
              key={person.id}
              person={person}
              onView={setSelectedPerson}
              onOsint={setSelectedPerson}
            />
          ))}
        </FaceGrid>
      )}

      <FaceDetails
        person={selectedPerson}
        isOpen={!!selectedPerson}
        onClose={() => setSelectedPerson(null)}
      />

      <AddPersonModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};

export default FaceDatabase;
