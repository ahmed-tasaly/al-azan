import {t} from '@lingui/macro';
import {AlarmType} from '@notifee/react-native';
import {HStack, ScrollView, Text, IScrollViewProps, Button} from 'native-base';
import {useCallback} from 'react';
import {ToastAndroid} from 'react-native';
import {getNextPrayer, Prayer, translatePrayer} from '@/adhan';
import {
  ADHAN_CHANNEL_ID,
  ADHAN_NOTIFICATION_ID,
} from '@/constants/notification';
import {AudioEntry} from '@/modules/media_player';
import {clearCache} from '@/store/adhan_calc_cache';
import {alarmSettings} from '@/store/alarm';
import {settings} from '@/store/settings';
import {setAlarmTask} from '@/tasks/set_alarm';
import {getTime} from '@/utils/date';
import {getUpcommingTimeDay} from '@/utils/upcoming';

export function DevSettings(props: IScrollViewProps) {
  const scheduleAdhanInTen = useCallback((playSound: boolean) => {
    const date = new Date(Date.now() + 10 * 1000);
    const title = 'Test';
    let body: string | undefined = getTime(date);
    let subtitle: string | undefined = body;

    const showNextPrayerInfo = alarmSettings.getState().SHOW_NEXT_PRAYER_TIME;

    if (showNextPrayerInfo) {
      const next = getNextPrayer({
        date: new Date(date.valueOf() + 1000),
        checkNextDays: true,
        useSettings: true,
      });
      if (next) {
        body += ` - ${t`Next`}: ${translatePrayer(
          next.prayer,
        )}, ${getUpcommingTimeDay(next.date)}`;
      }
    }

    const {
      SELECTED_ADHAN_ENTRIES,
      SAVED_ADHAN_AUDIO_ENTRIES,
      USE_DIFFERENT_ALARM_TYPE,
    } = settings.getState();

    let sound: AudioEntry | undefined = undefined;
    if (playSound) {
      sound = SELECTED_ADHAN_ENTRIES['default'] as AudioEntry;
      if (!sound) {
        sound = SAVED_ADHAN_AUDIO_ENTRIES[0] as AudioEntry;
      }
    }

    const adhanOptions = {
      notifId: ADHAN_NOTIFICATION_ID, // TODO: using same notification id is troublesome when dismissing
      notifChannelId: ADHAN_CHANNEL_ID,
      date,
      title,
      body,
      subtitle,
      sound,
      prayer: Prayer.Dhuhr,
      alarmType: USE_DIFFERENT_ALARM_TYPE
        ? AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE
        : AlarmType.SET_ALARM_CLOCK,
    };

    setAlarmTask(adhanOptions).then(() => {
      ToastAndroid.show('adhan in 10 seconds', ToastAndroid.SHORT);
    });
  }, []);

  const onClearPressed = () => {
    clearCache();
    ToastAndroid.show('Cache cleared', ToastAndroid.SHORT);
  };

  return (
    <ScrollView
      p="4"
      _contentContainerStyle={{paddingBottom: 20}}
      mb="3"
      {...props}>
      <HStack alignItems="center" justifyContent="space-between" mb="5">
        <Text>Play adhan in 10 seconds: </Text>
        <Button onPress={scheduleAdhanInTen.bind(null, true)}>Schedule</Button>
      </HStack>
      <HStack alignItems="center" justifyContent="space-between" mb="5">
        <Text>Show adhan notif in 10 seconds: </Text>
        <Button onPress={scheduleAdhanInTen.bind(null, false)}>Schedule</Button>
      </HStack>
      <HStack alignItems="center" justifyContent="space-between">
        <Text>Clear Calculation Cache: </Text>
        <Button onPress={onClearPressed}>Clear</Button>
      </HStack>
    </ScrollView>
  );
}
