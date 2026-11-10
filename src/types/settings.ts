// text = long, multi-line text; integerList = numbers typed with commas; stringList = a list of short texts shown as chips
export type SettingType =
  | 'string'
  | 'text'
  | 'integer'
  | 'number'
  | 'boolean'
  | 'integerList'
  | 'stringList';

export interface SettingItem {
  key: string;
  label: string;
  description: string;
  type: SettingType;
  value: string | number | boolean | number[] | string[] | null;
  min: number | null;
  max: number | null;
  maxLength: number | null;
  maxItems: number | null;
  maxItemLength: number | null;
}

export interface SettingGroup {
  name: string;
  label: string;
  settings: SettingItem[];
}
