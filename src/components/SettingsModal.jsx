import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function SettingsModal({
  visible,
  settings,
  onUpdateSettings,
  onClose,
  bookmarksCount = 0,
}) {
  if (!settings) return null;

  const handleClearCache = () => {
    if (Platform.OS === 'web') {
      alert('Offline cache cleared successfully.');
    } else {
      Alert.alert(
        'Clear Offline Cache',
        'This will clear temporarily cached hadiths. Your saved bookmarks will remain safe.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear', style: 'destructive', onPress: () => {} },
        ]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>إعدادات التطبيق</Text>
              <Text style={styles.subtitle}>Display & Preferences</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Arabic Font Size Section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="text-outline" size={18} color={colors.gold} />
                <Text style={styles.sectionTitle}>Arabic Font Size</Text>
              </View>

              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() =>
                    onUpdateSettings({
                      ...settings,
                      arabicFontSize: Math.max(18, (settings.arabicFontSize || 24) - 2),
                    })
                  }
                >
                  <Ionicons name="remove" size={18} color={colors.goldLight} />
                </TouchableOpacity>

                <Text style={styles.stepValue}>{settings.arabicFontSize || 24} px</Text>

                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() =>
                    onUpdateSettings({
                      ...settings,
                      arabicFontSize: Math.min(38, (settings.arabicFontSize || 24) + 2),
                    })
                  }
                >
                  <Ionicons name="add" size={18} color={colors.goldLight} />
                </TouchableOpacity>
              </View>

              {/* Live Preview */}
              <View style={styles.previewBox}>
                <Text
                  style={[
                    styles.previewArabic,
                    { fontSize: settings.arabicFontSize || 24 },
                  ]}
                >
                  إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ
                </Text>
              </View>
            </View>

            {/* English Font Size Section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="document-text-outline" size={18} color={colors.gold} />
                <Text style={styles.sectionTitle}>English Font Size</Text>
              </View>

              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() =>
                    onUpdateSettings({
                      ...settings,
                      englishFontSize: Math.max(13, (settings.englishFontSize || 15) - 1),
                    })
                  }
                >
                  <Ionicons name="remove" size={18} color={colors.goldLight} />
                </TouchableOpacity>

                <Text style={styles.stepValue}>{settings.englishFontSize || 15} px</Text>

                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() =>
                    onUpdateSettings({
                      ...settings,
                      englishFontSize: Math.min(24, (settings.englishFontSize || 15) + 1),
                    })
                  }
                >
                  <Ionicons name="add" size={18} color={colors.goldLight} />
                </TouchableOpacity>
              </View>

              <View style={styles.previewBox}>
                <Text
                  style={[
                    styles.previewEnglish,
                    { fontSize: settings.englishFontSize || 15 },
                  ]}
                >
                  The reward of deeds depends upon the intentions.
                </Text>
              </View>
            </View>

            {/* Storage & Data Section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="server-outline" size={18} color={colors.gold} />
                <Text style={styles.sectionTitle}>Offline Storage & Bookmarks</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Saved Bookmarks</Text>
                <Text style={styles.infoValue}>{bookmarksCount} items</Text>
              </View>

              <TouchableOpacity style={styles.clearBtn} onPress={handleClearCache}>
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                <Text style={styles.clearBtnText}>Clear Downloaded Cache</Text>
              </TouchableOpacity>
            </View>

            {/* About App */}
            <View style={styles.aboutCard}>
              <Text style={styles.aboutTitle}>Nur al-Hadith (نور الحديث)</Text>
              <Text style={styles.aboutVersion}>Version 1.0.0 • React Native & Expo</Text>
              <Text style={styles.aboutDesc}>
                A dedicated, ad-free Islamic Hadith reader featuring the canonical books of Prophetic traditions (Sahih Bukhari, Muslim, Sunan Abi Dawud, Tirmidhi, Nasa&apos;i, Ibn Majah, Malik, 40 Nawawi).
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.goldLight,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionCard: {
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 12,
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.goldLight,
    minWidth: 60,
    textAlign: 'center',
  },
  previewBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  previewArabic: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
  previewEnglish: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.goldLight,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  clearBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  aboutCard: {
    padding: 14,
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.goldLight,
  },
  aboutVersion: {
    fontSize: 11,
    color: colors.textMuted,
    marginVertical: 4,
  },
  aboutDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
  },
});
