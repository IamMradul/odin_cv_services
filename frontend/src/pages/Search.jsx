import React, { useState } from 'react';
import { SearchBar } from '../components/search/SearchBar';
import { SearchFilters } from '../components/search/SearchFilters';
import { SearchResultCard } from '../components/search/SearchResultCard';
import { SearchHistory } from '../components/search/SearchHistory';
import { FrameViewer } from '../components/search/FrameViewer';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import { useSearch } from '../hooks/useSearch';
import { Search as SearchIcon } from 'lucide-react';
import '../components/search/search.css';

const Search = () => {
  const { results, isLoading, hasSearched, history, search, clearHistory } = useSearch();
  const [selectedResult, setSelectedResult] = useState(null);
  const [query, setQuery] = useState('');

  const handleSearch = (q) => {
    setQuery(q);
    search(q);
  };

  return (
    <div className="search-page">
      <div className="search-page-header">
        <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
          <div>
            <h1 className="page-title">Footage Search</h1>
            <p className="page-subtitle">Natural-language footage and event search with frame-by-frame viewer.</p>
          </div>
        </div>
        <SearchBar onSearch={handleSearch} value={query} onChange={setQuery} isLoading={isLoading} />
      </div>

      <div className="search-content-layout">
        <aside>
          <SearchFilters />
        </aside>

        <div className="search-results-area">
          {!hasSearched && history.length > 0 && (
            <SearchHistory
              history={history}
              onSelect={handleSearch}
              onClear={clearHistory}
            />
          )}

          {isLoading ? (
            <LoadingState rows={4} />
          ) : hasSearched ? (
            results.length === 0 ? (
              <EmptyState
                icon={SearchIcon}
                title="No matching footage found"
                description="Try different search terms or adjust your filters."
              />
            ) : (
              <>
                <div className="results-header">
                  <span className="results-count">Found {results.length} relevant result{results.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="results-grid">
                  {results.map(r => (
                    <SearchResultCard key={r.id} result={r} onClick={setSelectedResult} />
                  ))}
                </div>
              </>
            )
          ) : (
            <EmptyState
              icon={SearchIcon}
              title="Search for footage"
              description="Describe what you're looking for — people, vehicles, events, or locations."
            />
          )}
        </div>
      </div>

      <FrameViewer
        result={selectedResult}
        isOpen={!!selectedResult}
        onClose={() => setSelectedResult(null)}
      />
    </div>
  );
};

export default Search;
