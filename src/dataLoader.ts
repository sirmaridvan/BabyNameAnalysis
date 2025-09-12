import Papa from 'papaparse';
import type { BabyNameRow, NameTrendResult } from './types';

// Trending / popular names dataset
const DATA_FILE = '/data/new_names.csv';
// Common names dataset
const COMMON_DATA_FILE = '/data/common_names.csv';

let cache: BabyNameRow[] | null = null;
let commonCache: BabyNameRow[] | null = null;

function normalizeName(name: string): string {
  return name.trim().toLocaleLowerCase('tr');
}

function sanitizeParsed(rows: any[]): BabyNameRow[] {
  return (rows as any as BabyNameRow[])
    .map(r => ({ ...r, Name: r.Name ? String(r.Name).trim() : r.Name }))
    .filter(r => r && r.Name && !Number.isNaN(r.BirthYear));
}

async function fetchAndParse(path: string, label: string): Promise<BabyNameRow[]> {
  const response = await fetch(path);
  if (!response.ok) {
    console.warn(`[dataLoader] ${label} dataset not found at ${path}`);
    return [];
  }
  let text = await response.text();
  // Remove UTF-8 BOM if present
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  const parsed = Papa.parse(text, {
    header: true,
    delimiter: ';',
    skipEmptyLines: true,
    transform: (value: string, field: string) => {
      if (field === 'BirthYear' || field === 'NumberOfName' || field === 'Order') return value ? Number(value.trim()) : 0;
      return typeof value === 'string' ? value.trim() : value;
    }
  });
  if (parsed.errors.length) console.warn(`Parsing errors (${label}):`, parsed.errors.slice(0, 5));
  return sanitizeParsed(parsed.data as any);
}

export async function loadData(): Promise<BabyNameRow[]> {
  if (cache) return cache;
  cache = await fetchAndParse(DATA_FILE, 'popular');
  return cache;
}

export async function loadCommonData(): Promise<BabyNameRow[]> {
  if (commonCache) return commonCache;
  commonCache = await fetchAndParse(COMMON_DATA_FILE, 'common');
  return commonCache;
}

// Return a sorted list of distinct names (case preserved from first occurrence)
export async function listAllNames(): Promise<string[]> {
  const data = await loadData();
  const seen = new Map<string, string>();
  for (const row of data) {
    const key = normalizeName(row.Name);
    if (!seen.has(key)) seen.set(key, row.Name);
  }
  return [...seen.values()].sort((a,b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

function buildTrend(rows: BabyNameRow[], name: string): NameTrendResult | null {
  if (!rows.length) return null;
  const byYearMap = new Map<number, number>();
  for (const row of rows) byYearMap.set(row.BirthYear, (byYearMap.get(row.BirthYear) || 0) + row.NumberOfName);
  const years = [...byYearMap.keys()].sort((a,b) => a-b);
  if (!years.length) return null;
  const byYear = years.map(y => ({ year: y, count: byYearMap.get(y)! }));
  const total = byYear.reduce((s,p) => s + p.count, 0);
  const earliestYear = years[0];
  const latestYear = years[years.length - 1];
  const averagePerYear = total / years.length;
  const peak = byYear.reduce((max, p) => p.count > max.count ? p : max, byYear[0]);
  return { name, total, byYear, earliestYear, latestYear, averagePerYear, peak };
}

export async function getNameTrend(rawName: string): Promise<NameTrendResult | null> {
  const name = rawName.trim();
  if (!name) return null;
  const data = await loadData();
  const lower = normalizeName(name);
  const subset = data.filter(r => normalizeName(r.Name) === lower);
  if (!subset.length) return null;
  return buildTrend(subset, name);
}

export async function getCommonNameTrend(rawName: string): Promise<NameTrendResult | null> {
  const name = rawName.trim();
  if (!name) return null;
  const data = await loadCommonData();
  if (!data.length) return null;
  const lower = normalizeName(name);
  const subset = data.filter(r => normalizeName(r.Name) === lower);
  if (!subset.length) return null;
  return buildTrend(subset, name);
}

export async function isInCommonNames(rawName: string): Promise<boolean> {
  return !!(await getCommonNameTrend(rawName));
}
