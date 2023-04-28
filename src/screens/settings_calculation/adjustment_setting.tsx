import {Text, Input, HStack, VStack, Button} from 'native-base';
import {IVStackProps} from 'native-base/lib/typescript/components/primitives/Stack/VStack';
import {useCallback, useEffect, useState} from 'react';
import {Prayer, translatePrayer} from '@/adhan';
import {
  getPrayerAdjustmentSettingKey,
  useCalcSettings,
} from '@/store/calculation';
import useDebounce from '@/utils/hooks/use_debounce';

type AdjustmentSettingProps = {
  prayer: Prayer;
};

export function AdjustmentSetting({
  prayer,
  ...hStackProps
}: AdjustmentSettingProps & IVStackProps) {
  const [adjustment, setAdjustment] = useCalcSettings(
    getPrayerAdjustmentSettingKey(prayer),
  );

  const [localAdjustment, setLocalAdjustment] = useState(adjustment as number);
  const debouncedAdjustment = useDebounce(localAdjustment, 600);

  const prayerName = translatePrayer(prayer);

  const setLocalAdjustmentHelper = useCallback(
    (value: string) => {
      setLocalAdjustment(parseInt(value, 10) || 0);
    },
    [setLocalAdjustment],
  );

  const increaseLocalAdjustmentByOne = () => {
    setLocalAdjustment(localAdjustment + 1);
  };

  const decreaseLocalAdjustmentByOne = () => {
    setLocalAdjustment(localAdjustment - 1);
  };

  useEffect(() => {
    // to set values when user finishes
    setAdjustment(debouncedAdjustment);
  }, [debouncedAdjustment, setAdjustment]);

  useEffect(() => {
    // to reset adjustment when the method changes
    setLocalAdjustment(adjustment as number);
  }, [setLocalAdjustment, adjustment]);

  return (
    <VStack {...hStackProps} mb="2" flex={1}>
      <Text
        textAlign={'center'}
        numberOfLines={1}
        maxFontSizeMultiplier={1}
        minimumFontScale={1}
        fontSize={'xs'}>
        {prayerName}
      </Text>
      <HStack h="10">
        <Button
          variant="outline"
          onPress={increaseLocalAdjustmentByOne}
          w="10"
          p="0">
          +
        </Button>
        <Input
          flex={1}
          size="md"
          value={localAdjustment.toString()}
          onChangeText={setLocalAdjustmentHelper}
          textAlign={'center'}
        />
        <Button
          variant="outline"
          onPress={decreaseLocalAdjustmentByOne}
          w="10"
          p="0">
          -
        </Button>
      </HStack>
    </VStack>
  );
}
