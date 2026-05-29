import { useState } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedCard from '../../components/ThemedCard';
import BottomSheet from '../../components/BottomSheet';
import WALLPAPERS, { CATEGORIES, DEITIES_FILTER } from '../../constants/wallpapers';
import { saveWallpaperToGallery, shareWallpaper } from '../../services/wallpaperService';

export default function Seva() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('wallpapers');
  const [wallpaperCategory, setWallpaperCategory] = useState('all');
  const [wallpaperDeity, setWallpaperDeity] = useState('all');
  const [selectedWallpaper, setSelectedWallpaper] = useState(null);
  const [savingWallpaper, setSavingWallpaper] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const filteredWallpapers = WALLPAPERS.filter((w) => {
    const catMatch = wallpaperCategory === 'all' || w.category === wallpaperCategory;
    const deityMatch = wallpaperDeity === 'all' || w.deity === wallpaperDeity;
    return catMatch && deityMatch;
  });

  const handleSaveWallpaper = async (wallpaper) => {
    setSavingWallpaper(true);
    const result = await saveWallpaperToGallery(wallpaper);
    setSaveMessage(result.message);
    setSavingWallpaper(false);
    setTimeout(() => setSaveMessage(''), 2000);
  };

  const handleShareWallpaper = async (wallpaper) => {
    await shareWallpaper(wallpaper);
  };

  const s = makeStyles(theme);

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ThemedText style={s.heading}>Seva</ThemedText>
        <ThemedText secondary style={s.subheading}>Share the divine with everyone</ThemedText>

        {/* Tab Switcher */}
        <View style={[s.tabSwitcher, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
          {['wallpapers', 'ringtones'].map((t) => (
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

        {activeTab === 'wallpapers' && (
          <View>
            {/* Category filter */}
            <View style={s.filterRow}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[s.filterChip, { backgroundColor: wallpaperCategory === c ? theme.primary : theme.surface2, borderColor: wallpaperCategory === c ? theme.primary : theme.border }]}
                  onPress={() => setWallpaperCategory(c)}
                >
                  <ThemedText style={{ fontSize: 12, fontWeight: '600', color: wallpaperCategory === c ? '#fff' : theme.text }}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            {/* Deity filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {DEITIES_FILTER.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[s.filterChip, { backgroundColor: wallpaperDeity === d ? theme.secondary : theme.surface2, borderColor: wallpaperDeity === d ? theme.secondary : theme.border }]}
                    onPress={() => setWallpaperDeity(d)}
                  >
                    <ThemedText style={{ fontSize: 12, fontWeight: '600', color: wallpaperDeity === d ? '#fff' : theme.text }}>
                      {d}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Wallpaper Grid */}
            <View style={s.wallpaperGrid}>
              {filteredWallpapers.map((w) => (
                <TouchableOpacity key={w.id} style={s.wallpaperCard} onPress={() => setSelectedWallpaper(w)}>
                  <View style={[s.wallpaperPreview, { backgroundColor: w.gradient[0] }]}>
                    <View style={[s.wallpaperCircle, { backgroundColor: w.color + '33' }]} />
                    <Ionicons name={`${w.icon}-outline`} size={32} color={w.color} style={{ zIndex: 1 }} />
                    <ThemedText style={s.wallpaperTitle}>{w.title}</ThemedText>
                    <View style={[s.categoryBadge, { backgroundColor: w.color + '44' }]}>
                      <ThemedText style={{ fontSize: 10, color: '#fff', fontWeight: '600' }}>{w.category}</ThemedText>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'ringtones' && (
          <ThemedCard style={s.comingSoon}>
            <Ionicons name="musical-note-outline" size={48} color={theme.textSecondary} />
            <ThemedText style={{ fontSize: 18, fontWeight: '700', marginTop: 12 }}>Coming Soon</ThemedText>
            <ThemedText secondary style={{ fontSize: 13, marginTop: 8, textAlign: 'center' }}>
              Devotional ringtones will be available in the next update.
            </ThemedText>
          </ThemedCard>
        )}

      </ScrollView>

      {/* Wallpaper Preview Modal */}
      <BottomSheet visible={!!selectedWallpaper} onClose={() => { setSelectedWallpaper(null); setSaveMessage(''); }}>
        {selectedWallpaper && (
          <View>
            <View style={[s.wallpaperPreviewLarge, { backgroundColor: selectedWallpaper.gradient[0] }]}>
              <View style={[s.wallpaperCircleLarge, { backgroundColor: selectedWallpaper.color + '33' }]} />
              <Ionicons name={`${selectedWallpaper.icon}-outline`} size={64} color={selectedWallpaper.color} style={{ zIndex: 1 }} />
              <ThemedText style={s.wallpaperPreviewTitle}>{selectedWallpaper.title}</ThemedText>
              <ThemedText style={s.wallpaperPreviewDeity}>{selectedWallpaper.deity}</ThemedText>
            </View>

            {saveMessage ? (
              <ThemedText style={[s.saveMessage, { color: theme.success }]}>{saveMessage}</ThemedText>
            ) : null}

            <View style={s.wallpaperActions}>
              <TouchableOpacity
                style={[s.wallpaperActionBtn, { backgroundColor: theme.primary }]}
                onPress={() => handleSaveWallpaper(selectedWallpaper)}
                disabled={savingWallpaper}
              >
                <Ionicons name="download-outline" size={20} color="#fff" />
                <ThemedText style={{ color: '#fff', fontWeight: '700' }}>
                  {savingWallpaper ? 'Saving...' : 'Save to Gallery'}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.wallpaperActionBtn, { backgroundColor: '#25D366' }]}
                onPress={() => handleShareWallpaper(selectedWallpaper)}
              >
                <Ionicons name="share-social-outline" size={20} color="#fff" />
                <ThemedText style={{ color: '#fff', fontWeight: '700' }}>Share to WhatsApp</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
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
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  wallpaperGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  wallpaperCard: { width: '47%' },
  wallpaperPreview: { borderRadius: 16, height: 180, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', padding: 12 },
  wallpaperCircle: { position: 'absolute', width: 120, height: 120, borderRadius: 60, top: 20 },
  wallpaperTitle: { color: '#fff', fontSize: 13, fontWeight: '700', marginTop: 8, textAlign: 'center', zIndex: 1 },
  categoryBadge: { marginTop: 6, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  wallpaperPreviewLarge: { borderRadius: 20, height: 240, justifyContent: 'center', alignItems: 'center', marginBottom: 16, overflow: 'hidden' },
  wallpaperCircleLarge: { position: 'absolute', width: 200, height: 200, borderRadius: 100 },
  wallpaperPreviewTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 12, zIndex: 1 },
  wallpaperPreviewDeity: { color: '#ffffff99', fontSize: 14, marginTop: 4, zIndex: 1 },
  saveMessage: { textAlign: 'center', fontWeight: '600', marginBottom: 8 },
  wallpaperActions: { gap: 10 },
  wallpaperActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, padding: 14 },
  comingSoon: { alignItems: 'center', paddingVertical: 48, marginTop: 16 },
});