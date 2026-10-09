import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import {
  UploadCloud,
  FileText,
  Trash2,
  BookOpen,
  HelpCircle,
  Search,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle,
  FileDown
} from 'lucide-react';
import './Materials.css';

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await api.get('/materials');
      setMaterials(res.data);
    } catch (err) {
      console.error('Error fetching materials', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file) => {
    setErrorMessage('');
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Only PDF study materials are supported.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('File size exceeds 25 MB limit.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setUploadProgress(40);
      await api.post('/materials/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });
      await fetchMaterials();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to upload PDF study material.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this study material?')) {
      try {
        await api.delete(`/materials/${id}`);
        setMaterials(materials.filter((m) => m.id !== id));
      } catch (err) {
        alert('Failed to delete material');
      }
    }
  };

  const handleOpenPdf = (id) => {
    const token = localStorage.getItem('pm_token');
    window.open(`http://localhost:8080/api/materials/${id}/download?token=${token}`, '_blank');
  };

  const filtered = materials.filter((m) =>
    m.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="materials-page">
      <div className="page-header">
        <div>
          <h2>Study Materials & PDFs</h2>
          <p className="page-sub">Upload lecture notes, slides, and syllabus documents for AI assistance</p>
        </div>
      </div>

      {errorMessage && (
        <div className="error-alert">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        className={`upload-dropzone ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <div className="upload-icon-circle">
          {uploading ? (
            <Loader2 size={32} className="spin" color="var(--primary)" />
          ) : (
            <UploadCloud size={32} color="var(--primary)" />
          )}
        </div>
        <div className="upload-instructions">
          <h4>{uploading ? 'Processing & Extracting PDF...' : 'Drag & drop study PDF here'}</h4>
          <p>or click to browse from device (supports up to 25 MB)</p>
        </div>
        {uploading && (
          <div className="progress-bar-container">
            <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
          </div>
        )}
      </div>

      {/* Search & Material Controls */}
      <div className="materials-toolbar">
        <div className="search-box">
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search study materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="materials-counter">
          <span>{filtered.length} Documents</span>
        </div>
      </div>

      {/* Grid of PDF Cards */}
      {loading ? (
        <div className="loading-state">
          <Loader2 className="spin" size={32} color="var(--primary)" />
          <p>Loading your study library...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-materials">
          <FileText size={48} color="var(--text-muted)" />
          <h3>No study materials uploaded yet</h3>
          <p>Upload a course syllabus or lecture slides to enable AI summaries and quizzes.</p>
        </div>
      ) : (
        <div className="materials-grid">
          {filtered.map((item) => (
            <div key={item.id} className="material-card">
              <div className="card-file-header">
                <div className="file-icon-badge">
                  <FileText size={22} color="#dc2626" />
                </div>
                <button
                  className="delete-icon-btn"
                  onClick={(e) => handleDelete(item.id, e)}
                  title="Delete PDF"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="file-details">
                <h4 className="file-name" title={item.fileName}>{item.fileName}</h4>
                <div className="file-meta">
                  <span>{(item.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
                  <span>•</span>
                  <span>{item.pageCount} Pages</span>
                  <span>•</span>
                  <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="card-actions">
                <button
                  className="btn-action btn-outline"
                  onClick={() => handleOpenPdf(item.id)}
                  title="Open PDF"
                >
                  <ExternalLink size={14} /> Open
                </button>
                <button
                  className="btn-action btn-summary"
                  onClick={() => navigate(`/materials/${item.id}/summary`)}
                  title="Summarize PDF"
                >
                  <BookOpen size={14} /> Summarize
                </button>
                <button
                  className="btn-action btn-quiz"
                  onClick={() => navigate(`/quizzes?materialId=${item.id}&topic=${encodeURIComponent(item.fileName.replace('.pdf',''))}`)}
                  title="Generate Quiz"
                >
                  <HelpCircle size={14} /> Quiz
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
