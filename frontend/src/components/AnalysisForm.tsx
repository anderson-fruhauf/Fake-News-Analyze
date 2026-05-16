import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import api from '../services/api';
import type { AnalysisResultType } from '../App';

interface Props {
  onResult: (result: AnalysisResultType) => void;
  setLoading: (loading: boolean) => void;
  isLoading: boolean;
}

export default function AnalysisForm({ onResult, setLoading, isLoading }: Props) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    try {
      setError('');
      setLoading(true);
      const { data } = await api.post('/analysis/link', { url });
      onResult(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao processar o link. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="fade-in">
      <div style={{ position: 'relative' }}>
        <input
          type="url"
          className="premium-input"
          placeholder="Cole a URL da notícia ou postagem aqui..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          style={{ paddingRight: '120px' }}
        />
        <button 
          type="submit" 
          className="premium-btn" 
          disabled={isLoading || !url}
          style={{ position: 'absolute', right: '4px', top: '4px', bottom: '4px', padding: '0 24px' }}
        >
          {isLoading ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
          {isLoading ? 'Analisando...' : 'Analisar'}
        </button>
      </div>
      {error && <p style={{ color: 'var(--status-false)', marginTop: '12px', fontSize: '0.9rem' }}>{error}</p>}
      
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </form>
  );
}
