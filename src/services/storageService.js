import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = '@nur_hadith_bookmarks_v1';
const SETTINGS_KEY = '@nur_hadith_settings_v1';
const CACHE_PREFIX = '@nur_hadith_cache_';
const RECENT_KEY = '@nur_hadith_recent_v1';

export const storageService = {
  // --- Bookmarks ---
  async getBookmarks() {
    try {
      const data = await AsyncStorage.getItem(BOOKMARKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading bookmarks', e);
      return [];
    }
  },

  async toggleBookmark(hadith) {
    try {
      const current = await this.getBookmarks();
      const existsIndex = current.findIndex((item) => item.id === hadith.id);
      let updated;
      let isSaved = false;

      if (existsIndex >= 0) {
        updated = current.filter((item) => item.id !== hadith.id);
        isSaved = false;
      } else {
        const enriched = {
          ...hadith,
          savedAt: new Date().toISOString(),
        };
        updated = [enriched, ...current];
        isSaved = true;
      }

      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
      return { isSaved, bookmarks: updated };
    } catch (e) {
      console.error('Error toggling bookmark', e);
      return { isSaved: false, bookmarks: [] };
    }
  },

  async isBookmarked(hadithId) {
    try {
      const current = await this.getBookmarks();
      return current.some((item) => item.id === hadithId);
    } catch (_e) {
      return false;
    }
  },

  // --- Settings ---
  async getSettings() {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error loading settings', e);
    }
    return {
      arabicFontSize: 24,
      urduFontSize: 18,
      englishFontSize: 16,
      showArabic: true,
      showUrdu: true,
      showEnglish: true,
      hapticFeedback: true,
    };
  },

  async saveSettings(settings) {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings', e);
    }
  },

  // --- Offline Section Cache ---
  async getCachedSection(bookId, sectionId) {
    try {
      const key = `${CACHE_PREFIX}${bookId}_${sectionId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (_e) {
      return null;
    }
  },

  async cacheSection(bookId, sectionId, hadiths) {
    try {
      const key = `${CACHE_PREFIX}${bookId}_${sectionId}`;
      await AsyncStorage.setItem(key, JSON.stringify(hadiths));
    } catch (e) {
      console.error('Error caching section', e);
    }
  },

  // --- Recent Reads ---
  async getRecentReads() {
    try {
      const data = await AsyncStorage.getItem(RECENT_KEY);
      return data ? JSON.parse(data) : [];
    } catch (_e) {
      return [];
    }
  },

  async addRecentRead(hadith) {
    try {
      const current = await this.getRecentReads();
      const filtered = current.filter((h) => h.id !== hadith.id);
      const updated = [hadith, ...filtered].slice(0, 10);
      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error updating recent reads', e);
    }
  },
};
