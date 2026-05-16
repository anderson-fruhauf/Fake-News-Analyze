import type { AnalysisResultType } from '../App';
import { ShieldAlert, ShieldCheck, HelpCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
  result: AnalysisResultType;
}

export default function ResultCard({ result }: Props) {
  
  const getStatusConfig = () => {
    switch (result.verdict) {
      case 'VERDADEIRO':
        return { color: 'var(--status-true)', icon: <ShieldCheck size={48} />, label: 'Verdadeiro', bg: 'rgba(16, 185, 129, 0.1)' };
      case 'FALSO':
        return { color: 'var(--status-false)', icon: <ShieldAlert size={48} />, label: 'Falso (Fake News)', bg: 'rgba(239, 68, 68, 0.1)' };
      case 'PARCIALMENTE_VERDADEIRO':
        return { color: 'var(--status-partial)', icon: <AlertTriangle size={48} />, label: 'Parcialmente Verdadeiro', bg: 'rgba(245, 158, 11, 0.1)' };
      case 'NAO_APLICAVEL':
        return { color: 'var(--text-secondary)', icon: <HelpCircle size={48} />, label: 'Não é uma notícia/Irrelevante', bg: 'rgba(255, 255, 255, 0.05)' };
      default:
        return { color: 'var(--status-inconclusive)', icon: <HelpCircle size={48} />, label: 'Inconclusivo', bg: 'rgba(107, 114, 128, 0.1)' };
    }
  };

  const config = getStatusConfig();
  const confidencePercent = Math.round(result.confidence * 100);

  return (
    <div className="glass-panel fade-in" style={{ padding: '0', overflow: 'hidden' }}>
      
      <div style={{ background: config.bg, padding: '32px', display: 'flex', alignItems: 'center', gap: '24px', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ color: config.color, background: 'var(--bg-main)', padding: '16px', borderRadius: '50%', boxShadow: `0 0 20px ${config.bg}` }}>
          {config.icon}
        </div>
        <div>
          <h2 style={{ fontSize: '2rem', color: config.color, marginBottom: '8px' }}>{config.label}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <div style={{ width: '100px', height: '6px', background: 'var(--bg-surface)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${confidencePercent}%`, height: '100%', background: config.color }}></div>
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{confidencePercent}% de Confiança</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '32px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Resumo da Análise</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '32px', fontSize: '1.05rem' }}>
          {result.explanation}
        </p>

        {result.centralClaims && result.centralClaims.length > 0 && (
          <>
            <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Alegações Centrais Identificadas</h3>
            <ul style={{ listStyle: 'none' }}>
              {result.centralClaims.map((claim, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px', background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                  <CheckCircle2 size={20} color="var(--accent-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ color: 'var(--text-primary)', lineHeight: '1.5' }}>{claim}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

    </div>
  );
}
