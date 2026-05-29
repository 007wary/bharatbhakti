import { useState } from 'react';
import { ScrollView, TextInput, TouchableOpacity, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import { saveOnboarding } from '../services/storageService';
import { Ionicons } from '@expo/vector-icons';

const DEITIES = [
  { id: 'shiva', label: 'शिव', english: 'Shiva', icon: 'moon-outline' },
  { id: 'vishnu', label: 'विष्णु', english: 'Vishnu', icon: 'flower-outline' },
  { id: 'durga', label: 'दुर्गा', english: 'Durga', icon: 'shield-outline' },
  { id: 'ganesh', label: 'गणेश', english: 'Ganesh', icon: 'star-outline' },
  { id: 'krishna', label: 'कृष्ण', english: 'Krishna', icon: 'musical-note-outline' },
  { id: 'hanuman', label: 'हनुमान', english: 'Hanuman', icon: 'flame-outline' },
];

const LANGUAGES = [
  { id: 'hindi', label: 'हिंदी', english: 'Hindi' },
  { id: 'english', label: 'English', english: 'English' },
];

export default function Onboarding() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [deity, setDeity] = useState('');
  const [language, setLanguage] = useState('');

  const handleFinish = async () => {
    await saveOnboarding({ name, deity, language });
    router.replace('/(tabs)/aaj');
  };

  const styles = makeStyles(theme);

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step indicator */}
        <View style={styles.stepRow}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={[styles.stepDot, { backgroundColor: s <= step ? theme.primary : theme.border }]} />
          ))}
        </View>

        {step === 1 && (
          <View style={styles.section}>
            <ThemedText style={styles.heading}>स्वागत है</ThemedText>
            <ThemedText style={styles.subheading}>Welcome to Bharat Bhakti</ThemedText>
            <ThemedText secondary style={styles.label}>Your name</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface }]}
              placeholder="Enter your name"
              placeholderTextColor={theme.textSecondary}
              value={name}
              onChangeText={setName}
            />
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: name.trim() ? theme.primary : theme.border }]}
              onPress={() => name.trim() && setStep(2)}
            >
              <ThemedText style={styles.btnText}>आगे बढ़ें →</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.section}>
            <ThemedText style={styles.heading}>आपके आराध्य</ThemedText>
            <ThemedText secondary style={styles.label}>Choose your deity</ThemedText>
            <View style={styles.grid}>
              {DEITIES.map((d) => (
                <TouchableOpacity
                  key={d.id}
                  style={[styles.deityCard, { backgroundColor: deity === d.id ? theme.primary : theme.surface, borderColor: deity === d.id ? theme.primary : theme.border }]}
                  onPress={() => setDeity(d.id)}
                >
                  <Ionicons name={d.icon} size={28} color={deity === d.id ? '#fff' : theme.primary} style={{ marginBottom: 4 }} />
                  <ThemedText style={[styles.deityLabel, { color: deity === d.id ? '#fff' : theme.text }]}>{d.label}</ThemedText>
                  <ThemedText style={[styles.deityEnglish, { color: deity === d.id ? '#fff' : theme.textSecondary }]}>{d.english}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: deity ? theme.primary : theme.border }]}
              onPress={() => deity && setStep(3)}
            >
              <ThemedText style={styles.btnText}>आगे बढ़ें →</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={styles.section}>
            <ThemedText style={styles.heading}>भाषा चुनें</ThemedText>
            <ThemedText secondary style={styles.label}>Choose your language</ThemedText>
            <View style={styles.langRow}>
              {LANGUAGES.map((l) => (
                <TouchableOpacity
                  key={l.id}
                  style={[styles.langCard, { backgroundColor: language === l.id ? theme.primary : theme.surface, borderColor: language === l.id ? theme.primary : theme.border }]}
                  onPress={() => setLanguage(l.id)}
                >
                  <ThemedText style={[styles.langLabel, { color: language === l.id ? '#fff' : theme.text }]}>{l.label}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: language ? theme.primary : theme.border }]}
              onPress={() => language && handleFinish()}
            >
              <ThemedText style={styles.btnText}>शुरू करें</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24 },
  stepRow: { flexDirection: 'row', gap: 8, marginBottom: 40, justifyContent: 'center' },
  stepDot: { width: 32, height: 4, borderRadius: 2 },
  section: { flex: 1 },
  heading: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subheading: { fontSize: 16, color: theme.textSecondary, marginBottom: 32 },
  label: { fontSize: 14, marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 24 },
  btn: { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  deityCard: { width: '30%', borderWidth: 1, borderRadius: 14, padding: 12, alignItems: 'center' },
  deityEmoji: { marginBottom: 4 },
  deityLabel: { fontSize: 14, fontWeight: '700' },
  deityEnglish: { fontSize: 11, marginTop: 2 },
  langRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  langCard: { flex: 1, borderWidth: 1, borderRadius: 14, padding: 20, alignItems: 'center' },
  langLabel: { fontSize: 18, fontWeight: '700' },
});