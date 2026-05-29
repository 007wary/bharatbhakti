import { useState, useCallback, useMemo } from 'react';
import {
  ScrollView, View, StyleSheet, TouchableOpacity,
  Switch, Modal, Share, Linking, TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import ThemedCard from '../components/ThemedCard';
import { getUserData, updateUserProfile } from '../services/storageService';
import { getXPData } from '../services/xpService';
import {
  getNotificationSettings,
  scheduleMorningPuja,
  scheduleStreakSaver,
  scheduleUpcomingFestivals,
  cancelAllNotifications,
  hasPermission,
  requestPermissions,
} from '../services/notificationService';

const APP_VERSION = '1.0.0';

const DEITIES = [
  'Lord Shiva', 'Lord Vishnu', 'Lord Krishna', 'Lord Ram',
  'Lord Ganesha', 'Goddess Durga', 'Goddess Lakshmi', 'Goddess Saraswati',
  'Lord Hanuman', 'Lord Surya',
];

const MANTRAS = [
  { id: 1, text: 'ॐ नमः शिवाय', deity: 'Shiva' },
  { id: 2, text: 'हरे कृष्ण हरे राम', deity: 'Krishna' },
  { id: 3, text: 'ॐ नमो नारायणाय', deity: 'Vishnu' },
  { id: 4, text: 'जय श्री राम', deity: 'Ram' },
  { id: 5, text: 'ॐ गं गणपतये नमः', deity: 'Ganesh' },
  { id: 6, text: 'ॐ ऐं सरस्वत्यै नमः', deity: 'Saraswati' },
];

export default function Settings() {
  const { theme, themeSetting: themeMode, setTheme: setThemeMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [userData, setUserData] = useState(null);
  const [xpData, setXpData] = useState(null);
  const [notifSettings, setNotifSettings] = useState(null);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showMantraPicker, setShowMantraPicker] = useState(false);
  const [selectedMantra, setSelectedMantra] = useState(MANTRAS[0]);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDeity, setEditDeity] = useState('');

  useFocusEffect(
    useCallback(() => {
      getUserData().then(setUserData);
      getXPData().then(setXpData);
      getNotificationSettings().then(setNotifSettings);
    }, [])
  );

  const handlePujaToggle = async (val) => {
    const permitted = await hasPermission() || await requestPermissions();
    if (!permitted) return;
    if (val) {
      await scheduleMorningPuja(notifSettings?.pujaHour ?? 7, notifSettings?.pujaMinute ?? 0);
    } else {
      const { Notifications } = await import('expo-notifications');
      await Notifications.cancelScheduledNotificationAsync('morning-puja').catch(() => {});
    }
    setNotifSettings(prev => ({ ...prev, pujaEnabled: val }));
  };

  const handleStreakToggle = async (val) => {
    const permitted = await hasPermission() || await requestPermissions();
    if (!permitted) return;
    if (val) {
      await scheduleStreakSaver();
    } else {
      const { Notifications } = await import('expo-notifications');
      await Notifications.cancelScheduledNotificationAsync('streak-saver').catch(() => {});
    }
    setNotifSettings(prev => ({ ...prev, streakEnabled: val }));
  };

  const handleFestivalToggle = async (val) => {
    const permitted = await hasPermission() || await requestPermissions();
    if (!permitted) return;
    if (val) {
      await scheduleUpcomingFestivals();
    }
    setNotifSettings(prev => ({ ...prev, festivalEnabled: val }));
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    await updateUserProfile({ name: editName.trim(), deity: editDeity });
    setUserData(prev => ({ ...prev, name: editName.trim(), deity: editDeity }));
    setShowProfileEdit(false);
  };

  const handleShare = async () => {
    await Share.share({
      message: 'Bharat Bhakti — Daily Puja, Japa Mala, Panchang & more. Download now!',
    });
  };

  const s = useMemo(() => makeStyles(theme, insets), [theme, insets]);

  const initials = userData?.name
    ? userData.name.trim().charAt(0).toUpperCase()
    : '?';

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <ThemedText style={s.heading}>Settings</ThemedText>
          <View style={{ width: 32 }} />
        </View>

        {/* Profile Card */}
        <TouchableOpacity onPress={() => { setEditName(userData?.name ?? ''); setEditDeity(userData?.deity ?? ''); setShowProfileEdit(true); }}>
        <ThemedCard style={s.profileCard}>
          <View style={[s.avatar, { backgroundColor: theme.primary }]}>
            <ThemedText style={s.avatarText}>{initials}</ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={s.profileName}>{userData?.name ?? ''}</ThemedText>
            <ThemedText secondary style={s.profileDeity}>{userData?.deity ?? ''}</ThemedText>
            <Ionicons name="pencil-outline" size={16} color={theme.textSecondary} style={{ marginTop: 4 }} />
          {xpData && (
              <View style={s.profileLevelRow}>
                <View style={[s.levelBadge, { backgroundColor: theme.primary + '22' }]}>
                  <ThemedText style={[s.levelBadgeText, { color: theme.primary }]}>
                    ⭐ Level {xpData.currentLevel.level} · {xpData.currentLevel.name}
                  </ThemedText>
                </View>
              </View>
            )}
          </View>
        </ThemedCard>
        </TouchableOpacity>

        {/* Pro Banner */}
        <TouchableOpacity
          style={[s.proBanner, { backgroundColor: theme.primary }]}
          onPress={() => router.push('/paywall')}
        >
          <View style={{ flex: 1 }}>
            <ThemedText style={s.proBannerTitle}>🪔 Bharat Bhakti Pro</ThemedText>
            <ThemedText style={s.proBannerSub}>Ad-free · Festival alerts · Unlimited history</ThemedText>
          </View>
          <View style={[s.proBannerBtn, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
            <ThemedText style={s.proBannerBtnText}>₹199/mo</ThemedText>
          </View>
        </TouchableOpacity>

        {/* Notifications Section */}
        <ThemedText style={s.sectionLabel}>Notifications</ThemedText>
        <ThemedCard style={s.sectionCard}>
          <SettingsRow
            icon="sunny-outline"
            iconColor="#F59E0B"
            label="Morning Puja Reminder"
            sub="Daily at 7:00 AM"
            theme={theme}
            right={
              <Switch
                value={notifSettings?.pujaEnabled ?? true}
                onValueChange={handlePujaToggle}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#fff"
              />
            }
          />
          <Divider theme={theme} />
          <SettingsRow
            icon="flame-outline"
            iconColor="#EF4444"
            label="Streak Reminder"
            sub="Daily at 8:00 PM"
            theme={theme}
            right={
              <Switch
                value={notifSettings?.streakEnabled ?? true}
                onValueChange={handleStreakToggle}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#fff"
              />
            }
          />
          <Divider theme={theme} />
          <SettingsRow
            icon="calendar-outline"
            iconColor="#8B5CF6"
            label="Festival Alerts"
            sub="1 day before festivals"
            theme={theme}
            right={
              <Switch
                value={notifSettings?.festivalEnabled ?? true}
                onValueChange={handleFestivalToggle}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#fff"
              />
            }
          />
        </ThemedCard>

        {/* Appearance Section */}
        <ThemedText style={s.sectionLabel}>Appearance</ThemedText>
        <ThemedCard style={s.sectionCard}>
          <SettingsRow
            icon="contrast-outline"
            iconColor="#6366F1"
            label="Theme"
            sub={themeMode === 'system' ? 'System Default' : themeMode === 'dark' ? 'Dark' : 'Light'}
            theme={theme}
            onPress={() => setShowThemePicker(true)}
            right={<Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />}
          />
        </ThemedCard>

        {/* Japa Section */}
        <ThemedText style={s.sectionLabel}>Japa</ThemedText>
        <ThemedCard style={s.sectionCard}>
          <SettingsRow
            icon="musical-note-outline"
            iconColor="#C8410B"
            label="Default Mantra"
            sub={selectedMantra.text}
            theme={theme}
            onPress={() => setShowMantraPicker(true)}
            right={<Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />}
          />
        </ThemedCard>

        {/* About Section */}
        <ThemedText style={s.sectionLabel}>About</ThemedText>
        <ThemedCard style={s.sectionCard}>
          <SettingsRow
            icon="star-outline"
            iconColor="#F59E0B"
            label="Rate Bharat Bhakti"
            theme={theme}
            onPress={() => Linking.openURL('market://details?id=com.bharatbhakti.app')}
            right={<Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />}
          />
          <Divider theme={theme} />
          <SettingsRow
            icon="share-social-outline"
            iconColor="#10B981"
            label="Share with Friends"
            theme={theme}
            onPress={handleShare}
            right={<Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />}
          />
          <Divider theme={theme} />
          <SettingsRow
            icon="information-circle-outline"
            iconColor="#6B7280"
            label="App Version"
            theme={theme}
            right={<ThemedText secondary style={{ fontSize: 13 }}>{APP_VERSION}</ThemedText>}
          />
        </ThemedCard>

      </ScrollView>

      {/* Theme Picker Modal */}
      <Modal visible={showThemePicker} transparent animationType="slide" onRequestClose={() => setShowThemePicker(false)}>
        <View style={s.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowThemePicker(false)} />
          <View style={[s.modalSheet, { backgroundColor: theme.background }]}>
            <View style={s.modalHandle} />
            <ThemedText style={s.modalTitle}>Choose Theme</ThemedText>
            {[
              { id: 'light', label: 'Light', icon: 'sunny-outline' },
              { id: 'dark', label: 'Dark', icon: 'moon-outline' },
              { id: 'system', label: 'System Default', icon: 'phone-portrait-outline' },
            ].map(t => (
              <TouchableOpacity
                key={t.id}
                style={[s.themeOption, { borderColor: themeMode === t.id ? theme.primary : theme.border, backgroundColor: themeMode === t.id ? theme.primary + '15' : theme.surface }]}
                onPress={() => { setThemeMode(t.id); setShowThemePicker(false); }}
              >
                <Ionicons name={t.icon} size={22} color={themeMode === t.id ? theme.primary : theme.textSecondary} />
                <ThemedText style={[{ fontSize: 15, fontWeight: '600', flex: 1 }, { color: themeMode === t.id ? theme.primary : theme.text }]}>{t.label}</ThemedText>
                {themeMode === t.id && <Ionicons name="checkmark-circle" size={22} color={theme.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Mantra Picker Modal */}
      <Modal visible={showMantraPicker} transparent animationType="slide" onRequestClose={() => setShowMantraPicker(false)}>
        <View style={s.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowMantraPicker(false)} />
          <View style={[s.modalSheet, { backgroundColor: theme.background }]}>
            <View style={s.modalHandle} />
            <ThemedText style={s.modalTitle}>Default Mantra</ThemedText>
            {MANTRAS.map(m => (
              <TouchableOpacity
                key={m.id}
                style={[s.themeOption, { borderColor: selectedMantra.id === m.id ? theme.primary : theme.border, backgroundColor: selectedMantra.id === m.id ? theme.primary + '15' : theme.surface }]}
                onPress={() => { setSelectedMantra(m); setShowMantraPicker(false); }}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText style={[{ fontSize: 15, fontWeight: '600' }, { color: selectedMantra.id === m.id ? theme.primary : theme.text }]}>{m.text}</ThemedText>
                  <ThemedText secondary style={{ fontSize: 12, marginTop: 2 }}>{m.deity}</ThemedText>
                </View>
                {selectedMantra.id === m.id && <Ionicons name="checkmark-circle" size={22} color={theme.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

    {/* Profile Edit Modal */}
      <Modal visible={showProfileEdit} transparent animationType="slide" onRequestClose={() => setShowProfileEdit(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={s.modalOverlay}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowProfileEdit(false)} />
            <View style={[s.modalSheet, { backgroundColor: theme.background }]}>
              <View style={s.modalHandle} />
              <ThemedText style={s.modalTitle}>Edit Profile</ThemedText>

              <ThemedText secondary style={s.inputLabel}>Your Name</ThemedText>
              <TextInput
                style={[s.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your name"
                placeholderTextColor={theme.textSecondary}
                maxLength={30}
              />

              <ThemedText secondary style={s.inputLabel}>Ishta Devata</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {DEITIES.map(d => (
                    <TouchableOpacity
                      key={d}
                      style={[s.deityChip, { borderColor: editDeity === d ? theme.primary : theme.border, backgroundColor: editDeity === d ? theme.primary + '15' : theme.surface }]}
                      onPress={() => setEditDeity(d)}
                    >
                      <ThemedText style={[{ fontSize: 13, fontWeight: '600' }, { color: editDeity === d ? theme.primary : theme.text }]}>{d}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <TouchableOpacity
                style={[s.saveBtn, { backgroundColor: theme.primary }]}
                onPress={handleSaveProfile}
              >
                <ThemedText style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Save Changes</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </ThemedView>
  );
}

// ─── Reusable Row ─────────────────────────────────────────────────────────────
function SettingsRow({ icon, iconColor, label, sub, right, onPress, theme }) {
  const content = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
      <View style={[{ width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }, { backgroundColor: iconColor + '22' }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText style={{ fontSize: 15, fontWeight: '500' }}>{label}</ThemedText>
        {sub && <ThemedText secondary style={{ fontSize: 12, marginTop: 2 }}>{sub}</ThemedText>}
      </View>
      {right}
    </View>
  );

  if (onPress) return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  return content;
}

function Divider({ theme }) {
  return <View style={{ height: 1, backgroundColor: theme.border, marginLeft: 48 }} />;
}

const makeStyles = (theme, insets) => StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn: { padding: 4 },
  heading: { fontSize: 20, fontWeight: '700' },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  avatar: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  profileName: { fontSize: 18, fontWeight: '700' },
  profileDeity: { fontSize: 13, marginTop: 2 },
  profileLevelRow: { marginTop: 6 },
  levelBadge: { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  levelBadgeText: { fontSize: 12, fontWeight: '600' },
  sectionLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 16, marginLeft: 4, opacity: 0.5, textTransform: 'uppercase', letterSpacing: 0.8 },
  sectionCard: { padding: 0, paddingHorizontal: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: insets.bottom + 24 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#ccc', alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  themeOption: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 10 },
  proBanner: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, marginBottom: 8, gap: 12 },
  proBannerTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 2 },
  proBannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  proBannerBtn: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  proBannerBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  inputLabel: { fontSize: 12, marginBottom: 6, marginLeft: 2 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 16 },
  deityChip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  saveBtn: { borderRadius: 14, padding: 16, alignItems: 'center' },
});