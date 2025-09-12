# Baby Name Analysis

React + Vite application to analyze baby name trends from a bundled semicolon-separated CSV file (originally an Excel export).

## Data File Format

File: `public/data/names.csv`

Columns (semicolon `;` delimited):
```
BirthYear;Country;Name;Gender;NumberOfName;Order
```

## Development

Install dependencies:
```
npm install
```

Run dev server:
```
npm run dev
```

Build for production:
```
npm run build
```

## How It Works
- CSV is fetched on load and parsed with PapaParse.
- User enters a name, app aggregates counts per year.
- Chart.js renders a line chart of usage over the years.

## Next Ideas
- Add gender & country filters
- Add top N names for a selected year
- Add caching layer / web worker for large datasets
