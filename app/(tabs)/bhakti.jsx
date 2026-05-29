import { useState } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import BottomSheet from '../../components/BottomSheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedCard from '../../components/ThemedCard';
import { CHALISA, AARTIS, MANTRAS } from '../../constants/bhakti';
import { GITA_CHAPTERS } from '../../constants/granth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, router } from 'expo-router';
import { awardXP, XP_REWARDS } from '../../services/xpService';
import { useCallback } from 'react';

export default function Bhakti() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('chalisa');
const [granthProgress, setGranthProgress] = useState({});
  const [selected, setSelected] = useState(null);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('bb_granth_progress').then((val) => {
        if (val) setGranthProgress(JSON.parse(val));
      });
    }, [])
  );

  const markRead = async (id) => {
    const updated = { ...granthProgress, [id]: true };
    setGranthProgress(updated);
    await AsyncStorage.setItem('bb_granth_progress', JSON.stringify(updated));
    await awardXP(XP_REWARDS.GRANTH_CHAPTER);
  };

  const readCount = Object.keys(granthProgress).length;
  const totalCount = GITA_CHAPTERS.length;
  const progressPct = Math.round((readCount / totalCount) * 100);

  const s = makeStyles(theme);

  const renderList = (items, type) => items.map((item) => (
    <TouchableOpacity key={item.id} onPress={() => setSelected({ ...item, type })}>
      <ThemedCard style={s.listCard}>
        <View style={[s.iconCircle, { backgroundColor: item.color + '22' }]}>
          <Ionicons name={item.icon} size={24} color={item.color} />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText style={s.listTitle}>{item.title}</ThemedText>
          <ThemedText secondary style={s.listDeity}>{item.deity}</ThemedText>
        </View>
        <Ionicons name="chevron-forward-outline" size={18} color={theme.textSecondary} />
      </ThemedCard>
    </TouchableOpacity>
  ));

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={s.heading}>Bhakti</ThemedText>
        <ThemedText secondary style={s.subheading}>Chalisa, Aarti & Mantras</ThemedText>

        {/* Japa Mala Banner */}
        <TouchableOpacity onPress={() => router.push('/japa')} style={[s.japaBanner, { backgroundColor: theme.primary }]}>
          <View style={{ flex: 1 }}>
            <ThemedText style={s.japaBannerTitle}>📿 Japa Mala</ThemedText>
            <ThemedText style={s.japaBannerSub}>Start your daily mala session</ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#fff" />
        </TouchableOpacity>

        {/* Tab Switcher */}
        <View style={[s.tabSwitcher, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
          {['chalisa', 'aarti', 'mantra', 'granth'].map((t) => (
            <TouchableOpacity
              key={t}
              style={[s.tabBtn, { backgroundColor: activeTab === t ? theme.primary : 'transparent' }]}
              onPress={() => setActiveTab(t)}
            >
              <ThemedText style={[s.tabBtnText, { color: activeTab === t ? '#fff' : theme.textSecondary }]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'chalisa' && renderList(CHALISA, 'chalisa')}
        {activeTab === 'aarti' && renderList(AARTIS, 'aarti')}
        {activeTab === 'mantra' && renderList(MANTRAS, 'mantra')}
        {activeTab === 'granth' && (
          <View>
            <ThemedCard style={s.progressCard}>
              <View style={s.progressHeader}>
                <View>
                  <ThemedText style={s.progressTitle}>Your Progress</ThemedText>
                  <ThemedText secondary style={s.progressSub}>{readCount} of {totalCount} chapters read</ThemedText>
                </View>
                <ThemedText style={[s.progressPct, { color: theme.primary }]}>{progressPct}%</ThemedText>
              </View>
              <View style={[s.progressBar, { backgroundColor: theme.surface2 }]}>
                <View style={[s.progressFill, { backgroundColor: theme.primary, width: `${progressPct}%` }]} />
              </View>
            </ThemedCard>
            {GITA_CHAPTERS.map((chapter) => (
              <TouchableOpacity key={chapter.id} onPress={() => setSelected({ ...chapter, type: 'granth' })}>
                <ThemedCard style={[s.listCard, granthProgress[chapter.id] && { borderColor: theme.primary }]}>
                  <View style={[s.chapterNum, { backgroundColor: granthProgress[chapter.id] ? theme.primary : theme.surface2 }]}>
                    <ThemedText style={[s.chapterNumText, { color: granthProgress[chapter.id] ? '#fff' : theme.textSecondary }]}>{chapter.id}</ThemedText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={s.listTitle}>{chapter.title}</ThemedText>
                    <ThemedText secondary style={s.listDeity}>{chapter.hindi} · {chapter.verses} verses</ThemedText>
                  </View>
                  {granthProgress[chapter.id] ? (
                    <Ionicons name="checkmark-circle" size={22} color={theme.primary} />
                  ) : (
                    <Ionicons name="chevron-forward-outline" size={18} color={theme.textSecondary} />
                  )}
                </ThemedCard>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Detail Modal */}
      <BottomSheet visible={!!selected} onClose={() => setSelected(null)}>
            {selected && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={s.modalHeader}>
                  <View style={[s.modalIconCircle, { backgroundColor: selected.color + '22' }]}>
                    <Ionicons name={selected.icon} size={40} color={selected.color} />
                  </View>
                  <ThemedText style={s.modalTitle}>{selected.title}</ThemedText>
                  <ThemedText secondary style={s.modalDeity}>{selected.deity}</ThemedText>
                </View>

                {/* Chalisa verses */}
                {selected.type === 'chalisa' && selected.verses.map((v, i) => (
                  <ThemedCard key={i} style={s.verseCard}>
                    <ThemedText style={s.verseText}>{v.verse}</ThemedText>
                    <ThemedText secondary style={s.verseMeaning}>{v.meaning}</ThemedText>
                  </ThemedCard>
                ))}

                {/* Aarti text */}
                {selected.type === 'aarti' && (
                  <ThemedCard>
                    <ThemedText style={s.fullText}>{selected.text}</ThemedText>
                  </ThemedCard>
                )}

                {/* Granth chapter */}
                {selected.type === 'granth' && (
                  <View>
                    <ThemedCard style={{ marginBottom: 12 }}>
                      <ThemedText secondary style={{ fontSize: 11, marginBottom: 4 }}>Summary</ThemedText>
                      <ThemedText style={{ fontSize: 14, lineHeight: 22 }}>{selected.summary}</ThemedText>
                    </ThemedCard>
                    {!granthProgress[selected.id] ? (
                      <TouchableOpacity
                        style={[s.markReadBtn, { backgroundColor: theme.primary }]}
                        onPress={() => { markRead(selected.id); setSelected(null); }}
                      >
                        <Ionicons name="checkmark-outline" size={20} color="#fff" />
                        <ThemedText style={{ color: '#fff', fontWeight: '700' }}>Mark as Read</ThemedText>
                      </TouchableOpacity>
                    ) : (
                      <View style={[s.markReadBtn, { backgroundColor: theme.success }]}>
                        <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                        <ThemedText style={{ color: '#fff', fontWeight: '700' }}>Chapter Completed</ThemedText>
                      </View>
                    )}
                  </View>
                )}

                {/* Mantra text */}
                {selected.type === 'mantra' && (
                  <View>
                    <ThemedCard style={s.mantraBox}>
                      <ThemedText style={[s.fullText, { color: selected.color }]}>{selected.text}</ThemedText>
                    </ThemedCard>
                    <ThemedCard style={{ marginTop: 12 }}>
                      <View style={s.cardTitleRow}>
                        <Ionicons name="information-circle-outline" size={16} color={theme.primary} />
                        <ThemedText style={[s.cardTitle, { color: theme.primary }]}>Meaning</ThemedText>
                      </View>
                      <ThemedText style={{ fontSize: 13, lineHeight: 22 }}>{selected.meaning}</ThemedText>
                    </ThemedCard>
                  </View>
                )}

                <TouchableOpacity style={[s.closeBtn, { borderColor: theme.border }]} onPress={() => setSelected(null)}>
                  <ThemedText secondary>Close</ThemedText>
                </TouchableOpacity>
              </ScrollView>
            )}
          </BottomSheet>
    </ThemedView>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  heading: { fontSize: 28, fontWeight: '700' },
  subheading: { fontSize: 13, marginTop: 4, marginBottom: 16 },
  tabSwitcher: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, padding: 4, marginBottom: 16 },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  tabBtnText: { fontSize: 13, fontWeight: '600' },
  listCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  listTitle: { fontSize: 15, fontWeight: '600' },
  listDeity: { fontSize: 12, marginTop: 2 },
  modalHeader: { alignItems: 'center', marginBottom: 20 },
  modalIconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 24, fontWeight: '700' },
  modalDeity: { fontSize: 13, marginTop: 4 },
  verseCard: { marginBottom: 10 },
  verseText: { fontSize: 16, fontWeight: '600', lineHeight: 26, marginBottom: 6 },
  verseMeaning: { fontSize: 13, lineHeight: 20 },
  fullText: { fontSize: 16, lineHeight: 28, fontWeight: '500' },
  mantraBox: { borderWidth: 0, backgroundColor: theme.surface2 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  closeBtn: { borderWidth: 1, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 12, marginBottom: 8 },
  progressCard: { marginBottom: 12 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  progressTitle: { fontSize: 15, fontWeight: '700' },
  progressSub: { fontSize: 12, marginTop: 2 },
  progressPct: { fontSize: 28, fontWeight: '700' },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  japaBanner: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, marginBottom: 16 },
  japaBannerTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 2 },
  japaBannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  progressFill: { height: 8, borderRadius: 4 },
  chapterNum: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  chapterNumText: { fontSize: 14, fontWeight: '700' },
  markReadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, padding: 16, marginBottom: 10 },
});