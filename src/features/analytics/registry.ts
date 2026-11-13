import { AnalyticsAreaConfig } from 'types/analytics';

// Every file in ./areas is one analytics page (one area of the Analytics menu). They are found automatically,
// so adding a page means adding a file; no list has to be edited. See README.md in this folder.
const modules = import.meta.glob<{ default: AnalyticsAreaConfig }>('./areas/*.ts', { eager: true });

const hasWidgets = (area: AnalyticsAreaConfig) =>
  area.sections.some((section) => section.widgets.length > 0);

// areas with nothing to show yet are left out, so the menu never links to an empty page
export const analyticsAreas: AnalyticsAreaConfig[] = Object.values(modules)
  .map((module) => module.default)
  .filter(hasWidgets)
  .sort((a, b) => a.order - b.order);

export const findAnalyticsArea = (area: string | undefined) =>
  analyticsAreas.find((item) => item.area === area);
