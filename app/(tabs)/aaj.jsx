import { useEffect, useState, useCallback, useMemo } from 'react';
import { ScrollView, View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedCard from '../../components/ThemedCard';
import { getUserData, updateStreak } from '../../services/storageService';
import { getPanchang, getRahuCountdown } from '../../services/panchaangService';
import { getDailyShlok } from '../../constants/shloks';
import { cancelTodayStreakSaver } from '../../services/notificationService';
import { awardDailyOpenXP, getXPData } from '../../services/xpService';
import { checkProStatus } from '../../services/purchaseService';
import { AD_UNITS } from '../../services/adService';

let BannerAd, BannerAdSize;
try {
  const admob = require('react-native-google-mobile-ads');
  BannerAd = admob.BannerAd;
  BannerAdSize = admob.BannerAdSize;
} catch (e) {
  BannerAd = null;
  BannerAdSize = { BANNER: 'BANNER' };
}

export default function Aaj() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [userData, setUserData] = useState(null);
  const [streak, setStreak] = useState(1);
  const [panchang, setPanchang] = useState(null);
  const [rahu, setRahu] = useState(null);
  const [shlok] = useState(getDailyShlok());
  const [xpData, setXpData] = useState(null);
  const [levelUpData, setLevelUpData] = useState(null);
  const [isPro, setIsPro] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getUserData().then(setUserData);
      updateStreak().then(setStreak);
      setPanchang(getPanchang());
      cancelTodayStreakSaver();
      checkProStatus().then(setIsPro);

      // Award daily XP and refresh XP data
      (async () => {
        const result = await awardDailyOpenXP();
        if (result?.leveledUp) {
          setLevelUpData(result.newLevel);
        }
        const data = await getXPData();
        setXpData(data);
      })();
    }, [])
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRahu(getRahuCountdown());
    }, 1000);
    setRahu(getRahuCountdown());
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'शुभ प्रभात';
    if (h < 17) return 'शुभ दोपहर';
    return 'शुभ संध्या';
  };

  const s = useMemo(() => makeStyles(theme), [theme]);

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 80, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <ThemedText style={s.greeting}>{getGreeting()}</ThemedText>
            <ThemedText style={s.name}>{userData?.name ?? ''}</ThemedText>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={[s.streakBadge, { backgroundColor: theme.primary }]}>
              <Ionicons name="flame" size={16} color="#fff" />
              <ThemedText style={s.streakText}>{streak}</ThemedText>
            </View>
            <TouchableOpacity
              style={[s.avatarBtn, { backgroundColor: theme.primary }]}
              onPress={() => router.push('/settings')}
            >
              <ThemedText style={s.avatarText}>
                {userData?.name ? userData.name.trim().charAt(0).toUpperCase() : '?'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date */}
        <ThemedText secondary style={s.date}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </ThemedText>

        {/* XP Level Bar */}
        {xpData && (
          <ThemedCard style={s.xpCard}>
            <View style={s.xpHeader}>
              <View style={s.xpLevelRow}>
                <View style={[s.xpLevelBadge, { backgroundColor: theme.primary }]}>
                  <ThemedText style={s.xpLevelNum}>⭐ {xpData.currentLevel.level}</ThemedText>
                </View>
                <View>
                  <ThemedText style={s.xpLevelName}>{xpData.currentLevel.name}</ThemedText>
                  <ThemedText secondary style={s.xpLevelHindi}>{xpData.currentLevel.hindi}</ThemedText>
                </View>
              </View>
              {xpData.nextLevel && (
                <ThemedText secondary style={s.xpTotal}>
                  {xpData.xpIntoLevel} / {xpData.xpNeededForNext} XP
                </ThemedText>
              )}
              {!xpData.nextLevel && (
                <ThemedText style={[s.xpTotal, { color: theme.primary }]}>Max Level 🏆</ThemedText>
              )}
            </View>
            {xpData.nextLevel && (
              <View style={[s.xpBarTrack, { backgroundColor: theme.surface2 }]}>
                <View style={[s.xpBarFill, { backgroundColor: theme.primary, width: `${Math.min(xpData.progress * 100, 100)}%` }]} />
              </View>
            )}
            {xpData.nextLevel && (
              <ThemedText secondary style={s.xpNextLabel}>
                Next: {xpData.nextLevel.name} ({xpData.nextLevel.hindi})
              </ThemedText>
            )}
          </ThemedCard>
        )}

        {/* Rahu Kaal Card */}
        {rahu && (
          <ThemedCard style={[s.rahuCard, { backgroundColor: rahu.isActive ? '#7F1D1D' : theme.surface }]}>
            <View style={s.rahuHeader}>
              <Ionicons name="warning-outline" size={20} color={rahu.isActive ? '#FCA5A5' : theme.textSecondary} />
              <ThemedText style={[s.rahuTitle, { color: rahu.isActive ? '#FCA5A5' : theme.textSecondary }]}>
                {rahu.isActive ? 'Rahu Kaal Active' : 'Rahu Kaal Starts In'}
              </ThemedText>
            </View>
            <ThemedText style={[s.rahuTimer, { color: rahu.isActive ? '#FEE2E2' : theme.text }]}>
              {rahu.countdown}
            </ThemedText>
            <ThemedText style={[s.rahuSub, { color: rahu.isActive ? '#FCA5A5' : theme.textSecondary }]}>
              {panchang ? `${panchang.rahuStart.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} – ${panchang.rahuEnd.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : ''}
            </ThemedText>
          </ThemedCard>
        )}

        {/* Panchang Card */}
        {panchang && (
          <ThemedCard style={{ marginTop: 12 }}>
            <View style={s.cardTitleRow}>
              <Ionicons name="calendar-outline" size={18} color={theme.primary} />
              <ThemedText style={[s.cardTitle, { color: theme.primary }]}>Aaj ka Panchang</ThemedText>
            </View>
            <View style={s.panchaangGrid}>
              <PanchaangItem label="Tithi" value={panchang.tithi} theme={theme} />
              <PanchaangItem label="Nakshatra" value={panchang.nakshatra} theme={theme} />
              <PanchaangItem label="Yoga" value={panchang.yoga} theme={theme} />
              <PanchaangItem label="Karan" value={panchang.karan} theme={theme} />
              <PanchaangItem label="Vara" value={panchang.vara} theme={theme} />
            </View>
          </ThemedCard>
        )}

        {/* Daily Shlok */}
        <ThemedCard style={[s.shlokCard, { borderLeftColor: theme.primary }]}>
          <View style={s.cardTitleRow}>
            <Ionicons name="book-outline" size={18} color={theme.primary} />
            <ThemedText style={[s.cardTitle, { color: theme.primary }]}>Aaj ka Shlok</ThemedText>
          </View>
          <ThemedText style={s.shlokText}>{shlok.shlok}</ThemedText>
          <ThemedText secondary style={s.shlokMeaning}>{shlok.meaning}</ThemedText>
          <ThemedText secondary style={s.shlokSource}>{shlok.source}</ThemedText>
        </ThemedCard>

      </ScrollView>

      {/* Banner Ad — free users only */}
      {!isPro && BannerAd && (
        <View style={{ alignItems: 'center', paddingBottom: insets.bottom }}>
          <BannerAd
            unitId={AD_UNITS.BANNER}
            size={BannerAdSize.BANNER}
            requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          />
        </View>
      )}

      {/* Level Up Modal */}
      <Modal visible={!!levelUpData} transparent animationType="fade" onRequestClose={() => setLevelUpData(null)}>
        <View style={s.levelUpOverlay}>
          <View style={[s.levelUpSheet, { backgroundColor: theme.background }]}>
            <ThemedText style={s.levelUpEmoji}>🎉</ThemedText>
            <ThemedText style={s.levelUpTitle}>Level Up!</ThemedText>
            <ThemedText secondary style={s.levelUpSub}>You have reached</ThemedText>
            <View style={[s.levelUpBadge, { backgroundColor: theme.primary }]}>
              <ThemedText style={s.levelUpBadgeText}>Level {levelUpData?.level}</ThemedText>
            </View>
            <ThemedText style={[s.levelUpName, { color: theme.primary }]}>{levelUpData?.name}</ThemedText>
            <ThemedText secondary style={s.levelUpHindi}>{levelUpData?.hindi}</ThemedText>
            <TouchableOpacity
              style={[s.levelUpBtn, { backgroundColor: theme.primary }]}
              onPress={() => setLevelUpData(null)}
            >
              <ThemedText style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>🙏 Dhanyavaad!</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ThemedView>
  );
}

function PanchaangItem({ label, value, theme }) {
  return (
    <View style={{ width: '48%', marginBottom: 12 }}>
      <ThemedText style={{ fontSize: 11, color: theme.textSecondary, marginBottom: 2 }}>{label}</ThemedText>
      <ThemedText style={{ fontSize: 14, fontWeight: '600' }}>{value}</ThemedText>
    </View>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: 14, color: theme.textSecondary },
  name: { fontSize: 24, fontWeight: '700', marginTop: 2 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  streakText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  avatarBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  date: { fontSize: 13, marginTop: 4, marginBottom: 16 },
  // XP Bar
  xpCard: { marginBottom: 12 },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  xpLevelRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  xpLevelBadge: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  xpLevelNum: { color: '#fff', fontSize: 12, fontWeight: '700' },
  xpLevelName: { fontSize: 15, fontWeight: '700' },
  xpLevelHindi: { fontSize: 12, marginTop: 1 },
  xpTotal: { fontSize: 12, fontWeight: '600' },
  xpBarTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  xpBarFill: { height: 8, borderRadius: 4 },
  xpNextLabel: { fontSize: 11, marginTop: 6 },
  // Rahu
  rahuCard: { borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.border },
  rahuHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  rahuTitle: { fontSize: 13, fontWeight: '600' },
  rahuTimer: { fontSize: 36, fontWeight: '700', letterSpacing: 2 },
  rahuSub: { fontSize: 12, marginTop: 4 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  panchaangGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  shlokCard: { marginTop: 12, borderLeftWidth: 3 },
  shlokText: { fontSize: 16, fontWeight: '600', lineHeight: 24, marginBottom: 8 },
  shlokMeaning: { fontSize: 13, lineHeight: 20, marginBottom: 6 },
  shlokSource: { fontSize: 11 },
  // Level Up Modal
  levelUpOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  levelUpSheet: { borderRadius: 24, padding: 28, alignItems: 'center', width: '100%' },
  levelUpEmoji: { fontSize: 56, marginBottom: 8 },
  levelUpTitle: { fontSize: 28, fontWeight: '700', marginBottom: 4 },
  levelUpSub: { fontSize: 14, marginBottom: 16 },
  levelUpBadge: { borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8, marginBottom: 12 },
  levelUpBadgeText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  levelUpName: { fontSize: 22, fontWeight: '700' },
  levelUpHindi: { fontSize: 16, marginTop: 4, marginBottom: 24 },
  levelUpBtn: { borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, width: '100%', alignItems: 'center' },
});