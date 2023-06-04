import {t} from '@lingui/macro';
import {HStack, FormControl, IStackProps, Switch, Text} from 'native-base';
import {useCallback} from 'react';
import {useSettings} from '@/store/settings';

export function HighlightCurrentSetting(props: IStackProps) {
  const [highlightCurrent, setHighlightCurrent] = useSettings(
    'HIGHLIGHT_CURRENT_PRAYER',
  );

  const onToggle = useCallback(
    (value: boolean) => {
      setHighlightCurrent(value);
    },
    [setHighlightCurrent],
  );

  return (
    <HStack {...props}>
      <FormControl fontSize="md">
        <HStack justifyContent={'space-between'}>
          <Text flexShrink={1}>{t`Highlight current prayer`}</Text>
          <Switch value={highlightCurrent} onToggle={onToggle} size="lg" />
        </HStack>
        <FormControl.HelperText>
          {t`Should app highlight current prayer instead of next prayer?`}
        </FormControl.HelperText>
      </FormControl>
    </HStack>
  );
}
