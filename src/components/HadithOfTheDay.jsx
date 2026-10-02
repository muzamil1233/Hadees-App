import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function HadithOfTheDay({
  hadith,
  onPress,
  isBookmarked,
  onToggleBookmark,
}) {
  if (!hadith) return null;

  return (
    <View style={styles.container}>
      {/* Top Banner */}
      <View style={styles.bannerRow}>
        <View style={styles.tag}>
          <Ionicons name="sparkles" size={13} color={colors.gold} />
          <Text style={styles.tagText}>Hadith of the Day</Text>
        </View>

        <TouchableOpacity
          style={styles.bookmarkBtn}
          onPress={() => onToggleBookmark && onToggleBookmark(hadith)}
        >
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={isBookmarked ? colors.gold : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Book & Hadith Number */}
      <View style={styles.metaRow}>
        <Text style={styles.bookTitle}>{hadith.bookName}</Text>
        <Text style={styles.hadithRef}>#{hadith.hadithNumber}</Text>
      </View>

      {/* Topic */}
      {hadith.topic ? (
        <View style={styles.topicBadge}>
          <Text style={styles.topicText}>Topic: {hadith.topic}</Text>
        </View>
      ) : null}

      {/* Arabic snippet */}
      <Text style={styles.arabicSnippet} numberOfLines={2}>
        {hadith.arabic}
      </Text>

      {/* English snippet */}
      <Text style={styles.englishSnippet} numberOfLines={3}>
        {hadith.english}
      </Text>

      {/* Read Full Button */}
      <TouchableOpacity
        style={styles.readButton}
        activeOpacity={0.8}
        onPress={() => onPress && onPress(hadith)}
      >
        <Text style={styles.readButtonText}>Read Full Hadith</Text>
        <Ionicons name="arrow-forward" size={15} color={colors.background} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  bannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  tagText: {
    color: colors.goldLight,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  bookmarkBtn: {
    padding: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.goldLight,
  },
  hadithRef: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  topicBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 10,
  },
  topicText: {
    color: colors.emerald,
    fontSize: 11,
    fontWeight: '600',
  },
  arabicSnippet: {
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: 8,
    lineHeight: 28,
  },
  englishSnippet: {
    fontSize: 13.5,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.gold,
    paddingVertical: 10,
    borderRadius: 12,
  },
  readButtonText: {
    color: colors.background,
    fontSize: 13.5,
    fontWeight: '700',
  },
});
