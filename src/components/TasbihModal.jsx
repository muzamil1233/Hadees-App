import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Vibration,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const DHIKR_ITEMS = [
  { id: '1', arabic: 'سُبْحَانَ اللَّهِ', english: 'SubhanAllah', meaning: 'Glory be to Allah', target: 33 },
  { id: '2', arabic: 'الْحَمْدُ لِلَّهِ', english: 'Alhamdulillah', meaning: 'Praise be to Allah', target: 33 },
  { id: '3', arabic: 'اللَّهُ أَكْبَرُ', english: 'Allahu Akbar', meaning: 'Allah is the Greatest', target: 34 },
  { id: '4', arabic: 'أَسْتَغْفِرُ اللَّهَ', english: 'Astaghfirullah', meaning: 'I seek forgiveness from Allah', target: 100 },
  { id: '5', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ', english: 'La ilaha illa Allah', meaning: 'There is no god but Allah', target: 100 },
];

export default function TasbihModal({ visible, onClose }) {
  const [selectedDhikr, setSelectedDhikr] = useState(DHIKR_ITEMS[0]);
  const [count, setCount] = useState(0);

  const handleIncrement = () => {
    const next = count + 1;
    setCount(next);

    if (Platform.OS !== 'web') {
      if (next === selectedDhikr.target) {
        Vibration.vibrate([0, 50, 50, 50]);
      } else {
        Vibration.vibrate(15);
      }
    }
  };

  const handleReset = () => {
    setCount(0);
  };

  const handleSelectDhikr = (item) => {
    setSelectedDhikr(item);
    setCount(0);
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
              <Text style={styles.title}>المسبحة الإلكترونية</Text>
              <Text style={styles.subtitle}>Digital Tasbih Counter</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Dhikr Selector Tabs */}
          <View style={styles.dhikrTabs}>
            {DHIKR_ITEMS.map((item) => {
              const active = item.id === selectedDhikr.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.dhikrTab, active && styles.dhikrTabActive]}
                  onPress={() => handleSelectDhikr(item)}
                >
                  <Text
                    style={[
                      styles.dhikrTabText,
                      active && styles.dhikrTabTextActive,
                    ]}
                  >
                    {item.english}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Main Counter Display */}
          <View style={styles.displayArea}>
            <Text style={styles.arabicDhikr}>{selectedDhikr.arabic}</Text>
            <Text style={styles.meaningText}>{'"'}{selectedDhikr.meaning}{'"'}</Text>

            {/* Tap Circle Button */}
            <TouchableOpacity
              style={styles.tapCircle}
              activeOpacity={0.7}
              onPress={handleIncrement}
            >
              <Text style={styles.countNumber}>{count}</Text>
              <Text style={styles.targetLabel}>Target: {selectedDhikr.target}</Text>
              <Text style={styles.tapHint}>TAP HERE</Text>
            </TouchableOpacity>

            {/* Reset Button */}
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Ionicons name="refresh" size={16} color={colors.textSecondary} />
              <Text style={styles.resetBtnText}>Reset Counter</Text>
            </TouchableOpacity>
          </View>
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
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.goldLight,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dhikrTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  dhikrTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dhikrTabActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: colors.gold,
  },
  dhikrTabText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  dhikrTabTextActive: {
    color: colors.goldLight,
    fontWeight: '700',
  },
  displayArea: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  arabicDhikr: {
    fontSize: 28,
    color: colors.goldLight,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  meaningText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 24,
    textAlign: 'center',
  },
  tapCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: colors.background,
    borderWidth: 4,
    borderColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  countNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  targetLabel: {
    fontSize: 12,
    color: colors.goldDark,
    marginTop: 2,
  },
  tapHint: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 6,
    letterSpacing: 1,
    fontWeight: '600',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  resetBtnText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});
