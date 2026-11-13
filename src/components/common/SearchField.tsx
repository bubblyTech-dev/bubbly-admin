import { InputAdornment, TextField } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

interface SearchFieldProps {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

// The search box above every list.
const SearchField = ({ value, placeholder, onChange }: SearchFieldProps) => {
  return (
    <TextField
      size="small"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{ minWidth: { sm: 320 } }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <IconifyIcon icon="material-symbols:search-rounded" />
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default SearchField;
