import { Box, Checkbox, Chip, ListItemText, MenuItem, TextField } from '@mui/material';
import { FilterOption } from 'types/analytics';

interface MultiSelectFilterProps {
  label: string;
  // what is shown when nothing is picked, for example "All plans"
  allLabel: string;
  options: FilterOption[];
  value: string[];
  onChange: (value: string[]) => void;
  minWidth?: number;
}

// A small dropdown where several options can be ticked. Shows the picked ones as chips.
const MultiSelectFilter = ({
  label,
  allLabel,
  options,
  value,
  onChange,
  minWidth = 180,
}: MultiSelectFilterProps) => {
  const labelOf = (item: string) =>
    options.find((option) => String(option.value) === item)?.label ?? item;

  return (
    <TextField
      select
      size="small"
      label={label}
      value={value}
      onChange={(event) => {
        const next = event.target.value as unknown as string[] | string;
        onChange(typeof next === 'string' ? next.split(',') : next);
      }}
      sx={{ minWidth, maxWidth: 320 }}
      slotProps={{
        select: {
          multiple: true,
          displayEmpty: true,
          renderValue: (selected) => {
            const items = selected as string[];
            if (items.length === 0) return allLabel;
            if (items.length <= 2) {
              return (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {items.map((item) => (
                    <Chip key={item} size="small" label={labelOf(item)} />
                  ))}
                </Box>
              );
            }
            return `${items.length} selected`;
          },
        },
        inputLabel: { shrink: true },
      }}
    >
      {options.map((option) => (
        <MenuItem key={String(option.value)} value={String(option.value)}>
          <Checkbox size="small" checked={value.includes(String(option.value))} />
          <ListItemText primary={option.label} />
        </MenuItem>
      ))}
    </TextField>
  );
};

export default MultiSelectFilter;
