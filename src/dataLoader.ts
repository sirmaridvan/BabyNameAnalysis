import Papa from 'papaparse';
import type { BabyNameRow, NameTrendResult } from './types';

// We'll place the data file under public (Vite will serve as /data/names.csv)
// Format: BirthYear;Country;Name;Gender;NumberOfName;Order

let cache: BabyNameRow[] | null = null;

export async function loadData(): Promise<BabyNameRow[]> {
  if (cache) return cache;
  const response = await fetch('/data/names.csv');
  if (!response.ok) throw new Error('Failed to load data file');
  const text = await response.text();
  const parsed = Papa.parse(text, {
    header: true,
    delimiter: ';',
    skipEmptyLines: true,
    transform: (value, field) => {
      if (field === 'BirthYear' || field === 'NumberOfName' || field === 'Order') return value ? Number(value) : 0;
      return value;
    }
  });
  if (parsed.errors.length) {
    console.warn('Parsing errors:', parsed.errors.slice(0, 5));
  }
  cache = (parsed.data as any as BabyNameRow[]).filter(r => r.Name && !Number.isNaN(r.BirthYear));
  return cache;
}

// Return a sorted list of distinct names (case preserved from first occurrence)
export async function listAllNames(): Promise<string[]> {
  const data = await loadData();
  const seen = new Set<string>();
  const names: string[] = [];
  for (const row of data) {
    const key = row.Name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      names.push(row.Name);
    }
  }
  names.sort((a,b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  return names;
}

export async function getNameTrend(rawName: string): Promise<NameTrendResult | null> {
  const name = rawName.trim();
  if (!name) return null;
  const data = await loadData();
  const lower = name.toLowerCase();
  const subset = data.filter(r => r.Name.toLowerCase() === lower);
  if (!subset.length) return null;
  const byYearMap = new Map<number, number>();
  for (const row of subset) {
    byYearMap.set(row.BirthYear, (byYearMap.get(row.BirthYear) || 0) + row.NumberOfName);
  }
  const years = [...byYearMap.keys()].sort((a,b) => a-b);
  const byYear = years.map(y => ({ year: y, count: byYearMap.get(y)! }));
  const total = byYear.reduce((s,p) => s + p.count, 0);
  const earliestYear = years[0];
  const latestYear = years[years.length - 1];
  const averagePerYear = total / years.length;
  let peak = byYear.reduce((max, p) => p.count > max.count ? p : max, byYear[0]);

  return { name, total, byYear, earliestYear, latestYear, averagePerYear, peak };
}
