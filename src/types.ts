export interface BabyNameRow {
  BirthYear: number; // e.g. 2020
  Country: string;   // e.g. USA
  Name: string;      // e.g. Emma
  Gender: string;    // e.g. F / M
  NumberOfName: number; // count usage that year
  Order: number;     // ranking order maybe
}

export interface NameTrendPoint {
  year: number;
  count: number;
}

export interface NameTrendResult {
  name: string;
  total: number;
  byYear: NameTrendPoint[];
  earliestYear?: number;
  latestYear?: number;
  averagePerYear?: number;
  peak?: { year: number; count: number };
}
