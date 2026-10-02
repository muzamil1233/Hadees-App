import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function HadithDetailModal({
  visible,
  hadith,
  isBookmarked,
  onToggleBookmark,
  onClose,
  initialArabicFontSize = 26,
  initialUrduFontSize = 20,
  initialEnglishFontSize = 16,
}) {
  const [arabicSize, setArabicSize] = useState(initialArabicFontSize);
  const [urduSize, setUrduSize] = useState(initialUrduFontSize);
  const [englishSize, setEnglishSize] = useState(initialEnglishFontSize);
  const [langFilter, setLangFilter] = useState('all'); // 'all' | 'urdu' | 'english'

  if (!hadith) return null;

  const handleShare = async () => {
    try {
      const urduSection = hadith.urdu ? `🇵🇰 اردو ترجمہ:\n${hadith.urdu}\n\n` : '';
      const message = `✨ ${hadith.bookName} (Hadith #${hadith.hadithNumber})\n\n` +
        `📖 Arabic:\n${hadith.arabic}\n\n` +
        urduSection +
        `🌍 English:\n${hadith.english}\n\n` +
        `Grade: ${hadith.grade || 'Authentic'}\n` +
        `From Muzamil Hadith Explorer (جامع مزمل للحديث)`;

      await Share.share({ message });
    } catch (e) {
      console.warn('Share error', e);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Top Navbar */}
        <View style={styles.navbar}>
          <TouchableOpacity style={styles.navBtn} onPress={onClose}>
            <Ionicons name="arrow-back" size={22} color={colors.goldLight} />
          </TouchableOpacity>

          <View style={styles.navTitleBox}>
            <Text style={styles.navTitle}>{hadith.bookName}</Text>
            <Text style={styles.navSubtitle}>Hadith #{hadith.hadithNumber}</Text>
          </View>

          <View style={styles.navActions}>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => onToggleBookmark && onToggleBookmark(hadith)}
            >
              <Ionicons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={isBookmarked ? colors.gold : colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.navBtn} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Reader Controls Banner (Font Size +/-) */}
        <View style={styles.controlsBar}>
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Arabic:</Text>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setArabicSize((s) => Math.max(18, s - 2))}
            >
              <Text style={styles.stepBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.sizeIndicator}>{arabicSize}</Text>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setArabicSize((s) => Math.min(38, s + 2))}
            >
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {hadith.urdu ? (
            <View style={styles.controlGroup}>
              <Text style={styles.controlLabel}>اردو:</Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setUrduSize((s) => Math.max(14, s - 1))}
              >
                <Text style={styles.stepBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.sizeIndicator}>{urduSize}</Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setUrduSize((s) => Math.min(30, s + 1))}
              >
                <Text style={styles.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>English:</Text>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setEnglishSize((s) => Math.max(13, s - 1))}
            >
              <Text style={styles.stepBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.sizeIndicator}>{englishSize}</Text>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setEnglishSize((s) => Math.min(24, s + 1))}
            >
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Language View Toggle Bar if Urdu exists */}
        {hadith.urdu ? (
          <View style={styles.viewToggleBar}>
            <TouchableOpacity
              style={[styles.viewTab, langFilter === 'all' && styles.viewTabActive]}
              onPress={() => setLangFilter('all')}
            >
              <Text style={[styles.viewTabText, langFilter === 'all' && styles.viewTabTextActive]}>
                All (الكل / دونوں)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.viewTab, langFilter === 'urdu' && styles.viewTabActive]}
              onPress={() => setLangFilter('urdu')}
            >
              <Text style={[styles.viewTabText, langFilter === 'urdu' && styles.viewTabTextActive]}>
                اردو ترجمہ (Urdu)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.viewTab, langFilter === 'english' && styles.viewTabActive]}
              onPress={() => setLangFilter('english')}
            >
              <Text style={[styles.viewTabText, langFilter === 'english' && styles.viewTabTextActive]}>
                English Only
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Scrollable Reader */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Metadata Banner */}
          <View style={styles.metaCard}>
            <View style={styles.metaRow}>
              <View style={styles.metaBadge}>
                <Ionicons name="book" size={13} color={colors.goldLight} />
                <Text style={styles.metaBadgeText}>{hadith.bookName}</Text>
              </View>

              {hadith.grade ? (
                <View
                  style={[
                    styles.gradeBadge,
                    { backgroundColor: hadith.gradeColor || colors.emerald },
                  ]}
                >
                  <Text style={styles.gradeBadgeText}>{hadith.grade}</Text>
                </View>
              ) : null}
            </View>

            {hadith.sectionName ? (
              <Text style={styles.chapterTitle}>{hadith.sectionName}</Text>
            ) : null}

            {hadith.narrator ? (
              <View style={styles.narratorCard}>
                <Ionicons name="person-outline" size={14} color={colors.gold} />
                <Text style={styles.narratorText}>{hadith.narrator}</Text>
              </View>
            ) : null}
          </View>

          {/* Arabic Text (Always displayed unless user toggles off) */}
          <View style={styles.arabicSection}>
            <Text style={styles.languageLabel}>Arabic Text (النص العربي)</Text>
            <Text
              style={[
                styles.arabicText,
                { fontSize: arabicSize, lineHeight: arabicSize * 1.75 },
              ]}
              selectable
            >
              {hadith.arabic}
            </Text>
          </View>

          {/* Urdu Translation */}
          {hadith.urdu && (langFilter === 'all' || langFilter === 'urdu') && (
            <View>
              <View style={styles.ornamentDivider}>
                <View style={styles.ornamentLine} />
                <Ionicons name="moon-outline" size={16} color={colors.gold} />
                <View style={styles.ornamentLine} />
              </View>

              <View style={styles.urduSection}>
                <View style={styles.langBadgeRow}>
                  <View style={styles.urduBadge}>
                    <Text style={styles.urduBadgeText}>اردو ترجمہ</Text>
                  </View>
                  <Text style={styles.languageLabel}>Urdu Translation</Text>
                </View>
                <Text
                  style={[
                    styles.urduText,
                    { fontSize: urduSize, lineHeight: urduSize * 1.85 },
                  ]}
                  selectable
                >
                  {hadith.urdu}
                </Text>
              </View>
            </View>
          )}

          {/* English Translation */}
          {hadith.english && (langFilter === 'all' || langFilter === 'english') && (
            <View>
              <View style={styles.ornamentDivider}>
                <View style={styles.ornamentLine} />
                <Ionicons name="flower-outline" size={16} color={colors.goldDark} />
                <View style={styles.ornamentLine} />
              </View>

              <View style={styles.englishSection}>
                <View style={styles.langBadgeRow}>
                  <View style={styles.englishBadge}>
                    <Text style={styles.englishBadgeText}>English</Text>
                  </View>
                  <Text style={styles.languageLabel}>English Translation</Text>
                </View>
                <Text
                  style={[
                    styles.englishText,
                    { fontSize: englishSize, lineHeight: englishSize * 1.6 },
                  ]}
                  selectable
                >
                  {hadith.english}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  navbar: {
    paddingTop: Platform.OS === 'android' ? 36 : 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitleBox: {
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.goldLight,
  },
  navSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  navActions: {
    flexDirection: 'row',
    gap: 8,
  },
  controlsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(19, 43, 37, 0.95)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  controlGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  controlLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  stepBtn: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  stepBtnText: {
    color: colors.goldLight,
    fontSize: 11,
    fontWeight: 'bold',
  },
  sizeIndicator: {
    color: colors.textPrimary,
    fontSize: 11,
    minWidth: 16,
    textAlign: 'center',
  },
  viewToggleBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(11, 30, 25, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
    gap: 8,
  },
  viewTab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  viewTabActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: colors.gold,
  },
  viewTabText: {
    color: colors.textMuted,
    fontSize: 11.5,
    fontWeight: '600',
  },
  viewTabTextActive: {
    color: colors.goldLight,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  metaCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaBadgeText: {
    color: colors.goldLight,
    fontSize: 13,
    fontWeight: '700',
  },
  gradeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gradeBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  chapterTitle: {
    fontSize: 14,
    color: colors.goldDark,
    fontWeight: '600',
    marginTop: 4,
  },
  narratorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  narratorText: {
    color: colors.goldLight,
    fontSize: 13,
    fontStyle: 'italic',
  },
  arabicSection: {
    marginBottom: 10,
  },
  langBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  urduBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  urduBadgeText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  englishBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  englishBadgeText: {
    color: colors.goldLight,
    fontSize: 11,
    fontWeight: '700',
  },
  languageLabel: {
    fontSize: 12,
    color: colors.goldDark,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  arabicText: {
    color: colors.textPrimary,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: Platform.select({
      ios: 'Geeza Pro',
      android: 'serif',
      default: 'system-ui, serif',
    }),
  },
  urduSection: {
    backgroundColor: 'rgba(6, 95, 70, 0.18)',
    borderRadius: 14,
    padding: 14,
    borderRightWidth: 3,
    borderRightColor: colors.emerald,
    marginBottom: 10,
  },
  urduText: {
    color: '#E2F1EC',
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: Platform.select({
      ios: 'Geeza Pro',
      android: 'serif',
      default: 'system-ui, serif',
    }),
  },
  ornamentDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
    gap: 12,
  },
  ornamentLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
  },
  englishSection: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  englishText: {
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
});
