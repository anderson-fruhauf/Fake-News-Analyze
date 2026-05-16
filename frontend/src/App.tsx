import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import ResultPage from './pages/ResultPage';

export type AnalysisResultType = {
  id: string;
  type: string;
  verdict: 'VERDADEIRO' | 'FALSO' | 'PARCIALMENTE_VERDADEIRO' | 'INCONCLUSIVO' | 'NAO_APLICAVEL';
  explanation: string;
  confidence: number;
  centralClaims: string[];
};

function App() {
  return (
    <>
      <div className="bg-gradient-animate"></div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/result/:id" element={<ResultPage />} />
      </Routes>
    </>
  );
}

export default App;
