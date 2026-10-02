import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function SectionModal({
  visible,
  book,
  sections = [],
  loading = false,
  selectedSectionId,
  onSelectSection,
  onClose,
}) {
  const [filterText, setFilterText] = useState('');

  if (!book) return null;

  const filteredSections = sections.filter((sec) => {
    if (!filterText) return true;
    return sec.name.toLowerCase().includes(filterText.toLowerCase()) ||
      String(sec.number).includes(filterText);
  });

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
            <View style={styles.headerTitleBox}>
              <Text style={styles.bookTitle}>{book.nameEnglish}</Text>
              <Text style={styles.subtitle}>Select Chapter / Kitab</Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Search Filter */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={17} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Search chapters (e.g. Faith, Prayer)..."
              placeholderTextColor={colors.textMuted}
              value={filterText}
              onChangeText={setFilterText}
            />
            {filterText.length > 0 && (
              <TouchableOpacity onPress={() => setFilterText('')}>
                <Ionicons name="close-circle" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Sections List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.gold} />
              <Text style={styles.loadingText}>Loading Chapters...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredSections}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const isSelected = String(item.id) === String(selectedSectionId);
                return (
                  <TouchableOpacity
                    style={[
                      styles.sectionItem,
                      isSelected && styles.sectionItemSelected,
                    ]}
                    onPress={() => {
                      onSelectSection(item);
                      onClose();
                    }}
                  >
                    <View style={styles.numberBadge}>
                      <Text style={styles.numberText}>{item.number}</Text>
                    </View>

                    <View style={styles.sectionInfo}>
                      <Text
                        style={[
                          styles.sectionName,
                          isSelected && { color: colors.goldLight, fontWeight: '700' },
                        ]}
                      >
                        {item.name}
                      </Text>
                      {item.hadithCount ? (
                        <Text style={styles.hadithCountText}>
                          {item.hadithCount} Hadiths
                        </Text>
                      ) : null}
                    </View>

                    <Ionicons
                      name={isSelected ? 'checkmark-circle' : 'chevron-forward'}
                      size={18}
                      color={isSelected ? colors.gold : colors.textMuted}
                    />
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No chapters found</Text>
                </View>
              }
            />
          )}
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
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  headerTitleBox: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.goldLight,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 42,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: 8,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 12,
  },
  sectionItemSelected: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    color: colors.goldLight,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionInfo: {
    flex: 1,
  },
  sectionName: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  hadithCountText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 12,
    fontSize: 13,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
