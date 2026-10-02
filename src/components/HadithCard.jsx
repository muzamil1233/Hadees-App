import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function HadithCard({
  hadith,
  isBookmarked = false,
  onToggleBookmark,
  onOpenDetails,
  arabicFontSize = 24,
  urduFontSize = 18,
  englishFontSize = 15,
  showActions = true,
  onCopySuccess,
}) {
  const [langView, setLangView] = useState('both'); // 'both' | 'urdu' | 'english'

  if (!hadith) return null;

  const handleShare = async () => {
    try {
      const urduSection = hadith.urdu ? `🇵🇰 اردو ترجمہ:\n${hadith.urdu}\n\n` : '';
      const message = `✨ ${hadith.bookName} (Hadith #${hadith.hadithNumber})\n\n` +
        `📖 Arabic:\n${hadith.arabic}\n\n` +
        urduSection +
        `🌍 English:\n${hadith.english}\n\n` +
        `Grade: ${hadith.grade || 'Authentic'}\n` +
        `Shared from Muzamil Hadith Explorer (جامع مزمل للحديث)`;

      await Share.share({
        message,
        title: `${hadith.bookName} #${hadith.hadithNumber}`,
      });
    } catch (e) {
      console.warn('Share error', e);
    }
  };

  const handleCopy = async () => {
    try {
      const urduPart = hadith.urdu ? `\n\n[اردو ترجمہ]\n${hadith.urdu}` : '';
      const textToCopy = `${hadith.bookName} - Hadith #${hadith.hadithNumber}\n\n` +
        `[العربية]\n${hadith.arabic}${urduPart}\n\n` +
        `[English]\n${hadith.english}\n\n` +
        `Grade: ${hadith.grade || 'Authentic'}\n` +
        `Muzamil Hadith Explorer`;

      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(textToCopy);
      }
      if (onCopySuccess) {
        onCopySuccess();
      }
    } catch (e) {
      console.warn('Copy error', e);
    }
  };

  return (
    <View style={[styles.cardContainer, hadith.isDirectMatch && styles.cardContainerDirect]}>
      {/* Direct Search Match Header */}
      {hadith.isDirectMatch && (
        <View style={styles.directMatchHeader}>
          <Ionicons name="checkmark-circle" size={15} color={colors.gold} />
          <Text style={styles.directMatchText}>Exact Book & Hadith Number Match</Text>
        </View>
      )}

      {/* Top Meta Header */}
      <View style={styles.topRow}>
        <View style={styles.badgeGroup}>
          <View style={styles.bookBadge}>
            <Text style={styles.bookBadgeText}>{hadith.bookName}</Text>
          </View>

          <View style={styles.numberBadge}>
            <Text style={styles.numberBadgeText}>#{hadith.hadithNumber}</Text>
          </View>
        </View>

        {hadith.grade ? (
          <View
            style={[
              styles.gradeBadge,
              { backgroundColor: hadith.gradeColor || colors.emerald },
            ]}
          >
            <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.gradeBadgeText}>{hadith.grade}</Text>
          </View>
        ) : null}
      </View>

      {/* Section/Chapter tag if present */}
      {hadith.sectionName ? (
        <View style={styles.sectionRow}>
          <Ionicons name="bookmarks-outline" size={13} color={colors.goldDark} />
          <Text style={styles.sectionText} numberOfLines={1}>
            {hadith.sectionName}
          </Text>
        </View>
      ) : null}

      {/* Narrator Isnad */}
      {hadith.narrator ? (
        <View style={styles.narratorBox}>
          <Text style={styles.narratorText}>{hadith.narrator}</Text>
        </View>
      ) : null}

      {/* Arabic Text (RTL) */}
      <View style={styles.arabicWrapper}>
        <Text
          style={[
            styles.arabicText,
            {
              fontSize: arabicFontSize,
              lineHeight: arabicFontSize * 1.7,
            },
          ]}
          selectable
        >
          {hadith.arabic}
        </Text>
      </View>

      {/* Language View Selector */}
      {hadith.urdu ? (
        <View style={styles.langSelectorRow}>
          <TouchableOpacity
            style={[styles.langChip, langView === 'both' && styles.langChipActive]}
            onPress={() => setLangView('both')}
          >
            <Text style={[styles.langChipText, langView === 'both' && styles.langChipTextActive]}>
              Both (دونوں)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langChip, langView === 'urdu' && styles.langChipActive]}
            onPress={() => setLangView('urdu')}
          >
            <Text style={[styles.langChipText, langView === 'urdu' && styles.langChipTextActive]}>
              اردو (Urdu)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langChip, langView === 'english' && styles.langChipActive]}
            onPress={() => setLangView('english')}
          >
            <Text style={[styles.langChipText, langView === 'english' && styles.langChipTextActive]}>
              English
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.cardDivider} />

      {/* Urdu Translation */}
      {hadith.urdu && (langView === 'both' || langView === 'urdu') && (
        <View style={styles.urduWrapper}>
          <View style={styles.langHeadingRow}>
            <View style={styles.urduBadgeTag}>
              <Text style={styles.urduBadgeTagText}>اردو ترجمہ</Text>
            </View>
            <Text style={styles.langSubtitle}>Urdu Translation</Text>
          </View>
          <Text
            style={[
              styles.urduText,
              {
                fontSize: urduFontSize,
                lineHeight: urduFontSize * 1.8,
              },
            ]}
            selectable
          >
            {hadith.urdu}
          </Text>
        </View>
      )}

      {/* Divider between Urdu and English if both are shown */}
      {hadith.urdu && langView === 'both' && hadith.english && (
        <View style={styles.subDivider} />
      )}

      {/* English Translation */}
      {hadith.english && (langView === 'both' || langView === 'english') && (
        <View style={styles.englishWrapper}>
          <View style={styles.langHeadingRow}>
            <View style={styles.englishBadgeTag}>
              <Text style={styles.englishBadgeTagText}>English</Text>
            </View>
            <Text style={styles.langSubtitle}>Translation</Text>
          </View>
          <Text
            style={[
              styles.englishText,
              {
                fontSize: englishFontSize,
                lineHeight: englishFontSize * 1.55,
              },
            ]}
            selectable
          >
            {hadith.english}
          </Text>
        </View>
      )}

      {/* Action Footer */}
      {showActions && (
        <View style={styles.actionFooter}>
          <View style={styles.leftActions}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                isBookmarked && styles.actionBtnActive,
              ]}
              onPress={() => onToggleBookmark && onToggleBookmark(hadith)}
              accessibilityLabel="Bookmark Hadith"
            >
              <Ionicons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color={isBookmarked ? colors.gold : colors.textSecondary}
              />
              <Text
                style={[
                  styles.actionBtnText,
                  isBookmarked && { color: colors.gold, fontWeight: '700' },
                ]}
              >
                {isBookmarked ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleShare}
              accessibilityLabel="Share Hadith"
            >
              <Ionicons name="share-social-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.actionBtnText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleCopy}
              accessibilityLabel="Copy Hadith Text"
            >
              <Ionicons name="copy-outline" size={17} color={colors.textSecondary} />
              <Text style={styles.actionBtnText}>Copy</Text>
            </TouchableOpacity>
          </View>

          {onOpenDetails && (
            <TouchableOpacity
              style={styles.detailsBtn}
              onPress={() => onOpenDetails(hadith)}
              accessibilityLabel="Open Details"
            >
              <Ionicons name="expand" size={15} color={colors.gold} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  cardContainerDirect: {
    borderColor: colors.gold,
    backgroundColor: '#14332B',
    borderWidth: 1.5,
  },
  directMatchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  directMatchText: {
    color: colors.goldLight,
    fontSize: 12,
    fontWeight: '700',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 6,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  bookBadgeText: {
    color: colors.goldLight,
    fontSize: 12,
    fontWeight: '700',
  },
  numberBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  numberBadgeText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  gradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gradeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionText: {
    color: colors.goldDark,
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  narratorBox: {
    backgroundColor: 'rgba(11, 30, 25, 0.7)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.gold,
  },
  narratorText: {
    color: colors.goldLight,
    fontSize: 12,
    fontStyle: 'italic',
    fontWeight: '600',
  },
  arabicWrapper: {
    marginVertical: 4,
    paddingHorizontal: 4,
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
    fontWeight: '500',
  },
  langSelectorRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  langChip: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  langChipActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: colors.gold,
  },
  langChipText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  langChipTextActive: {
    color: colors.goldLight,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 10,
  },
  subDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 10,
  },
  langHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  urduBadgeTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  urduBadgeTagText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  englishBadgeTag: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  englishBadgeTagText: {
    color: colors.goldLight,
    fontSize: 11,
    fontWeight: '700',
  },
  langSubtitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  urduWrapper: {
    backgroundColor: 'rgba(6, 95, 70, 0.15)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
    borderRightWidth: 3,
    borderRightColor: colors.emerald,
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
    fontWeight: '400',
  },
  englishWrapper: {
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  englishText: {
    color: colors.textSecondary,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  actionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  leftActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  actionBtnActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  actionBtnText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  detailsBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

