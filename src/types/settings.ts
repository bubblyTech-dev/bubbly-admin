export type SettingType = 'string' | 'integer' | 'number' | 'boolean' | 'integerList';

export interface SettingItem {
  key: string;
  label: string;
  description: string;
  type: SettingType;
  value: string | number | boolean | number[] | null;
  min: number | null;
  max: number | null;
  maxLength: number | null;
}

export interface SettingGroup {
  name: string;
  label: string;
  settings: SettingItem[];
}
