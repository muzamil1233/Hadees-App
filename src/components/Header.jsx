import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function Header({
  title = 'جامع مزمل للحديث',
  subtitle = 'Muzamil Hadith Explorer',
  onOpenSettings,
  onOpenTasbih,
  onOpenSearch,
}) {
  return (
    <View style={styles.container}>
      {/* Background Islamic Top Accent */}
      <View style={styles.topAccentBar} />

      <View style={styles.headerContent}>
        {/* Left Islamic Icon & Title */}
        <View style={styles.titleContainer}>
          <View style={styles.crescentBadge}>
            <Ionicons name="moon" size={20} color={colors.gold} />
          </View>
          <View style={styles.textColumn}>
            <Text style={styles.arabicTitle}>{title}</Text>
            <Text style={styles.englishSubtitle}>{subtitle}</Text>
          </View>
        </View>

        {/* Right Action Icons */}
        <View style={styles.actionRow}>
          {onOpenTasbih && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onOpenTasbih}
              accessibilityLabel="Tasbih Counter"
            >
              <FontAwesome5 name="pray" size={17} color={colors.gold} />
            </TouchableOpacity>
          )}

          {onOpenSearch && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onOpenSearch}
              accessibilityLabel="Search Hadith"
            >
              <Ionicons name="search" size={20} color={colors.gold} />
            </TouchableOpacity>
          )}

          {onOpenSettings && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onOpenSettings}
              accessibilityLabel="Display Settings"
            >
              <Ionicons name="text" size={19} color={colors.gold} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Subtle Gold Divider */}
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 36 : 14,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  topAccentBar: {
    height: 3,
    backgroundColor: colors.gold,
    borderRadius: 2,
    opacity: 0.8,
    marginBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  crescentBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textColumn: {
    justifyContent: 'center',
  },
  arabicTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.goldLight,
    letterSpacing: 0.5,
  },
  englishSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginTop: 12,
  },
});
