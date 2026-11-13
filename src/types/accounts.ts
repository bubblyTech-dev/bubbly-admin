import { JSX } from 'react';

export interface AccountTab {
  id?: number;
  label: string;
  title: string;
  value: string;
  icon: string;
  panelIcon: string;
  tabPanel: JSX.Element | null;
}

export interface PersonalInfo {
  name: string;
  phone: string;
  email: string;
}
