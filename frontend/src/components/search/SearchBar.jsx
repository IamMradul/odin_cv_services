import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';
import './search.css';

export const SearchBar = ({ onSearch, value, onChange, isLoading }) => {
  const inputRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = inputRef.current?.value?.trim();
    if (q) onSearch(q);
  };

  const handleClear = () => {
    if (inputRef.current) inputRef.current.value = '';
    onChange?.('');
  };

  return (
    <form className="search-bar-form" onSubmit={handleSubmit}>
      <div className="search-bar-wrapper">
        <Search size={20} className="search-bar-icon" />
        <input
          ref={inputRef}
          id="search-input"
          type="text"
          className="search-bar-input"
          placeholder="Describe what you're looking for, e.g. &quot;person in red jacket near Gate A at 14:30&quot;"
          autoComplete="off"
          defaultValue={value}
        />
        {value && (
          <button type="button" className="search-clear-btn icon-button" onClick={handleClear} aria-label="Clear search">
            <X size={16} />
          </button>
        )}
        <button type="submit" className="btn btn-primary search-submit" disabled={isLoading}>
          {isLoading ? 'Searching…' : 'Search'}
        </button>
      </div>
    </form>
  );
};
