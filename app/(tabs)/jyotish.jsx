import { useState, useCallback, useMemo } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedCard from '../../components/ThemedCard';
import { getPanchang } from '../../services/panchaangService';
import { generateRashifal } from '../../services/geminiService';
import { FESTIVALS, getUpcomingFestivals, getFestivalsByMonth, getDaysUntil } from '../../constants/festivals';

const RAASHI = [
  { id: 'Aries', hindi: 'मेष', icon: 'fitness-outline' },
  { id: 'Taurus', hindi: 'वृषभ', icon: 'leaf-outline' },
  { id: 'Gemini', hindi: 'मिथुन', icon: 'people-outline' },
  { id: 'Cancer', hindi: 'कर्क', icon: 'water-outline' },
  { id: 'Leo', hindi: 'सिंह', icon: 'sunny-outline' },
  { id: 'Virgo', hindi: 'कन्या', icon: 'flower-outline' },
  { id: 'Libra', hindi: 'तुला', icon: 'scale-outline' },
  { id: 'Scorpio', hindi: 'वृश्चिक', icon: 'skull-outline' },
  { id: 'Sagittarius', hindi: 'धनु', icon: 'arrow-up-outline' },
  { id: 'Capricorn', hindi: 'मकर', icon: 'trending-up-outline' },
  { id: 'Aquarius', hindi: 'कुंभ', icon: 'flask-outline' },
  { id: 'Pisces', hindi: 'मीन', icon: 'fish-outline' },
];

const CHOGHADIYA = [
  { name: 'Udveg', type: 'bad' },
  { name: 'Char', type: 'good' },
  { name: 'Labh', type: 'good' },
  { name: 'Amrit', type: 'best' },
  { name: 'Kaal', type: 'bad' },
  { name: 'Shubh', type: 'good' },
  { name: 'Rog', type: 'bad' },
  { name: 'Udveg', type: 'bad' },
];

const getChoghadiyaColor = (type, theme) => {
  if (type === 'best') return '#15803D';
  if (type === 'good') return theme.primary;
  return '#DC2626';
};

export default function Jyotish() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [panchang, setPanchang] = useState(null);
  const [selectedRaashi, setSelectedRaashi] = useState(null);
  const [rashifal, setRashifal] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('rashifal');
  const [selectedFestival, setSelectedFestival] = useState(null);

  useFocusEffect(
    useCallback(() => {
      setPanchang(getPanchang());
    }, [])
  );

  const fetchRashifal = async (sign) => {
    setSelectedRaashi(sign);
    setRashifal('');
    setLoading(true);
    const result = await generateRashifal(sign);
    setRashifal(result);
    setLoading(false);
  };

  const upcomingFestivals = useMemo(() => getUpcomingFestivals(60), []);
  const festivalsByMonth = useMemo(() => getFestivalsByMonth(), []);

  const s = useMemo(() => makeStyles(theme), [theme]);

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ThemedText style={s.heading}>Jyotish</ThemedText>
        <ThemedText secondary style={s.subheading}>Vedic Astrology & Panchang</ThemedText>

        {/* Tab Switcher */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={[s.tabSwitcher, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
            {['rashifal', 'panchang', 'choghadiya', 'tyohar'].map((t) => (
              <TouchableOpacity
                key={t}
                style={[s.tabBtn, { backgroundColor: activeTab === t ? theme.primary : 'transparent' }]}
                onPress={() => setActiveTab(t)}
              >
                <ThemedText style={[s.tabBtnText, { color: activeTab === t ? '#fff' : theme.textSecondary }]}>
                  {t === 'rashifal' ? 'Rashifal' : t === 'panchang' ? 'Panchang' : t === 'choghadiya' ? 'Choghadiya' : 'Tyohar'}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Rashifal Tab */}
        {activeTab === 'rashifal' && (
          <View>
            <ThemedText secondary style={s.sectionLabel}>Select your Raashi</ThemedText>
            <View style={s.raashiGrid}>
              {RAASHI.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={[s.raashiCard, { backgroundColor: selectedRaashi === r.id ? theme.primary : theme.surface, borderColor: selectedRaashi === r.id ? theme.primary : theme.border }]}
                  onPress={() => fetchRashifal(r.id)}
                >
                  <Ionicons name={r.icon} size={20} color={selectedRaashi === r.id ? '#fff' : theme.primary} />
                  <ThemedText style={[s.raashiHindi, { color: selectedRaashi === r.id ? '#fff' : theme.text }]}>{r.hindi}</ThemedText>
                  <ThemedText style={[s.raashiId, { color: selectedRaashi === r.id ? '#fff' : theme.textSecondary }]}>{r.id}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
            {loading && (
              <ThemedCard style={s.rashibox}>
                <ActivityIndicator color={theme.primary} />
                <ThemedText secondary style={{ marginTop: 8, textAlign: 'center' }}>Consulting the stars...</ThemedText>
              </ThemedCard>
            )}
            {!loading && rashifal ? (
              <ThemedCard style={s.rashibox}>
                <View style={s.cardTitleRow}>
                  <Ionicons name="star" size={16} color={theme.primary} />
                  <ThemedText style={[s.cardTitle, { color: theme.primary }]}>{selectedRaashi} Rashifal</ThemedText>
                </View>
                <ThemedText style={{ fontSize: 14, lineHeight: 22 }}>{rashifal}</ThemedText>
              </ThemedCard>
            ) : null}
          </View>
        )}

        {/* Panchang Tab */}
        {activeTab === 'panchang' && panchang && (
          <ThemedCard style={{ marginTop: 12 }}>
            <View style={s.cardTitleRow}>
              <Ionicons name="calendar" size={16} color={theme.primary} />
              <ThemedText style={[s.cardTitle, { color: theme.primary }]}>Aaj ka Panchang</ThemedText>
            </View>
            {[
              { label: 'Tithi', value: panchang.tithi },
              { label: 'Nakshatra', value: panchang.nakshatra },
              { label: 'Yoga', value: panchang.yoga },
              { label: 'Karan', value: panchang.karan },
              { label: 'Vara', value: panchang.vara },
              { label: 'Rahu Kaal', value: `${panchang.rahuStart.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} – ${panchang.rahuEnd.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` },
            ].map((item) => (
              <View key={item.label} style={[s.panchaangRow, { borderBottomColor: theme.border }]}>
                <ThemedText secondary style={s.panchaangLabel}>{item.label}</ThemedText>
                <ThemedText style={s.panchaangValue}>{item.value}</ThemedText>
              </View>
            ))}
          </ThemedCard>
        )}

        {/* Choghadiya Tab */}
        {activeTab === 'choghadiya' && (
          <View style={{ marginTop: 12 }}>
            <ThemedText secondary style={s.sectionLabel}>Today's Choghadiya</ThemedText>
            {CHOGHADIYA.map((c, i) => {
              const startHour = 6 + i * 1.5;
              const endHour = startHour + 1.5;
              const toTime = (h) => {
                const hh = Math.floor(h);
                const mm = (h % 1) * 60;
                return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
              };
              const now = new Date();
              const nowH = now.getHours() + now.getMinutes() / 60;
              const isActive = nowH >= startHour && nowH < endHour;
              return (
                <ThemedCard key={i} style={[s.choghaCard, isActive && { borderColor: theme.primary, borderWidth: 2 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <ThemedText style={{ fontWeight: '700', fontSize: 15 }}>{c.name}</ThemedText>
                      <ThemedText secondary style={{ fontSize: 12, marginTop: 2 }}>{toTime(startHour)} – {toTime(endHour)}</ThemedText>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      {isActive && <ThemedText style={{ fontSize: 11, color: theme.primary, fontWeight: '700' }}>NOW</ThemedText>}
                      <View style={[s.typeBadge, { backgroundColor: getChoghadiyaColor(c.type, theme) + '22' }]}>
                        <ThemedText style={[s.typeText, { color: getChoghadiyaColor(c.type, theme) }]}>{c.type}</ThemedText>
                      </View>
                    </View>
                  </View>
                </ThemedCard>
              );
            })}
          </View>
        )}

        {/* Tyohar Tab */}
        {activeTab === 'tyohar' && (
          <View>
            {/* Upcoming Festivals */}
            {upcomingFestivals.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <View style={s.cardTitleRow}>
                  <Ionicons name="time-outline" size={16} color={theme.primary} />
                  <ThemedText style={[s.cardTitle, { color: theme.primary }]}>Aane Wale Tyohar</ThemedText>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: 12, paddingBottom: 4 }}>
                    {upcomingFestivals.map(f => (
                      <TouchableOpacity
                        key={f.id}
                        style={[s.upcomingCard, { backgroundColor: f.color + '18', borderColor: f.color + '44' }]}
                        onPress={() => setSelectedFestival(f)}
                      >
                        <Ionicons name={f.icon} size={28} color={f.color} />
                        <ThemedText style={[s.upcomingName, { color: f.color }]}>{f.name}</ThemedText>
                        <ThemedText style={[s.upcomingHindi, { color: f.color + 'bb' }]}>{f.hindi}</ThemedText>
                        <View style={[s.upcomingDaysBadge, { backgroundColor: f.color }]}>
                          <ThemedText style={s.upcomingDaysText}>{getDaysUntil(f.date)}</ThemedText>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* All Festivals by Month */}
            <View style={s.cardTitleRow}>
              <Ionicons name="calendar-outline" size={16} color={theme.primary} />
              <ThemedText style={[s.cardTitle, { color: theme.primary }]}>Saal Bhar ke Tyohar</ThemedText>
            </View>
            {Object.entries(festivalsByMonth).map(([month, festivals]) => (
              <View key={month} style={{ marginBottom: 16 }}>
                <ThemedText style={s.monthLabel}>{month}</ThemedText>
                {festivals.map(f => {
                  const daysUntil = getDaysUntil(f.date);
                  const isPast = daysUntil === null;
                  return (
                    <TouchableOpacity key={f.id} onPress={() => setSelectedFestival(f)}>
                      <ThemedCard style={[s.festivalRow, isPast && { opacity: 0.5 }]}>
                        <View style={[s.festivalIconCircle, { backgroundColor: f.color + '22' }]}>
                          <Ionicons name={f.icon} size={22} color={f.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <ThemedText style={s.festivalName}>{f.name}</ThemedText>
                          <ThemedText secondary style={s.festivalHindi}>{f.hindi} · {f.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</ThemedText>
                        </View>
                        {daysUntil && (
                          <View style={[s.daysBadge, { backgroundColor: f.color + '22' }]}>
                            <ThemedText style={[s.daysText, { color: f.color }]}>{daysUntil}</ThemedText>
                          </View>
                        )}
                        {isPast && (
                          <Ionicons name="checkmark-circle-outline" size={18} color={theme.textSecondary} />
                        )}
                      </ThemedCard>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        )}

      </ScrollView>

      {/* Festival Detail Modal */}
      <Modal
        visible={!!selectedFestival}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedFestival(null)}
      >
        <View style={s.modalOverlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setSelectedFestival(null)}
          />
          <View style={[s.modalSheet, { backgroundColor: theme.background }]}>
            <View style={s.modalHandle} />
            {selectedFestival && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Festival Header */}
                <View style={s.modalHeader}>
                  <View style={[s.modalIconCircle, { backgroundColor: selectedFestival.color + '22' }]}>
                    <Ionicons name={selectedFestival.icon} size={40} color={selectedFestival.color} />
                  </View>
                  <ThemedText style={s.modalTitle}>{selectedFestival.name}</ThemedText>
                  <ThemedText style={[s.modalHindi, { color: selectedFestival.color }]}>{selectedFestival.hindi}</ThemedText>
                  <View style={[s.modalDateBadge, { backgroundColor: selectedFestival.color + '22' }]}>
                    <Ionicons name="calendar-outline" size={13} color={selectedFestival.color} />
                    <ThemedText style={[s.modalDateText, { color: selectedFestival.color }]}>
                      {selectedFestival.date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </ThemedText>
                  </View>
                </View>

                {/* Deity */}
                <ThemedCard style={{ marginBottom: 12 }}>
                  <View style={s.cardTitleRow}>
                    <Ionicons name="star-outline" size={14} color={theme.primary} />
                    <ThemedText style={[s.cardTitle, { color: theme.primary }]}>Deity</ThemedText>
                  </View>
                  <ThemedText style={{ fontSize: 14 }}>{selectedFestival.deity}</ThemedText>
                </ThemedCard>

                {/* Significance */}
                <ThemedCard style={{ marginBottom: 12 }}>
                  <View style={s.cardTitleRow}>
                    <Ionicons name="book-outline" size={14} color={theme.primary} />
                    <ThemedText style={[s.cardTitle, { color: theme.primary }]}>Mahatva</ThemedText>
                  </View>
                  <ThemedText style={{ fontSize: 14, lineHeight: 22 }}>{selectedFestival.significance}</ThemedText>
                </ThemedCard>

                {/* Rituals */}
                <ThemedCard style={{ marginBottom: 12 }}>
                  <View style={s.cardTitleRow}>
                    <Ionicons name="list-outline" size={14} color={theme.primary} />
                    <ThemedText style={[s.cardTitle, { color: theme.primary }]}>Puja Vidhi</ThemedText>
                  </View>
                  {selectedFestival.rituals.map((r, i) => (
                    <View key={i} style={s.ritualRow}>
                      <View style={[s.ritualDot, { backgroundColor: selectedFestival.color }]} />
                      <ThemedText style={{ fontSize: 14, flex: 1, lineHeight: 20 }}>{r}</ThemedText>
                    </View>
                  ))}
                </ThemedCard>

                <TouchableOpacity
                  style={[s.closeBtn, { borderColor: theme.border }]}
                  onPress={() => setSelectedFestival(null)}
                >
                  <ThemedText secondary>Close</ThemedText>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

    </ThemedView>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  heading: { fontSize: 28, fontWeight: '700' },
  subheading: { fontSize: 13, marginTop: 4, marginBottom: 16 },
  tabSwitcher: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, padding: 4 },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
  tabBtnText: { fontSize: 13, fontWeight: '600' },
  sectionLabel: { fontSize: 13, marginBottom: 12 },
  raashiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  raashiCard: { width: '22%', borderWidth: 1, borderRadius: 12, padding: 10, alignItems: 'center', gap: 4 },
  raashiHindi: { fontSize: 12, fontWeight: '700' },
  raashiId: { fontSize: 10 },
  rashibox: { marginTop: 4 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  panchaangRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  panchaangLabel: { fontSize: 13 },
  panchaangValue: { fontSize: 13, fontWeight: '600' },
  choghaCard: { marginBottom: 8 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  typeText: { fontSize: 11, fontWeight: '700' },
  // Tyohar
  upcomingCard: { width: 130, borderRadius: 16, borderWidth: 1, padding: 14, alignItems: 'center', gap: 6 },
  upcomingName: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  upcomingHindi: { fontSize: 11, textAlign: 'center' },
  upcomingDaysBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginTop: 4 },
  upcomingDaysText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  monthLabel: { fontSize: 13, fontWeight: '700', marginBottom: 8, opacity: 0.6 },
  festivalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  festivalIconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  festivalName: { fontSize: 14, fontWeight: '600' },
  festivalHindi: { fontSize: 12, marginTop: 2 },
  daysBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  daysText: { fontSize: 11, fontWeight: '700' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, maxHeight: '90%' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#ccc', alignSelf: 'center', marginBottom: 16 },
  modalHeader: { alignItems: 'center', marginBottom: 20 },
  modalIconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 24, fontWeight: '700' },
  modalHindi: { fontSize: 16, marginTop: 4, fontWeight: '600' },
  modalDateBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginTop: 10 },
  modalDateText: { fontSize: 13, fontWeight: '600' },
  ritualRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  ritualDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  closeBtn: { borderWidth: 1, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 4, marginBottom: 8 },
});