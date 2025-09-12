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
import { getNameTrend, loadData, getCommonNameTrend } from './dataLoader';
import type { NameTrendResult } from './types';

function conformsMajorVowelHarmony(str: string): boolean {
  const chars = str.toLowerCase().split('');
  const vowels = chars.filter(c => 'aeıioöuü'.includes(c));
  if (vowels.length <= 1) return true; // trivially true
  const front = new Set(['e','i','ö','ü']);
  const firstIsFront = front.has(vowels[0]);
  return vowels.every(v => front.has(v) === firstIsFront);
}
function conformsMinorVowelHarmony(str: string): boolean {
  const s = str.toLowerCase();
  const vowels = [...s].filter(c => 'aeıioöuü'.includes(c));
  if (vowels.length <= 1) return true;
  const rounded = new Set(['o','ö','u','ü']);
  const allowedAfterRounded = new Set(['a','e','u','ü']);
  for (let i = 1; i < vowels.length; i++) {
    const prev = vowels[i-1];
    const cur = vowels[i];
    if (rounded.has(prev) && !allowedAfterRounded.has(cur)) return false;
  }
  return true;
}
function hasTurkishChars(str: string): boolean { return /[ğüşöçıİ]/i.test(str); }

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Filler, Legend, Title);

interface SearchState { name: string; gender: string; country: string; }

export default function App() {
  const [query, setQuery] = useState<SearchState>({ name: '', gender: 'all', country: 'all' });
  const [trend, setTrend] = useState<NameTrendResult | null>(null);
  const [commonTrend, setCommonTrend] = useState<NameTrendResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataReady, setDataReady] = useState(false);
  const [searched, setSearched] = useState(false); // new flag

  useEffect(() => {
    loadData().then(() => setDataReady(true)).catch(e => setError(e.message));
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.name) return;
    setError(null); setLoading(true); setSearched(true);
    try {
      const [t, c] = await Promise.all([
        getNameTrend(query.name),
        getCommonNameTrend(query.name)
      ]);
      setTrend(t);
      setCommonTrend(c);
    } catch (err: any) {
      setError(err.message || 'Failed to search');
    } finally { setLoading(false); }
  }

  const chartData = trend ? {
    labels: trend.byYear.map(p => p.year),
    datasets: [
      { label: `${trend.name} kullanım`, data: trend.byYear.map(p => p.count), tension: 0.3, fill: true, backgroundColor: 'rgba(99,102,241,0.18)', borderColor: '#6366f1', pointRadius: 4, pointHoverRadius: 6, pointBackgroundColor: '#6366f1', pointBorderWidth: 0 }
    ]
  } : undefined;

  const commonChartData = commonTrend ? {
    labels: commonTrend.byYear.map(p => p.year),
    datasets: [
      { label: `${commonTrend.name} yaygın kullanım`, data: commonTrend.byYear.map(p => p.count), tension: 0.3, fill: true, backgroundColor: 'rgba(16,185,129,0.18)', borderColor: '#10b981', pointRadius: 4, pointHoverRadius: 6, pointBackgroundColor: '#10b981', pointBorderWidth: 0 }
    ]
  } : undefined;

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#f1f5f9' } }, title: { display: false }, tooltip: { mode: 'index' as const, intersect: false } }, interaction: { mode: 'index' as const, intersect: false }, scales: { x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.04)' } }, y: { beginAtZero: true, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.04)' } } } };

  return (
    <div className="container">
      <h1>İsim Trend Analizi</h1>
      <div className="search-card">
        <form onSubmit={handleSearch}>
          <div className="field">
            <label htmlFor="name">İsim</label>
            <input id="name" placeholder="örn. Mehmet" value={query.name} onChange={e => { const v = e.target.value; setQuery(q => ({ ...q, name: v })); setSearched(false); setTrend(null); }} />
          </div>
          <button type="submit" disabled={!query.name || loading}>{loading ? 'Analiz Ediliyor…' : 'Analiz Et'}</button>
        </form>
        {!dataReady && !error && <div className="loading" style={{marginTop:'0.75rem', fontSize:'0.8rem'}}>Veri yükleniyor…</div>}
        {error && <div className="alert" style={{marginTop:'0.75rem'}}>{error}</div>}
      </div>
      <div className="results">
        {searched && query.name && dataReady && !error && (
          <div className="card" style={{overflow:'hidden'}}>
            <h2 style={{margin:'0 0 0.9rem', fontSize:'1.05rem', letterSpacing:'-0.3px'}}>Kurallar</h2>
            <div className="checklist">
              {[{ label: 'Son 7 yılda en çok tercih edilen isimler arasında', ok: !!trend }, { label: 'Son 7 yıldaki en yaygın isimler arasında', ok: !!commonTrend }, { label: 'Büyük ünlü uyumuna uygun', ok: conformsMajorVowelHarmony(query.name) }, { label: 'Küçük ünlü uyumuna uygun', ok: conformsMinorVowelHarmony(query.name) }, { label: 'Türkçe karakter içeriyor', ok: hasTurkishChars(query.name) }]
                .map(r => (
                  <div key={r.label} className={`check-item ${r.ok ? 'ok' : 'fail'}`}>
                    <span className="check-icon" aria-hidden>{r.ok ? '✅' : '❌'}</span>
                    <span>{r.label}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
        {searched && trend && (
          <div className="card">
            <h2 style={{margin:'0 0 1rem', fontSize:'1.3rem', letterSpacing:'-0.5px'}}>{trend.name} Yıllara Göre</h2>
            <div className="summary-grid">
              <div className="summary-item"><span>Toplam</span><strong>{trend.total.toLocaleString()}</strong></div>
              <div className="summary-item"><span>Yıl Sayısı</span><strong>{trend.byYear.length}</strong></div>
              {trend.earliestYear && <div className="summary-item"><span>İlk Yıl</span><strong>{trend.earliestYear}</strong></div>}
              {trend.latestYear && <div className="summary-item"><span>Son Yıl</span><strong>{trend.latestYear}</strong></div>}
              {trend.averagePerYear && <div className="summary-item"><span>Yıllık Ortalama</span><strong>{Math.round(trend.averagePerYear).toLocaleString()}</strong></div>}
              {trend.peak && <div className="summary-item"><span>Zirve Yıl</span><strong>{trend.peak.year} ({trend.peak.count.toLocaleString()})</strong></div>}
            </div>
            <div className="chart-wrapper" style={{marginTop:'1.4rem'}}>
              {chartData && <Line data={chartData} options={chartOptions} />}
            </div>
          </div>
        )}
        {searched && commonTrend && (
          <div className="card">
            <h2 style={{margin:'0 0 1rem', fontSize:'1.3rem', letterSpacing:'-0.5px', color:'#10b981'}}>{commonTrend.name} Yaygın Kullanım</h2>
            <div className="summary-grid">
              <div className="summary-item"><span>Toplam</span><strong>{commonTrend.total.toLocaleString()}</strong></div>
              <div className="summary-item"><span>Yıl Sayısı</span><strong>{commonTrend.byYear.length}</strong></div>
              {commonTrend.earliestYear && <div className="summary-item"><span>İlk Yıl</span><strong>{commonTrend.earliestYear}</strong></div>}
              {commonTrend.latestYear && <div className="summary-item"><span>Son Yıl</span><strong>{commonTrend.latestYear}</strong></div>}
              {commonTrend.averagePerYear && <div className="summary-item"><span>Yıllık Ortalama</span><strong>{Math.round(commonTrend.averagePerYear).toLocaleString()}</strong></div>}
              {commonTrend.peak && <div className="summary-item"><span>Zirve Yıl</span><strong>{commonTrend.peak.year} ({commonTrend.peak.count.toLocaleString()})</strong></div>}
            </div>
            <div className="chart-wrapper" style={{marginTop:'1.4rem'}}>
              {commonChartData && <Line data={commonChartData} options={chartOptions} />}
            </div>
          </div>
        )}
      </div>
      <footer>Veri yerel gömülü CSV'den yüklendi. React + Vite + Chart.js ile oluşturuldu.</footer>
    </div>
  );
}
