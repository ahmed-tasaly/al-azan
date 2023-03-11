import {produce} from 'immer';
import {useCallback} from 'react';
import {useStore} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {shallow} from 'zustand/shallow';
import {createStore} from 'zustand/vanilla';
import {zustandStorage} from './mmkv';
import {reminderSettings} from './reminder';
import {Prayer, PrayersInOrder} from '@/adhan';
import {WeekDayIndex} from '@/utils/date';

export const ALARM_SETTINGS_STORAGE_KEY = 'ALARM_SETTINGS_STORAGE';

export const ADHAN_NOTIFICATION_SUFFIX = '_NOTIFY';
export const ADHAN_SOUND_SUFFIX = '_SOUND';

export function getAdhanSettingKey(
  prayer: Prayer,
  k: 'sound' | 'notify',
): keyof AlarmSettingsStore {
  if (k === 'notify') {
    return (prayer.toUpperCase() +
      ADHAN_NOTIFICATION_SUFFIX) as keyof AlarmSettingsStore;
  } else {
    return (prayer.toUpperCase() +
      ADHAN_SOUND_SUFFIX) as keyof AlarmSettingsStore;
  }
}

export type PrayerAlarmSettings =
  | boolean
  | Partial<Record<WeekDayIndex, boolean>>
  | undefined;

export type AlarmSettingsStore = {
  //prayer notification settings
  FAJR_NOTIFY?: PrayerAlarmSettings;
  SUNRISE_NOTIFY?: PrayerAlarmSettings;
  DHUHR_NOTIFY?: PrayerAlarmSettings;
  ASR_NOTIFY?: PrayerAlarmSettings;
  SUNSET_NOTIFY?: PrayerAlarmSettings;
  MAGHRIB_NOTIFY?: PrayerAlarmSettings;
  ISHA_NOTIFY?: PrayerAlarmSettings;
  MIDNIGHT_NOTIFY?: PrayerAlarmSettings;
  TAHAJJUD_NOTIFY?: PrayerAlarmSettings;
  // prayer sound settings
  FAJR_SOUND?: PrayerAlarmSettings;
  SUNRISE_SOUND?: PrayerAlarmSettings;
  DHUHR_SOUND?: PrayerAlarmSettings;
  ASR_SOUND?: PrayerAlarmSettings;
  SUNSET_SOUND?: PrayerAlarmSettings;
  MAGHRIB_SOUND?: PrayerAlarmSettings;
  ISHA_SOUND?: PrayerAlarmSettings;
  MIDNIGHT_SOUND?: PrayerAlarmSettings;
  TAHAJJUD_SOUND?: PrayerAlarmSettings;
  // alarm notification
  SHOW_NEXT_PRAYER_TIME: boolean;
  // pre alarm notification
  DONT_NOTIFY_UPCOMING: boolean;

  setSetting: <T extends keyof AlarmSettingsStore>(
    key: T,
    val: AlarmSettingsStore[T],
  ) => void;
  setSettingCurry: <T extends keyof AlarmSettingsStore>(
    key: T,
  ) => (val: AlarmSettingsStore[T]) => void;
  removeSetting: (key: keyof AlarmSettingsStore) => () => void;
};

const invalidKeys = ['setSetting', 'setSettingCurry', 'removeSetting'];

export const alarmSettings = createStore<AlarmSettingsStore>()(
  persist(
    set => ({
      SHOW_NEXT_PRAYER_TIME: false,
      DONT_NOTIFY_UPCOMING: false,

      // general
      setSetting: <T extends keyof AlarmSettingsStore>(
        key: T,
        val: AlarmSettingsStore[T],
      ) =>
        set(
          produce<AlarmSettingsStore>(draft => {
            if (invalidKeys.includes(key)) return;
            draft[key] = val;
          }),
        ),
      setSettingCurry:
        <T extends keyof AlarmSettingsStore>(key: T) =>
        (val: AlarmSettingsStore[T]) =>
          set(
            produce<AlarmSettingsStore>(draft => {
              if (invalidKeys.includes(key)) return;
              draft[key] = val;
            }),
          ),
      removeSetting: key => () =>
        set(
          produce<AlarmSettingsStore>(draft => {
            if (invalidKeys.includes(key)) return;
            delete draft[key];
          }),
        ),
    }),
    {
      name: ALARM_SETTINGS_STORAGE_KEY,
      storage: createJSONStorage(() => zustandStorage),
      partialize: state =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !invalidKeys.includes(key)),
        ),
      version: 1,
      migrate: (persistedState, version) => {
        /* eslint-disable no-fallthrough */
        // fall through cases is exactly the use case for migration.
        switch (version) {
          case 0:
            reminderSettings.setState({
              REMINDERS: (persistedState as any)['REMINDERS'],
            });
            delete (persistedState as any)['REMINDERS'];
          case 1:
            // this will be run when storage version is changed to 2
            break;
        }
        /* eslint-enable no-fallthrough */
        return persistedState as AlarmSettingsStore;
      },
    },
  ),
);

export function isAnyNotificationEnabled() {
  const state = alarmSettings.getState();
  return !!PrayersInOrder.find(p => state[getAdhanSettingKey(p, 'notify')]);
}

export function useAlarmSettings<T extends keyof AlarmSettingsStore>(key: T) {
  const state = useStore(alarmSettings, s => s[key], shallow);
  const setterCurry = useStore(alarmSettings, s => s.setSettingCurry, shallow);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setCallback = useCallback(setterCurry(key), [key]);
  return [state, setCallback] as [
    AlarmSettingsStore[T],
    (val: AlarmSettingsStore[T]) => void,
  ];
}

export function hasAtLeastOneNotificationSetting() {
  for (let prayer of PrayersInOrder) {
    if (alarmSettings.getState()[getAdhanSettingKey(prayer, 'notify')]) {
      return true;
    }
  }
  return false;
}
