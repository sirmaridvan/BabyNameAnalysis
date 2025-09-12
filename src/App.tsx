import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler,
  Legend,
  Title
} from 'chart.js';
import { getNameTrend, loadData, listAllNames } from './dataLoader';
import type { NameTrendResult } from './types';

// Turkish vowel checker
function hasTurkishVowel(str: string): boolean {
  return /[aeıioöuü]/i.test(str.toLowerCase());
}

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Filler, Legend, Title);

interface SearchState { name: string; gender: string; country: string; }

export default function App() {
  const [query, setQuery] = useState<SearchState>({ name: '', gender: 'all', country: 'all' });
  const [trend, setTrend] = useState<NameTrendResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataReady, setDataReady] = useState(false);
  const [allNames, setAllNames] = useState<string[]>([]);

  useEffect(() => {
    loadData()
      .then(() => listAllNames())
      .then(names => { setAllNames(names); setDataReady(true); })
      .catch(e => setError(e.message));
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.name) return;
    setError(null);
    setLoading(true);
    try {
      const res = await getNameTrend(query.name);
      setTrend(res);
    } catch (err: any) {
      setError(err.message || 'Failed to search');
    } finally {
      setLoading(false);
    }
  }

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    setQuery(q => ({ ...q, name: val }));
  }

  const chartData = trend ? {
    labels: trend.byYear.map(p => p.year),
    datasets: [
      { label: `${trend.name} usage`, data: trend.byYear.map(p => p.count), tension: 0.3, fill: true, backgroundColor: 'rgba(99,102,241,0.18)', borderColor: '#6366f1', pointRadius: 4, pointHoverRadius: 6, pointBackgroundColor: '#6366f1', pointBorderWidth: 0 }
    ]
  } : undefined;

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#f1f5f9' } }, title: { display: false }, tooltip: { mode: 'index' as const, intersect: false } }, interaction: { mode: 'index' as const, intersect: false }, scales: { x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.04)' } }, y: { beginAtZero: true, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.04)' } } } };

  return (
    <div className="container">
      <h1>Baby Name Trend Explorer</h1>
      <div className="search-card">
        <form onSubmit={handleSearch}>
          <div className="field">
            <label htmlFor="name">Name (type or select)</label>
            <input id="name" list="names-list" placeholder="e.g. Emma" value={query.name} onChange={e => setQuery(q => ({ ...q, name: e.target.value }))} />
            <datalist id="names-list">
              {allNames.map(n => <option key={n} value={n} />)}
            </datalist>
          </div>
          <div className="field">
            <label htmlFor="nameSelect">Or pick from list</label>
            <select id="nameSelect" value={query.name} onChange={handleSelectChange} disabled={!allNames.length}>
              <option value="">-- Select a name --</option>
              {allNames.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <button type="submit" disabled={!query.name || loading}>{loading ? 'Analyzing…' : 'Analyze'}</button>
        </form>
        {!dataReady && !error && <div className="loading" style={{marginTop:'0.75rem', fontSize:'0.8rem'}}>Loading dataset…</div>}
        {error && <div className="alert" style={{marginTop:'0.75rem'}}>{error}</div>}
      </div>
      <div className="results">
        {!trend && dataReady && !loading && !error && <div className="card empty">Select or enter a name then click Analyze.</div>}
        {trend === null && query.name && !loading && dataReady && !error && <div className="card empty">No data found for name "{query.name}".</div>}
        {trend && (
          <div className="card">
            <h2 style={{margin:'0 0 1rem', fontSize:'1.3rem', letterSpacing:'-0.5px'}}>{trend.name} Over Time</h2>
            <div className="summary-grid">
              <div className="summary-item"><span>Total</span><strong>{trend.total.toLocaleString()}</strong></div>
              <div className="summary-item"><span>Years Tracked</span><strong>{trend.byYear.length}</strong></div>
              {trend.earliestYear && <div className="summary-item"><span>Earliest Year</span><strong>{trend.earliestYear}</strong></div>}
              {trend.latestYear && <div className="summary-item"><span>Latest Year</span><strong>{trend.latestYear}</strong></div>}
              {trend.averagePerYear && <div className="summary-item"><span>Avg / Year</span><strong>{Math.round(trend.averagePerYear).toLocaleString()}</strong></div>}
              {trend.peak && <div className="summary-item"><span>Peak Year</span><strong>{trend.peak.year} ({trend.peak.count.toLocaleString()})</strong></div>}
            </div>
            {/* Checklist rules */}
            {query.name && (
              <div className="checklist">
                {(() => {
                  const rules = [
                    { label: 'Son 7 yılda en çok tercih edilen isimler arasında', ok: !!trend },
                    { label: 'Ünlü harf içeriyor', ok: hasTurkishVowel(query.name) }
                  ];
                  return rules.map(r => (
                    <div key={r.label} className={`check-item ${r.ok ? 'ok' : 'fail'}`}>
                      <span className="check-icon" aria-hidden>{r.ok ? '✅' : '❌'}</span>
                      <span>{r.label}</span>
                    </div>
                  ));
                })()}
              </div>
            )}
            <div className="chart-wrapper" style={{marginTop:'1.4rem'}}>
              {chartData && <Line data={chartData} options={chartOptions} />}
            </div>
          </div>
        )}
      </div>
      <footer>Dataset loaded from local embedded CSV. Built with React + Vite + Chart.js.</footer>
    </div>
  );
}
