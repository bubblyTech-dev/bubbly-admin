import { MenuItem, TextField } from '@mui/material';

interface FilterOption {
  value: string | number;
  label: string;
}

interface FilterSelectProps {
  label: string;
  value: string | number;
  options: FilterOption[];
  onChange: (value: string) => void;
  allLabel?: string;
}

// A small dropdown filter above a list. The first choice ("All") means no filter.
const FilterSelect = ({ label, value, options, onChange, allLabel = 'All' }: FilterSelectProps) => {
  return (
    <TextField
      select
      size="small"
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{ minWidth: 160 }}
    >
      <MenuItem value="">{allLabel}</MenuItem>
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default FilterSelect;
