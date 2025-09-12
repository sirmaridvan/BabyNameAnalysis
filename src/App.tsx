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
import { analyzeNameWithAI } from './azureAI';
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
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiRaw, setAiRaw] = useState<string | null>(null); // preserve raw text for copy

  function formatAIResult(txt: string): string {
    const escape = (s: string) => s.replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]!));
    const safeLines = txt.split(/\n+/).map(l => l.trim()).filter(l => l.length);
    interface Section { title: string; body: string[]; }
    const sections: Section[] = [];
    let current: Section | null = null;
    const clean = (s: string) => s.replace(/^[:\s]+/, '').replace(/^[-–]\s*/, '');
    for (const rawLine of safeLines) {
      const line = clean(rawLine);
      const m = line.match(/^\d+\.\s*(\*\*.*?\*\*|[^:]{3,})/);
      if (m) {
        if (current) sections.push(current);
        let raw = m[1].trim();
        raw = raw.replace(/^[*:>\s]+/, '').replace(/\*\*/g,'');
        raw = clean(raw);
        current = { title: raw, body: [] };
        const remainder = line.replace(/^\d+\.\s*/, '').replace(m[1], '').trim();
        if (remainder) current.body.push(clean(remainder));
      } else if (current) {
        current.body.push(clean(line));
      } else {
        current = { title: 'Genel', body: [clean(line)] };
      }
    }
    if (current) sections.push(current);
    if (!sections.length) return `<p>${escape(clean(txt))}</p>`;
    const html = sections.map(sec => {
      const title = escape(clean(sec.title));
      const bodyHtml = sec.body.map(p => `<p>${escape(clean(p))}</p>`).join('');
      return `<div class="ai-section"><div class="ai-section-title">${title}</div><div class="ai-section-body">${bodyHtml}</div></div>`;
    }).join('');
    return html;
  }

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

  async function handleAIAnalyze() {
    if (!query.name) return;
    setAiError(null); setAiLoading(true); setAiResult(null); setAiRaw(null);
    try {
      const res = await analyzeNameWithAI(query.name);
      setAiRaw(res);
      setAiResult(formatAIResult(res));
    } catch (e: any) {
      setAiError(e.message || 'Yapay Zeka analizi başarısız');
    } finally { setAiLoading(false); }
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
          <button type="button" style={{background:'#0d9488'}} disabled={!query.name || aiLoading} onClick={handleAIAnalyze}>{aiLoading ? 'Yapay Zeka Analizi…' : 'Yapay Zeka Açıklaması'}</button>
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
        {aiResult && (
          <div className="card ai-card">
            <div className="ai-header">
              <h2>Yapay Zeka Analizi</h2>
              <div className="ai-header-actions">
                <button type="button" className="subtle" onClick={() => { if (aiRaw) { navigator.clipboard.writeText(aiRaw); } }} title="Metni kopyala">Kopyala</button>
              </div>
            </div>
            <div className="ai-body" dangerouslySetInnerHTML={{__html: aiResult}} />
            <div className="ai-footer-note">Otomatik oluşturulmuştur. Dini referansları doğrulamanız önerilir.</div>
          </div>
        )}
        {aiError && (
          <div className="card alert" style={{background:'rgba(239,68,68,0.1)'}}>{aiError}</div>
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
