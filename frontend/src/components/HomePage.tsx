import React, { useState } from 'react';
import { Search, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import AnalysisForm from './AnalysisForm';
import ImageUploader from './ImageUploader';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'link' | 'image'>('link');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleResult = (result: any) => {
    navigate(`/result/${result.id}`);
  };

  return (
    <main className="fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px' }}>
      
      <header style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-color)', marginBottom: '24px', boxShadow: '0 0 30px var(--accent-glow)' }}>
          <ShieldCheck size={32} color="#fff" />
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>TruthLens AI</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
          Analise links de notícias ou imagens para verificar a veracidade utilizando Inteligência Artificial avançada.
        </p>
      </header>

      <section className="glass-panel" style={{ padding: '32px', marginBottom: '32px' }}>
        
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
          <button 
            className={`premium-btn ${activeTab === 'link' ? '' : 'inactive-tab'}`} 
            style={{ background: activeTab === 'link' ? 'var(--bg-surface-hover)' : 'transparent', boxShadow: 'none', color: activeTab === 'link' ? 'var(--accent-color)' : 'var(--text-secondary)' }}
            onClick={() => setActiveTab('link')}
          >
            <Search size={20} />
            Analisar Link
          </button>
          <button 
            className={`premium-btn ${activeTab === 'image' ? '' : 'inactive-tab'}`} 
            style={{ background: activeTab === 'image' ? 'var(--bg-surface-hover)' : 'transparent', boxShadow: 'none', color: activeTab === 'image' ? 'var(--accent-color)' : 'var(--text-secondary)' }}
            onClick={() => setActiveTab('image')}
          >
            <ImageIcon size={20} />
            Analisar Imagem
          </button>
        </div>

        <div style={{ minHeight: '150px' }}>
          {activeTab === 'link' ? (
            <AnalysisForm onResult={handleResult} setLoading={setIsLoading} isLoading={isLoading} />
          ) : (
            <ImageUploader onResult={handleResult} setLoading={setIsLoading} isLoading={isLoading} />
          )}
        </div>

      </section>

    </main>
  );
}
