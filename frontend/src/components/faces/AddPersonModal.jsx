import React, { useState } from 'react';
import { X, Upload, UserPlus } from 'lucide-react';
import './faces.css';

export const AddPersonModal = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 'var(--space-4)'
    }}>
      <div style={{
        background: 'var(--surface-color)',
        borderRadius: 'var(--radius-card)',
        width: '100%',
        maxWidth: 500,
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fade-in 0.2s ease-out'
      }}>
        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 'var(--font-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <UserPlus size={20} className="text-primary" />
            Add Person to Database
          </h2>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>
        
        <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--font-sm)', fontWeight: 500 }}>Full Name</label>
            <input type="text" className="search-bar-input" placeholder="e.g. John Doe" style={{ width: '100%', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-input)', padding: 'var(--space-2)' }} />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--font-sm)', fontWeight: 500 }}>Role / Category</label>
              <select className="filter-select" style={{ width: '100%' }}>
                <option>Unknown</option>
                <option>Employee</option>
                <option>Contractor</option>
                <option>VIP</option>
                <option>Watchlist</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--font-sm)', fontWeight: 500 }}>Clearance Level</label>
              <select className="filter-select" style={{ width: '100%' }}>
                <option>Level 1 (Basic)</option>
                <option>Level 2 (Restricted)</option>
                <option>Level 3 (High)</option>
                <option>None</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--font-sm)', fontWeight: 500 }}>Reference Image</label>
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
            />
            
            {!selectedFile ? (
              <div 
                onClick={() => document.getElementById('file-upload').click()}
                style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-card)', padding: 'var(--space-5)', textAlign: 'center', background: 'var(--bg-color)', cursor: 'pointer' }}
              >
                <Upload size={24} className="text-muted" style={{ margin: '0 auto var(--space-2)' }} />
                <div style={{ fontSize: 'var(--font-sm)', fontWeight: 500 }}>Click to upload or drag & drop</div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>JPG, PNG or WEBP (max 5MB)</div>
              </div>
            ) : (
              <div style={{ position: 'relative', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', padding: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <img 
                  src={URL.createObjectURL(selectedFile)} 
                  alt="Preview" 
                  style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 'var(--radius-input)' }} 
                />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 'var(--font-sm)', fontWeight: 500, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{selectedFile.name}</div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{(selectedFile.size / 1024).toFixed(1)} KB</div>
                </div>
                <button 
                  className="icon-button" 
                  onClick={() => setSelectedFile(null)}
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onClose}>Add to Database</button>
        </div>
      </div>
    </div>
  );
};
