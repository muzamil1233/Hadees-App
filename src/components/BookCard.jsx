import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function BookCard({ book, onSelectBook }) {
  if (!book) return null;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => onSelectBook(book)}
    >
      {/* Decorative Golden Left Border */}
      <View style={[styles.colorAccent, { backgroundColor: book.color || colors.gold }]} />

      <View style={styles.content}>
        {/* Top: Arabic Title + Icon */}
        <View style={styles.topRow}>
          <View style={styles.iconCircle}>
            <FontAwesome5 name="quran" size={16} color={colors.gold} />
          </View>
          <Text style={styles.arabicName}>{book.nameArabic}</Text>
        </View>

        {/* English Title & Author */}
        <Text style={styles.englishName}>{book.nameEnglish}</Text>
        <Text style={styles.authorName}>{book.author}</Text>

        {/* Footer with stats */}
        <View style={styles.footerRow}>
          <View style={styles.statsBadge}>
            <Ionicons name="document-text-outline" size={12} color={colors.goldLight} />
            <Text style={styles.statsText}>{book.totalHadith.toLocaleString()} Hadiths</Text>
          </View>

          {book.hasSections && (
            <View style={styles.sectionsBadge}>
              <Ionicons name="folder-open-outline" size={12} color={colors.textSecondary} />
              <Text style={styles.sectionsText}>{book.sectionsCount} Chapters</Text>
            </View>
          )}

          <View style={styles.arrowCircle}>
            <Ionicons name="chevron-forward" size={14} color={colors.gold} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  colorAccent: {
    width: 6,
  },
  content: {
    flex: 1,
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arabicName: {
    fontSize: 20,
    color: colors.goldLight,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  englishName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
  },
  authorName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  statsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statsText: {
    color: colors.goldLight,
    fontSize: 11,
    fontWeight: '600',
  },
  sectionsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sectionsText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  arrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
