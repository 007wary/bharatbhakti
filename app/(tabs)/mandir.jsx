import { useState, useCallback, useEffect } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import BottomSheet from '../../components/BottomSheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedCard from '../../components/ThemedCard';
import DEITIES from '../../constants/deities';
import { requestNotificationPermission, scheduleAlarm, cancelAlarm, saveAlarms, loadAlarms } from '../../services/alarmService';

export default function Mandir() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedDeity, setSelectedDeity] = useState(null);
  const [diyaLit, setDiyaLit] = useState(false);
  const [pujaDone, setPujaDone] = useState(false);
  const [alarms, setAlarms] = useState([]);
  const [showAlarmModal, setShowAlarmModal] = useState(false);
  const [alarmTime, setAlarmTime] = useState('06:00 AM');
  const [alarmDate, setAlarmDate] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [alarmLabel, setAlarmLabel] = useState('Morning Puja');
  const [alarmMantra, setAlarmMantra] = useState('Om Namah Shivaya');

  useEffect(() => {
    loadAlarms().then(setAlarms);
    requestNotificationPermission();
  }, []);

  const addAlarm = async () => {
    const alarm = { id: Date.now().toString(), time: alarmTime, label: alarmLabel, mantra: alarmMantra, active: true };
    const notifId = await scheduleAlarm(alarm);
    alarm.notifId = notifId;
    const updated = [...alarms, alarm];
    setAlarms(updated);
    await saveAlarms(updated);
    setShowAlarmModal(false);
  };

  const toggleAlarm = async (id) => {
    const updated = await Promise.all(alarms.map(async (a) => {
      if (a.id !== id) return a;
      if (a.active) {
        await cancelAlarm(a.notifId);
        return { ...a, active: false };
      } else {
        const notifId = await scheduleAlarm(a);
        return { ...a, active: true, notifId };
      }
    }));
    setAlarms(updated);
    await saveAlarms(updated);
  };

  const deleteAlarm = async (id) => {
    const alarm = alarms.find((a) => a.id === id);
    if (alarm?.notifId) await cancelAlarm(alarm.notifId);
    const updated = alarms.filter((a) => a.id !== id);
    setAlarms(updated);
    await saveAlarms(updated);
  };

  const s = makeStyles(theme);

  const handlePuja = () => {
    setDiyaLit(true);
    setTimeout(() => setPujaDone(true), 800);
  };

  const closeModal = () => {
    setSelectedDeity(null);
    setDiyaLit(false);
    setPujaDone(false);
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ThemedText style={s.heading}>Mandir</ThemedText>
        <ThemedText secondary style={s.subheading}>Your virtual sacred space</ThemedText>

        {/* Deity Library */}
        <ThemedText secondary style={s.sectionLabel}>Choose your deity</ThemedText>
        <View style={s.deityGrid}>
          {DEITIES.map((deity) => (
            <TouchableOpacity
              key={deity.id}
              style={[s.deityCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => setSelectedDeity(deity)}
            >
              <View style={[s.deityIconCircle, { backgroundColor: deity.color + '22' }]}>
                <Ionicons name={`${deity.icon}-outline`} size={28} color={deity.color} />
              </View>
              <ThemedText style={s.deityName}>{deity.name}</ThemedText>
              <ThemedText secondary style={s.deityEnglish}>{deity.english}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Daily Mantra Card */}
        <ThemedCard style={{ marginTop: 8 }}>
          <View style={s.cardTitleRow}>
            <Ionicons name="volume-medium-outline" size={18} color={theme.primary} />
            <ThemedText style={[s.cardTitle, { color: theme.primary }]}>Aaj ka Mantra</ThemedText>
          </View>
          <ThemedText style={s.mantraText}>
            {DEITIES[new Date().getDay() % DEITIES.length].mantra}
          </ThemedText>
          <ThemedText secondary style={{ fontSize: 12, marginTop: 4 }}>
            {DEITIES[new Date().getDay() % DEITIES.length].english}
          </ThemedText>
        </ThemedCard>

        {/* Puja Alarms */}
        <View style={{ marginTop: 16 }}>
          <View style={s.sectionHeader}>
            <ThemedText secondary style={s.sectionLabel}>Puja Alarms</ThemedText>
            <TouchableOpacity
              style={[s.addBtn, { backgroundColor: theme.primary }]}
              onPress={() => setShowAlarmModal(true)}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <ThemedText style={s.addBtnText}>Add</ThemedText>
            </TouchableOpacity>
          </View>

          {alarms.length === 0 && (
            <ThemedCard style={s.emptyCard}>
              <Ionicons name="alarm-outline" size={32} color={theme.textSecondary} />
              <ThemedText secondary style={{ marginTop: 8, textAlign: 'center', fontSize: 13 }}>No alarms yet. Add one for your daily puja.</ThemedText>
            </ThemedCard>
          )}

          {alarms.map((alarm) => (
            <ThemedCard key={alarm.id} style={s.alarmCard}>
              <View style={{ flex: 1 }}>
                <ThemedText style={s.alarmTime}>{alarm.time}</ThemedText>
                <ThemedText style={s.alarmLabel}>{alarm.label}</ThemedText>
                <ThemedText secondary style={s.alarmMantra}>{alarm.mantra}</ThemedText>
              </View>
              <View style={s.alarmActions}>
                <TouchableOpacity onPress={() => toggleAlarm(alarm.id)}>
                  <Ionicons name={alarm.active ? 'toggle' : 'toggle-outline'} size={32} color={alarm.active ? theme.primary : theme.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteAlarm(alarm.id)} style={{ marginTop: 8 }}>
                  <Ionicons name="trash-outline" size={20} color={theme.error} />
                </TouchableOpacity>
              </View>
            </ThemedCard>
          ))}
        </View>
      </ScrollView>

      {/* Add Alarm Modal */}
      <BottomSheet visible={showAlarmModal} onClose={() => setShowAlarmModal(false)}>
        <ThemedText style={[s.cardTitle, { fontSize: 18, marginBottom: 16 }]}>New Puja Alarm</ThemedText>
        <ThemedText secondary style={s.sectionLabel}>Time</ThemedText>
        <TouchableOpacity
          style={[s.input, { borderColor: theme.border, backgroundColor: theme.surface2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
          onPress={() => setShowTimePicker(true)}
        >
          <ThemedText style={{ fontSize: 15 }}>{alarmTime}</ThemedText>
          <Ionicons name="time-outline" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={alarmDate}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'android' ? 'default' : 'spinner'}
            onChange={(event, selected) => {
              setShowTimePicker(false);
              if (selected) {
                setAlarmDate(selected);
                const hours = selected.getHours();
                const minutes = selected.getMinutes();
                const isPM = hours >= 12;
                const displayHours = hours % 12 || 12;
                const displayMinutes = String(minutes).padStart(2, '0');
                setAlarmTime(`${displayHours}:${displayMinutes} ${isPM ? 'PM' : 'AM'}`);
              }
            }}
          />
        )}
        <ThemedText secondary style={s.sectionLabel}>Label</ThemedText>
        <TextInput
          style={[s.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface2 }]}
          value={alarmLabel}
          onChangeText={setAlarmLabel}
          placeholder="Morning Puja"
          placeholderTextColor={theme.textSecondary}
        />
        <ThemedText secondary style={s.sectionLabel}>Mantra</ThemedText>
        <TextInput
          style={[s.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface2 }]}
          value={alarmMantra}
          onChangeText={setAlarmMantra}
          placeholder="Om Namah Shivaya"
          placeholderTextColor={theme.textSecondary}
        />
        <TouchableOpacity style={[s.addAlarmBtn, { backgroundColor: theme.primary }]} onPress={addAlarm}>
          <ThemedText style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Set Alarm</ThemedText>
        </TouchableOpacity>
      </BottomSheet>

      {/* Deity Modal */}
      <BottomSheet visible={!!selectedDeity} onClose={closeModal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {selectedDeity && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Modal Header */}
                <View style={s.modalHeader}>
                  <View style={[s.modalIconCircle, { backgroundColor: selectedDeity.color + '22' }]}>
                    <Ionicons name={`${selectedDeity.icon}-outline`} size={48} color={selectedDeity.color} />
                  </View>
                  <ThemedText style={s.modalName}>{selectedDeity.name}</ThemedText>
                  <ThemedText secondary style={s.modalEnglish}>{selectedDeity.english}</ThemedText>
                </View>

                {/* Description */}
                <ThemedText style={s.modalDesc}>{selectedDeity.description}</ThemedText>

                {/* Mantra */}
                <View style={[s.mantraBox, { backgroundColor: selectedDeity.color + '11', borderColor: selectedDeity.color + '44' }]}>
                  <ThemedText secondary style={{ fontSize: 11, marginBottom: 4 }}>Mantra</ThemedText>
                  <ThemedText style={[s.modalMantra, { color: selectedDeity.color }]}>{selectedDeity.mantra}</ThemedText>
                </View>

                {/* Aarti */}
                <ThemedCard style={{ marginTop: 12 }}>
                  <View style={s.cardTitleRow}>
                    <Ionicons name="musical-notes-outline" size={16} color={theme.primary} />
                    <ThemedText style={[s.cardTitle, { color: theme.primary }]}>Aarti</ThemedText>
                  </View>
                  <ThemedText style={{ fontSize: 13, lineHeight: 22 }}>{selectedDeity.aarti}</ThemedText>
                </ThemedCard>

                {/* Virtual Puja */}
                <ThemedCard style={{ marginTop: 12 }}>
                  <View style={s.cardTitleRow}>
                    <Ionicons name="flame-outline" size={16} color={theme.primary} />
                    <ThemedText style={[s.cardTitle, { color: theme.primary }]}>Virtual Puja</ThemedText>
                  </View>
                  <TouchableOpacity
                    style={[s.pujaBtn, { backgroundColor: diyaLit ? selectedDeity.color : theme.surface2, borderColor: selectedDeity.color }]}
                    onPress={handlePuja}
                    disabled={diyaLit}
                  >
                    <Ionicons name={diyaLit ? 'flame' : 'flame-outline'} size={32} color={diyaLit ? '#fff' : selectedDeity.color} />
                    <ThemedText style={[s.pujaBtnText, { color: diyaLit ? '#fff' : selectedDeity.color }]}>
                      {diyaLit ? 'Diya Lit' : 'Light Diya'}
                    </ThemedText>
                  </TouchableOpacity>
                  {pujaDone && (
                    <ThemedText style={[s.pujaBlessing, { color: selectedDeity.color }]}>
                      Jai {selectedDeity.english}! May you be blessed today.
                    </ThemedText>
                  )}
                </ThemedCard>

                {/* Close */}
                <TouchableOpacity style={[s.closeBtn, { borderColor: theme.border }]} onPress={closeModal}>
                  <ThemedText secondary>Close</ThemedText>
                </TouchableOpacity>
              </ScrollView>
            )}
          </ScrollView>
        </BottomSheet>
    </ThemedView>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  timeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  timeChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  emptyCard: { alignItems: 'center', paddingVertical: 24 },
  alarmCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  alarmTime: { fontSize: 28, fontWeight: '700' },
  alarmLabel: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  alarmMantra: { fontSize: 12, marginTop: 2 },
  alarmActions: { alignItems: 'center' },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 15, marginBottom: 12 },
  addAlarmBtn: { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 4 },
  heading: { fontSize: 28, fontWeight: '700' },
  subheading: { fontSize: 13, marginTop: 4, marginBottom: 16 },
  sectionLabel: { fontSize: 13, marginBottom: 12 },
  deityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  deityCard: { width: '30%', borderWidth: 1, borderRadius: 16, padding: 12, alignItems: 'center', gap: 6 },
  deityIconCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  deityName: { fontSize: 14, fontWeight: '700' },
  deityEnglish: { fontSize: 11 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  mantraText: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
  modalHeader: { alignItems: 'center', marginBottom: 16 },
  modalIconCircle: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  modalName: { fontSize: 28, fontWeight: '700' },
  modalEnglish: { fontSize: 14, marginTop: 2 },
  modalDesc: { fontSize: 14, lineHeight: 22, marginBottom: 12 },
  mantraBox: { borderWidth: 1, borderRadius: 12, padding: 14 },
  modalMantra: { fontSize: 16, fontWeight: '700', lineHeight: 24 },
  pujaBtn: { borderWidth: 2, borderRadius: 16, padding: 20, alignItems: 'center', gap: 8 },
  pujaBtnText: { fontSize: 16, fontWeight: '700' },
  pujaBlessing: { textAlign: 'center', marginTop: 12, fontSize: 14, fontWeight: '600' },
  closeBtn: { borderWidth: 1, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 12, marginBottom: 8 },
});