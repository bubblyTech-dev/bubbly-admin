import { useEffect, useState } from 'react';
import { Autocomplete, Chip, TextField } from '@mui/material';
import useDebouncedValue from 'hooks/useDebouncedValue';
import { announcementService } from 'services/announcementService';
import { ANNOUNCEMENT_TARGET_TYPE, AnnouncementTargetItem } from 'types/announcements';

interface AnnouncementTargetPickerProps {
  // 2 = schools, 3 = plans (an announcement for all schools has no picker)
  targetType: number;
  value: AnnouncementTargetItem[];
  onChange: (value: AnnouncementTargetItem[]) => void;
  disabled?: boolean;
  error?: string;
}

// Searchable multi-select for the schools or plans an announcement is aimed at. The chosen ones show as chips.
const AnnouncementTargetPicker = ({
  targetType,
  value,
  onChange,
  disabled = false,
  error,
}: AnnouncementTargetPickerProps) => {
  const isSchools = targetType === ANNOUNCEMENT_TARGET_TYPE.SCHOOLS;
  const noun = isSchools ? 'schools' : 'plans';

  const [input, setInput] = useState('');
  const [options, setOptions] = useState<AnnouncementTargetItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const search = useDebouncedValue(input);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError('');
    announcementService
      .targetOptions(targetType, search)
      .then((items) => {
        if (active) setOptions(items);
      })
      .catch(() => {
        if (active) setLoadError(`Could not load the ${noun}.`);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [targetType, search, noun]);

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      filterSelectedOptions
      disabled={disabled}
      loading={loading}
      options={options}
      value={value}
      inputValue={input}
      onInputChange={(_event, text, reason) => {
        // keep what was typed after picking an item, but clear it when the field is reset
        if (reason !== 'reset') setInput(text);
      }}
      onChange={(_event, items) => onChange(items)}
      // the server already filtered by the typed text
      filterOptions={(items) => items}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, selected) => option.uuid === selected.uuid}
      noOptionsText={loading ? 'Loading…' : `No ${noun} found.`}
      renderValue={(selected, getItemProps) =>
        selected.map((item, index) => {
          const { key, ...chipProps } = getItemProps({ index });
          return <Chip key={key} label={item.name} size="small" {...chipProps} />;
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={isSchools ? 'Choose schools' : 'Choose plans'}
          placeholder={`Search ${noun}`}
          error={Boolean(error || loadError)}
          helperText={
            error ||
            loadError ||
            (isSchools
              ? 'Only the schools you pick will see this announcement.'
              : 'Only schools on the plans you pick will see this announcement.')
          }
        />
      )}
    />
  );
};

export default AnnouncementTargetPicker;
