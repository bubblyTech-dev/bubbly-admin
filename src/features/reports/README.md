# Report pages

One file in `areas/` is one page of the **Reports** menu. Files are found automatically (nothing to register), and an area with no reports is hidden from the sidebar.

Copy `areas/schools.ts`, change `area` (the address), `title`, `icon`, `order` and `reports` (report keys from the backend, shown as pill tabs in that order).
The page shows the global filter bar, each report's own filters, a preview table with totals and a pager, and the Export menu (CSV or Excel).
The full guide, with how to write the backend report, is `backend/claude/07-analytics-and-reports.md`.
Do not edit `registry.ts`, `components/analytics/*` or `pages/reports/*`.
