import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ─── Keys ───────────────────────────────────────────────────────────────────
const KEYS = {
  PERMISSION_ASKED: 'bb_notif_permission_asked',
  PUJA_ENABLED: 'bb_notif_puja_enabled',
  STREAK_ENABLED: 'bb_notif_streak_enabled',
  FESTIVAL_ENABLED: 'bb_notif_festival_enabled',
  PUJA_HOUR: 'bb_notif_puja_hour',
  PUJA_MINUTE: 'bb_notif_puja_minute',
};

// ─── Foreground handler (show notification even when app is open) ────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ─── Request Permissions ─────────────────────────────────────────────────────
export async function requestPermissions() {
  if (!Device.isDevice) return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  await AsyncStorage.setItem(KEYS.PERMISSION_ASKED, 'true');

  if (finalStatus !== 'granted') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('bharat-bhakti', {
      name: 'Bharat Bhakti',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C8410B',
      sound: 'default',
    });
  }

  return true;
}

// ─── Check Permission ─────────────────────────────────────────────────────────
export async function hasPermission() {
  if (!Device.isDevice) return false;
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

// ─── Schedule Morning Puja Reminder ──────────────────────────────────────────
export async function scheduleMorningPuja(hour = 7, minute = 0) {
  try {
    await Notifications.cancelScheduledNotificationAsync('morning-puja').catch(() => {});

    const messages = [
      { title: '🪔 Shubh Prabhat!', body: 'Aaj ki puja ka waqt aa gaya. Bhagwan ka dhyan karein.' },
      { title: '🙏 Jai Shri Ram!', body: 'Subah ki aarti aur puja ke liye tayaar ho jaiye.' },
      { title: '🌸 Good Morning!', body: 'Start your day with devotion. Mandir aapka intezaar kar raha hai.' },
      { title: '🔔 Puja Time!', body: 'Din ki shuruaat bhakti se karein. Har din ek naya aashirwaad.' },
    ];

    const msg = messages[Math.floor(Math.random() * messages.length)];

    await Notifications.scheduleNotificationAsync({
      identifier: 'morning-puja',
      content: {
        title: msg.title,
        body: msg.body,
        sound: 'default',
        android: { channelId: 'bharat-bhakti' },
      },
      trigger: {
        type: 'daily',
        hour,
        minute,
      },
    });

    await AsyncStorage.setItem(KEYS.PUJA_HOUR, String(hour));
    await AsyncStorage.setItem(KEYS.PUJA_MINUTE, String(minute));
    await AsyncStorage.setItem(KEYS.PUJA_ENABLED, 'true');

    return true;
  } catch (e) {
    console.error('[notificationService] scheduleMorningPuja error:', e);
    return false;
  }
}

// ─── Schedule Streak Saver ────────────────────────────────────────────────────
export async function scheduleStreakSaver() {
  try {
    await Notifications.cancelScheduledNotificationAsync('streak-saver').catch(() => {});

    await Notifications.scheduleNotificationAsync({
      identifier: 'streak-saver',
      content: {
        title: '🔥 Streak toot na jaaye!',
        body: 'Aaj bhakti nahi ki abhi tak? 2 minute do, streak bachao!',
        sound: 'default',
        android: { channelId: 'bharat-bhakti' },
      },
      trigger: {
        type: 'daily',
        hour: 20,
        minute: 0,
      },
    });

    await AsyncStorage.setItem(KEYS.STREAK_ENABLED, 'true');
    return true;
  } catch (e) {
    console.error('[notificationService] scheduleStreakSaver error:', e);
    return false;
  }
}

// ─── Cancel Streak Saver (call when user opens app before 8 PM) ──────────────
export async function cancelTodayStreakSaver() {
  try {
    // We don't cancel the repeating one — it fires every day
    // This is a placeholder for future date-based logic
  } catch (e) {
    console.error('[notificationService] cancelTodayStreakSaver error:', e);
  }
}

// ─── Schedule Festival Alert ──────────────────────────────────────────────────
export async function scheduleFestivalAlert(festivalName, festivalDate) {
  try {
    // Schedule 1 day before at 9 AM
    const alertDate = new Date(festivalDate);
    alertDate.setDate(alertDate.getDate() - 1);
    alertDate.setHours(9, 0, 0, 0);

    if (alertDate <= new Date()) return false; // already passed

    const id = `festival-${festivalName.replace(/\s+/g, '-').toLowerCase()}`;

    await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: {
        title: `🎉 Kal ${festivalName} hai!`,
        body: `Pooja ki tayaari kar lo. Bharat Bhakti mein special content available hai.`,
        sound: 'default',
        android: { channelId: 'bharat-bhakti' },
      },
      trigger: {
        type: 'date',
        date: alertDate,
      },
    });

    await AsyncStorage.setItem(KEYS.FESTIVAL_ENABLED, 'true');
    return true;
  } catch (e) {
    console.error('[notificationService] scheduleFestivalAlert error:', e);
    return false;
  }
}

// ─── Schedule All Upcoming Festivals ─────────────────────────────────────────
export async function scheduleUpcomingFestivals() {
  const festivals = [
    { name: 'Guru Purnima', date: new Date('2025-07-10') },
    { name: 'Raksha Bandhan', date: new Date('2025-08-09') },
    { name: 'Janmashtami', date: new Date('2025-08-16') },
    { name: 'Ganesh Chaturthi', date: new Date('2025-08-27') },
    { name: 'Navratri', date: new Date('2025-09-22') },
    { name: 'Dussehra', date: new Date('2025-10-02') },
    { name: 'Karva Chauth', date: new Date('2025-10-10') },
    { name: 'Dhanteras', date: new Date('2025-10-20') },
    { name: 'Diwali', date: new Date('2025-10-21') },
    { name: 'Bhai Dooj', date: new Date('2025-10-23') },
    { name: 'Chhath Puja', date: new Date('2025-10-28') },
    { name: 'Maha Shivaratri', date: new Date('2026-02-18') },
    { name: 'Holi', date: new Date('2026-03-13') },
    { name: 'Ram Navami', date: new Date('2026-03-28') },
    { name: 'Hanuman Jayanti', date: new Date('2026-04-05') },
  ];

  for (const f of festivals) {
    await scheduleFestivalAlert(f.name, f.date);
  }
}

// ─── Setup All Notifications (call once on app start after permission) ────────
export async function setupAllNotifications() {
  try {
    const permitted = await hasPermission();
    if (!permitted) return;

    const pujaEnabled = await AsyncStorage.getItem(KEYS.PUJA_ENABLED);
    const streakEnabled = await AsyncStorage.getItem(KEYS.STREAK_ENABLED);
    const festivalEnabled = await AsyncStorage.getItem(KEYS.FESTIVAL_ENABLED);

    const savedHour = await AsyncStorage.getItem(KEYS.PUJA_HOUR);
    const savedMinute = await AsyncStorage.getItem(KEYS.PUJA_MINUTE);
    const hour = savedHour ? parseInt(savedHour) : 7;
    const minute = savedMinute ? parseInt(savedMinute) : 0;

    if (pujaEnabled !== 'false') await scheduleMorningPuja(hour, minute);
    if (streakEnabled !== 'false') await scheduleStreakSaver();
    if (festivalEnabled !== 'false') await scheduleUpcomingFestivals();
  } catch (e) {
    console.error('[notificationService] setupAllNotifications error:', e);
  }
}

// ─── Cancel All ───────────────────────────────────────────────────────────────
export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.setItem(KEYS.PUJA_ENABLED, 'false');
    await AsyncStorage.setItem(KEYS.STREAK_ENABLED, 'false');
    await AsyncStorage.setItem(KEYS.FESTIVAL_ENABLED, 'false');
  } catch (e) {
    console.error('[notificationService] cancelAllNotifications error:', e);
  }
}

// ─── Get Saved Settings ───────────────────────────────────────────────────────
export async function getNotificationSettings() {
  const [puja, streak, festival, hour, minute] = await Promise.all([
    AsyncStorage.getItem(KEYS.PUJA_ENABLED),
    AsyncStorage.getItem(KEYS.STREAK_ENABLED),
    AsyncStorage.getItem(KEYS.FESTIVAL_ENABLED),
    AsyncStorage.getItem(KEYS.PUJA_HOUR),
    AsyncStorage.getItem(KEYS.PUJA_MINUTE),
  ]);

  return {
    pujaEnabled: puja !== 'false',
    streakEnabled: streak !== 'false',
    festivalEnabled: festival !== 'false',
    pujaHour: hour ? parseInt(hour) : 7,
    pujaMinute: minute ? parseInt(minute) : 0,
  };
}