import React, { useState } from 'react';

const FileUpload = ({ onFileSelect, accept, maxSize, multiple = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const maxSizeBytes = maxSize || parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 10485760;
  const allowedTypes = accept || import.meta.env.VITE_ALLOWED_FILE_TYPES || 'jpg,jpeg,png,pdf,doc,docx';

  const validateFile = (file) => {
    if (file.size > maxSizeBytes) {
      setError(`File size must be less than ${Math.round(maxSizeBytes / 1024 / 1024)}MB`);
      return false;
    }

    const fileExtension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = allowedTypes.split(',').map(ext => ext.trim().toLowerCase());
    
    if (!allowedExtensions.includes(fileExtension)) {
      setError(`File type not allowed. Allowed types: ${allowedTypes}`);
      return false;
    }

    setError('');
    return true;
  };

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter(file => validateFile(file));
    
    if (validFiles.length > 0) {
      onFileSelect(multiple ? validFiles : validFiles[0]);
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
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div className="w-100">
      <div
        className={`border border-2 border-dashed rounded-lg p-6 text-center ${
          dragActive ? 'border-primary bg-light' : 'border-secondary'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple={multiple}
          accept={`.${allowedTypes.replace(/,/g, ',.')}`}
          onChange={handleChange}
          className="d-none"
          id="file-upload"
        />
        
        <div className="space-y-2">
          <div className="d-flex justify-content-center">
            <i className="fas fa-cloud-upload-alt fa-3x text-muted"></i>
          </div>
          <p className="mb-0">
            <span className="fw-medium">Click to upload</span> or drag and drop
          </p>
          <p className="text-muted small mb-0">
            {allowedTypes.toUpperCase()} files up to {Math.round(maxSizeBytes / 1024 / 1024)}MB
          </p>
          <label htmlFor="file-upload" className="btn btn-primary btn-sm mt-2">
            <i className="fas fa-folder-open me-2"></i>
            Browse Files
          </label>
        </div>
      </div>
      
      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
