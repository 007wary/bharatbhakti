import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Dimensions, Animated, Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useTheme } from '../context/ThemeContext';
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import { saveJapaSession, getJapaToday } from '../services/storageService';
import { awardXP, XP_REWARDS } from '../services/xpService';
import { checkProStatus } from '../services/purchaseService';
import { loadInterstitial, showInterstitial } from '../services/adService';

const { width } = Dimensions.get('window');
const TOTAL_BEADS = 108;

const MANTRAS = [
  { id: 1, text: 'ॐ नमः शिवाय', transliteration: 'Om Namah Shivaya', deity: 'Shiva' },
  { id: 2, text: 'हरे कृष्ण हरे राम', transliteration: 'Hare Krishna Hare Ram', deity: 'Krishna' },
  { id: 3, text: 'ॐ नमो नारायणाय', transliteration: 'Om Namo Narayanaya', deity: 'Vishnu' },
  { id: 4, text: 'जय श्री राम', transliteration: 'Jai Shri Ram', deity: 'Ram' },
  { id: 5, text: 'ॐ गं गणपतये नमः', transliteration: 'Om Gan Ganapataye Namah', deity: 'Ganesh' },
  { id: 6, text: 'ॐ ऐं सरस्वत्यै नमः', transliteration: 'Om Aim Saraswatyai Namah', deity: 'Saraswati' },
];

export default function Japa() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [beadCount, setBeadCount] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [selectedMantra, setSelectedMantra] = useState(MANTRAS[0]);
  const [showMantraPicker, setShowMantraPicker] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [todayRounds, setTodayRounds] = useState(0);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [sessionSaved, setSessionSaved] = useState(false);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    activateKeepAwakeAsync();
    getJapaToday().then(d => setTodayRounds(d.rounds));
    checkProStatus().then(setIsPro);
    loadInterstitial();
    return () => {
      deactivateKeepAwake();
    };
  }, []);

  // Save session when navigating away
  useEffect(() => {
    return () => {
      if ((rounds > 0 || beadCount > 0) && !sessionSaved) {
        saveJapaSession(rounds, beadCount);
      }
    };
  }, [rounds, beadCount, sessionSaved]);

  const animateBead = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  }, [scaleAnim]);

  const handleTap = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateBead();

    const next = beadCount + 1;

    if (next >= TOTAL_BEADS) {
      // Round complete
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const newRounds = rounds + 1;
      setRounds(newRounds);
      setBeadCount(0);
      await saveJapaSession(1, TOTAL_BEADS);
      await awardXP(XP_REWARDS.JAPA_ROUND + XP_REWARDS.JAPA_FULL_MALA);
      setSessionSaved(true);
      // Show interstitial every 3rd round for free users
      if (!isPro && newRounds % 3 === 0) {
        await showInterstitial(isPro);
      }
      setTodayRounds(prev => prev + 1);
      setShowCompletion(true);
    } else {
      setBeadCount(next);
    }
  }, [beadCount, rounds, animateBead]);

  const handleReset = useCallback(() => {
    setBeadCount(0);
  }, []);

  const handleContinue = useCallback(() => {
    setShowCompletion(false);
    setSessionSaved(false);
  }, []);

  const progress = beadCount / TOTAL_BEADS;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - progress);

  const s = useMemo(() => makeStyles(theme, insets), [theme, insets]);

  return (
    <ThemedView style={{ flex: 1 }}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <ThemedText style={s.headerTitle}>Japa Mala</ThemedText>
        <View style={s.todayBadge}>
          <Ionicons name="refresh-outline" size={14} color={theme.primary} />
          <ThemedText style={[s.todayText, { color: theme.primary }]}>{todayRounds} rounds today</ThemedText>
        </View>
      </View>

      {/* Mantra Selector */}
      <TouchableOpacity style={[s.mantraSelector, { borderColor: theme.border, backgroundColor: theme.surface }]} onPress={() => setShowMantraPicker(true)}>
        <View style={{ flex: 1 }}>
          <ThemedText secondary style={{ fontSize: 11, marginBottom: 2 }}>Selected Mantra</ThemedText>
          <ThemedText style={s.mantraSelectorText}>{selectedMantra.text}</ThemedText>
          <ThemedText secondary style={{ fontSize: 11 }}>{selectedMantra.transliteration}</ThemedText>
        </View>
        <Ionicons name="chevron-down" size={18} color={theme.textSecondary} />
      </TouchableOpacity>

      {/* Mala Circle + Tap */}
      <View style={s.malaContainer}>

        {/* SVG-style progress ring using View */}
        <View style={s.ringOuter}>
          <View style={[s.ringTrack, { borderColor: theme.border }]} />
          <View style={[s.ringFill, { borderColor: theme.primary, transform: [{ rotate: `${progress * 360}deg` }] }]} />

          {/* Center tap zone */}
          <Animated.View style={[s.centerBtn, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity
              style={[s.tapBtn, { backgroundColor: theme.primary }]}
              onPress={handleTap}
              activeOpacity={0.85}
            >
              <ThemedText style={s.tapMantra}>{selectedMantra.text}</ThemedText>
              <ThemedText style={s.tapHint}>tap to chant</ThemedText>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Bead Count */}
        <View style={s.countRow}>
          <View style={s.countBox}>
            <ThemedText style={[s.countNum, { color: theme.primary }]}>{beadCount}</ThemedText>
            <ThemedText secondary style={s.countLabel}>beads</ThemedText>
          </View>
          <View style={[s.countDivider, { backgroundColor: theme.border }]} />
          <View style={s.countBox}>
            <ThemedText style={[s.countNum, { color: theme.primary }]}>{TOTAL_BEADS - beadCount}</ThemedText>
            <ThemedText secondary style={s.countLabel}>remaining</ThemedText>
          </View>
          <View style={[s.countDivider, { backgroundColor: theme.border }]} />
          <View style={s.countBox}>
            <ThemedText style={[s.countNum, { color: theme.primary }]}>{rounds}</ThemedText>
            <ThemedText secondary style={s.countLabel}>rounds</ThemedText>
          </View>
        </View>

        {/* Reset */}
        {beadCount > 0 && (
          <TouchableOpacity style={[s.resetBtn, { borderColor: theme.border }]} onPress={handleReset}>
            <Ionicons name="refresh-outline" size={16} color={theme.textSecondary} />
            <ThemedText secondary style={{ fontSize: 13 }}>Reset current round</ThemedText>
          </TouchableOpacity>
        )}

      </View>

      {/* Mantra Picker Modal */}
      <Modal visible={showMantraPicker} transparent animationType="slide" onRequestClose={() => setShowMantraPicker(false)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setShowMantraPicker(false)}>
          <View style={[s.modalSheet, { backgroundColor: theme.background }]}>
            <View style={s.modalHandle} />
            <ThemedText style={s.modalTitle}>Choose Mantra</ThemedText>
            {MANTRAS.map(m => (
              <TouchableOpacity
                key={m.id}
                style={[s.mantraOption, { borderColor: selectedMantra.id === m.id ? theme.primary : theme.border, backgroundColor: selectedMantra.id === m.id ? theme.primary + '15' : theme.surface }]}
                onPress={() => { setSelectedMantra(m); setShowMantraPicker(false); }}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText style={[s.mantraOptionText, { color: selectedMantra.id === m.id ? theme.primary : theme.text }]}>{m.text}</ThemedText>
                  <ThemedText secondary style={{ fontSize: 12, marginTop: 2 }}>{m.transliteration} · {m.deity}</ThemedText>
                </View>
                {selectedMantra.id === m.id && <Ionicons name="checkmark-circle" size={22} color={theme.primary} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[s.closeBtn, { borderColor: theme.border }]} onPress={() => setShowMantraPicker(false)}>
              <ThemedText secondary>Close</ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Round Completion Modal */}
      <Modal visible={showCompletion} transparent animationType="fade" onRequestClose={() => setShowCompletion(false)}>
        <View style={s.completionOverlay}>
          <View style={[s.completionSheet, { backgroundColor: theme.background }]}>
            <ThemedText style={s.completionEmoji}>📿</ThemedText>
            <ThemedText style={s.completionTitle}>Mala Complete!</ThemedText>
            <ThemedText secondary style={s.completionSub}>
              {rounds} {rounds === 1 ? 'round' : 'rounds'} completed today
            </ThemedText>
            <ThemedText style={[s.completionMantra, { color: theme.primary }]}>{selectedMantra.text}</ThemedText>
            <TouchableOpacity style={[s.continueBtn, { backgroundColor: theme.primary }]} onPress={handleContinue}>
              <ThemedText style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Continue Japa</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[s.doneBtn, { borderColor: theme.border }]} onPress={() => { setShowCompletion(false); router.back(); }}>
              <ThemedText secondary>Done for today</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ThemedView>
  );
}

const makeStyles = (theme, insets) => StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { padding: 4, marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700', flex: 1 },
  todayBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  todayText: { fontSize: 12, fontWeight: '600' },
  mantraSelector: { marginHorizontal: 16, borderRadius: 14, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  mantraSelectorText: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  malaContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: insets.bottom + 16 },
  ringOuter: { width: 280, height: 280, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  ringTrack: { position: 'absolute', width: 260, height: 260, borderRadius: 130, borderWidth: 12, borderColor: theme.border },
  ringFill: { position: 'absolute', width: 260, height: 260, borderRadius: 130, borderWidth: 12, borderLeftColor: 'transparent', borderBottomColor: 'transparent', borderTopColor: theme.primary, borderRightColor: theme.primary },
  centerBtn: { width: 200, height: 200, borderRadius: 100 },
  tapBtn: { width: 200, height: 200, borderRadius: 100, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 },
  tapMantra: { color: '#fff', fontSize: 20, fontWeight: '700', textAlign: 'center', paddingHorizontal: 16 },
  tapHint: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 6 },
  countRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 24, gap: 0 },
  countBox: { flex: 1, alignItems: 'center' },
  countNum: { fontSize: 28, fontWeight: '700' },
  countLabel: { fontSize: 11, marginTop: 2 },
  countDivider: { width: 1, height: 40 },
  resetBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, borderWidth: 1, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#ccc', alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  mantraOption: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 10 },
  mantraOptionText: { fontSize: 16, fontWeight: '600' },
  closeBtn: { borderWidth: 1, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 4 },
  completionOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  completionSheet: { borderRadius: 24, padding: 28, alignItems: 'center', width: '100%' },
  completionEmoji: { fontSize: 56, marginBottom: 12 },
  completionTitle: { fontSize: 26, fontWeight: '700', marginBottom: 6 },
  completionSub: { fontSize: 14, marginBottom: 16 },
  completionMantra: { fontSize: 20, fontWeight: '700', marginBottom: 24 },
  continueBtn: { borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, width: '100%', alignItems: 'center', marginBottom: 10 },
  doneBtn: { borderWidth: 1, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, width: '100%', alignItems: 'center' },
});