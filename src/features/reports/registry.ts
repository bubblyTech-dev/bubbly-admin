import { ReportAreaConfig } from 'types/reports';

// Every file in ./areas is one report page (one area of the Reports menu). They are found automatically,
// so adding a page means adding a file; no list has to be edited. See README.md in this folder.
const modules = import.meta.glob<{ default: ReportAreaConfig }>('./areas/*.ts', { eager: true });

// areas with no reports yet are left out, so the menu never links to an empty page
export const reportAreas: ReportAreaConfig[] = Object.values(modules)
  .map((module) => module.default)
  .filter((area) => area.reports.length > 0)
  .sort((a, b) => a.order - b.order);

export const findReportArea = (area: string | undefined) =>
  reportAreas.find((item) => item.area === area);
