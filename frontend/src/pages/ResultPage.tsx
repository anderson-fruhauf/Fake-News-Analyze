import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Loader2, ShieldCheck, Copy, Check } from 'lucide-react';
import api from '../services/api';
import ResultCard from '../components/ResultCard';
import type { AnalysisResultType } from '../App';

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<AnalysisResultType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get(`/analysis/${id}`);
        setResult(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Não foi possível carregar o resultado.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchResult();
    }
  }, [id]);

  const handleShare = async () => {
    const shareData = {
      title: 'Análise de Fake News - TruthLens AI',
      text: `Veja a análise desta notícia: ${result?.verdict}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 className="spin" size={48} color="var(--accent-color)" />
        <p style={{ marginTop: '24px', color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Carregando análise...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '48px' }}>
          <h2 style={{ color: 'var(--status-false)', marginBottom: '16px' }}>Erro</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>{error}</p>
          <button className="premium-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={18} /> Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px 80px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <button 
          onClick={() => navigate('/')} 
          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '1rem', transition: 'color 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <ArrowLeft size={20} /> Voltar
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-color)', fontWeight: 600 }}>
          <ShieldCheck size={24} />
          <span>TruthLens AI</span>
        </div>

        <button 
          onClick={handleShare} 
          className="premium-btn"
          style={{ padding: '10px 20px' }}
        >
          {copied ? <Check size={18} /> : <Share2 size={18} />}
          {copied ? 'Link Copiado!' : 'Compartilhar'}
        </button>
      </div>

      {result && <ResultCard result={result} />}

      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Esta análise foi gerada por IA e deve ser usada apenas para fins informativos.
        </p>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
