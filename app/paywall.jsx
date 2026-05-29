import { useState, useEffect, useMemo } from 'react';
import {
  View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import { purchaseMonthly, restorePurchases, checkProStatus } from '../services/purchaseService';

const PRO_FEATURES = [
  { icon: 'ban-outline', label: 'Ad-free experience', desc: 'No interruptions during puja' },
  { icon: 'notifications-outline', label: 'Festival Notifications', desc: 'Never miss a festival again' },
  { icon: 'infinite-outline', label: 'Unlimited Japa History', desc: 'Track all your sessions' },
  { icon: 'color-palette-outline', label: 'Theme Customization', desc: 'Light, dark & more themes' },
  { icon: 'star-outline', label: 'Advanced Panchang', desc: 'Full Vedic calendar details' },
  { icon: 'heart-outline', label: 'Support Development', desc: 'Help us grow Bharat Bhakti' },
];

export default function Paywall() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    checkProStatus().then(setIsPro);
  }, []);

  const handlePurchase = async () => {
    setLoading(true);
    const result = await purchaseMonthly();
    setLoading(false);
    if (result.success) {
      setIsPro(true);
      setTimeout(() => router.back(), 1500);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    const result = await restorePurchases();
    setRestoring(false);
    if (result.success) {
      setIsPro(true);
      setTimeout(() => router.back(), 1500);
    }
  };

  const s = useMemo(() => makeStyles(theme, insets), [theme, insets]);

  if (isPro) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <ThemedText style={{ fontSize: 56, marginBottom: 16 }}>🙏</ThemedText>
        <ThemedText style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>You're Pro!</ThemedText>
        <ThemedText secondary style={{ fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
          Thank you for supporting Bharat Bhakti. Enjoy all Pro features.
        </ThemedText>
        <TouchableOpacity
          style={[s.purchaseBtn, { backgroundColor: theme.primary }]}
          onPress={() => router.back()}
        >
          <ThemedText style={s.purchaseBtnText}>Continue</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[s.heroSection, { backgroundColor: theme.primary }]}>
          <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <ThemedText style={s.heroEmoji}>🪔</ThemedText>
          <ThemedText style={s.heroTitle}>Bharat Bhakti Pro</ThemedText>
          <ThemedText style={s.heroSub}>Complete your spiritual journey</ThemedText>
        </View>

        {/* Features */}
        <View style={s.featuresSection}>
          <ThemedText style={s.featuresTitle}>Everything in Pro</ThemedText>
          {PRO_FEATURES.map((f, i) => (
            <View key={i} style={s.featureRow}>
              <View style={[s.featureIcon, { backgroundColor: theme.primary + '22' }]}>
                <Ionicons name={f.icon} size={22} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={s.featureLabel}>{f.label}</ThemedText>
                <ThemedText secondary style={s.featureDesc}>{f.desc}</ThemedText>
              </View>
              <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View style={s.pricingSection}>
          <View style={[s.pricingCard, { borderColor: theme.primary, backgroundColor: theme.primary + '10' }]}>
            <View style={[s.popularBadge, { backgroundColor: theme.primary }]}>
              <ThemedText style={s.popularText}>MOST POPULAR</ThemedText>
            </View>
            <ThemedText style={[s.pricingAmount, { color: theme.primary }]}>₹199</ThemedText>
            <ThemedText secondary style={s.pricingPeriod}>per month</ThemedText>
            <ThemedText secondary style={s.pricingCancel}>Cancel anytime</ThemedText>
          </View>
        </View>

      </ScrollView>

      {/* Bottom CTA */}
      <View style={[s.bottomBar, { backgroundColor: theme.background, borderTopColor: theme.border, paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[s.purchaseBtn, { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }]}
          onPress={handlePurchase}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <ThemedText style={s.purchaseBtnText}>Start Pro — ₹199/month</ThemedText>
          }
        </TouchableOpacity>
        <TouchableOpacity style={s.restoreBtn} onPress={handleRestore} disabled={restoring}>
          {restoring
            ? <ActivityIndicator color={theme.textSecondary} size="small" />
            : <ThemedText secondary style={s.restoreText}>Restore Purchases</ThemedText>
          }
        </TouchableOpacity>
        <ThemedText secondary style={s.legalText}>
          Subscription auto-renews monthly. Cancel anytime in Play Store.
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const makeStyles = (theme, insets) => StyleSheet.create({
  heroSection: { paddingTop: insets.top + 20, paddingBottom: 32, alignItems: 'center', paddingHorizontal: 24 },
  closeBtn: { position: 'absolute', top: insets.top + 12, right: 16, padding: 8 },
  heroEmoji: { fontSize: 52, marginBottom: 12 },
  heroTitle: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 6 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  featuresSection: { padding: 20 },
  featuresTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  featureIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  featureLabel: { fontSize: 14, fontWeight: '600' },
  featureDesc: { fontSize: 12, marginTop: 2 },
  pricingSection: { paddingHorizontal: 20, paddingBottom: 20 },
  pricingCard: { borderWidth: 2, borderRadius: 20, padding: 24, alignItems: 'center', position: 'relative' },
  popularBadge: { position: 'absolute', top: -12, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4 },
  popularText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  pricingAmount: { fontSize: 48, fontWeight: '700', marginTop: 8 },
  pricingPeriod: { fontSize: 14, marginTop: 4 },
  pricingCancel: { fontSize: 12, marginTop: 8 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, borderTopWidth: 1 },
  purchaseBtn: { borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 12 },
  purchaseBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  restoreBtn: { alignItems: 'center', marginBottom: 8 },
  restoreText: { fontSize: 13 },
  legalText: { fontSize: 11, textAlign: 'center' },
});