# Analytics pages

One file in `areas/` is one page of the **Analytics** menu. Files are found automatically (nothing to register), and an area with no widgets is hidden from the sidebar.

Copy `areas/schools.ts`, change `area` (the address), `title`, `icon` (an icon that exists in `lib/iconify/icon-datasets.ts`), `order` and the `sections`.
Each widget points at a dataset of the backend (`dataset`) and a part of its data (`path`, for example `kpis.totalSchools`, `series.newSchools`, `breakdowns.byStatus`, `tables.newSchools`).

Widget types: `kpi`, `line`, `area`, `bars`, `stacked`, `donut`, `table`, `heatmap`. The grid has 4 columns: `span` 1 to 4 (kpi 1, table 4, charts 2 by default).
The full guide, with how to write the backend dataset, is `backend/claude/07-analytics-and-reports.md`.
Do not edit `registry.ts`, `components/analytics/*` or `pages/analytics/*`.
