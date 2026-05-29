import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ALARMS_KEY = 'bb_puja_alarms';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestNotificationPermission = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const saveAlarms = async (alarms) => {
  await AsyncStorage.setItem(ALARMS_KEY, JSON.stringify(alarms));
};

export const loadAlarms = async () => {
  try {
    const val = await AsyncStorage.getItem(ALARMS_KEY);
    return val ? JSON.parse(val) : [];
  } catch (e) {
    return [];
  }
};

export const scheduleAlarm = async (alarm) => {
  const isPM = alarm.time.includes('PM');
  const timePart = alarm.time.replace(' AM', '').replace(' PM', '');
  let [hours, minutes] = timePart.split(':').map(Number);
  if (isPM && hours !== 12) hours += 12;
  if (!isPM && hours === 12) hours = 0;
  const trigger = {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour: hours,
    minute: minutes,
  };

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `🛕 ${alarm.label}`,
      body: alarm.mantra,
      sound: true,
    },
    trigger,
  });

  return id;
};

export const cancelAlarm = async (notifId) => {
  if (notifId) await Notifications.cancelScheduledNotificationAsync(notifId);
};

export const cancelAllAlarms = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};