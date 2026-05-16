import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Loader2, FileImage } from 'lucide-react';
import api from '../services/api';
import type { AnalysisResultType } from '../App';

interface Props {
  onResult: (result: AnalysisResultType) => void;
  setLoading: (loading: boolean) => void;
  isLoading: boolean;
}

export default function ImageUploader({ onResult, setLoading, isLoading }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (selected.size > 5 * 1024 * 1024) {
        setError('O arquivo deve ter no máximo 5MB.');
        return;
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setError('');
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        const pastedFile = e.clipboardData.files[0];
        if (pastedFile.type.startsWith('image/')) {
          if (pastedFile.size > 5 * 1024 * 1024) {
            setError('A imagem colada deve ter no máximo 5MB.');
            return;
          }
          setFile(pastedFile);
          setPreview(URL.createObjectURL(pastedFile));
          setError('');
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);


  const handleSubmit = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setError('');
      setLoading(true);
      const { data } = await api.post('/analysis/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onResult(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao processar a imagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      {!preview ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          style={{ 
            border: '2px dashed var(--glass-border)', 
            borderRadius: 'var(--radius-md)', 
            padding: '48px 24px', 
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: 'var(--bg-surface)'
          }}
          onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--accent-color)')}
          onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--glass-border)')}
        >
          <UploadCloud size={48} color="var(--accent-color)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ marginBottom: '8px' }}>Clique, arraste ou cole (Ctrl+V) a imagem aqui</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Suporta JPG, PNG e WebP (Max 5MB)</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/jpeg, image/png, image/webp" 
            hidden 
          />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
            <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><FileImage size={18} /> {file?.name}</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
              {(file!.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleSubmit} className="premium-btn" disabled={isLoading}>
                {isLoading ? <Loader2 className="spin" size={18} /> : <UploadCloud size={18} />}
                {isLoading ? 'Analisando...' : 'Analisar Imagem'}
              </button>
              <button 
                onClick={() => { setFile(null); setPreview(null); }} 
                className="premium-btn" 
                style={{ background: 'transparent', boxShadow: 'none', border: '1px solid var(--glass-border)' }}
                disabled={isLoading}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {error && <p style={{ color: 'var(--status-false)', marginTop: '12px', fontSize: '0.9rem' }}>{error}</p>}
    </div>
  );
}
