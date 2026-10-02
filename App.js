import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from './src/theme/colors';
import Header from './src/components/Header';
import HadithCard from './src/components/HadithCard';
import BookCard from './src/components/BookCard';
import HadithOfTheDay from './src/components/HadithOfTheDay';
import SectionModal from './src/components/SectionModal';
import HadithDetailModal from './src/components/HadithDetailModal';
import TasbihModal from './src/components/TasbihModal';
import SettingsModal from './src/components/SettingsModal';
import { hadithApi } from './src/services/hadithApi';
import { storageService } from './src/services/storageService';
import { STARTER_HADITHS } from './src/services/hadithData';

const TOPIC_CHIPS = [
  'All',
  'Faith (الإيمان)',
  'Prayer (الصلاة)',
  'Charity (الصدقة)',
  'Manners (الأدب)',
  'Mercy (الرحمة)',
  'Knowledge (العلم)',
];

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'books' | 'search' | 'bookmarks'

  // Books & Reading State
  const [books] = useState(hadithApi.getBooks());
  const [selectedBook, setSelectedBook] = useState(null); // When inside a book
  const [bookSections, setBookSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState({ id: '1', name: 'Section 1', number: 1 });
  const [hadithsList, setHadithsList] = useState([]);
  const [loadingHadiths, setLoadingHadiths] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [bookSearchQuery, setBookSearchQuery] = useState('');

  // Daily Hadith & Home state
  const [dailyHadith, setDailyHadith] = useState(hadithApi.getHadithOfTheDay());
  const [selectedTopic, setSelectedTopic] = useState('All');

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState([]);

  // Search Screen State
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Two-Step Search State
  const [searchSelectedBook, setSearchSelectedBook] = useState(null);
  const [searchHadithNumber, setSearchHadithNumber] = useState('');

  // Modals
  const [sectionModalVisible, setSectionModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [activeDetailHadith, setActiveDetailHadith] = useState(null);
  const [tasbihModalVisible, setTasbihModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  // Settings
  const [settings, setSettings] = useState({
    arabicFontSize: 24,
    englishFontSize: 15,
  });

  // Toast alert
  const [toastMessage, setToastMessage] = useState(null);

  // Load initial settings and bookmarks from local AsyncStorage
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const savedSettings = await storageService.getSettings();
      if (savedSettings) setSettings(savedSettings);

      const savedBookmarks = await storageService.getBookmarks();
      if (savedBookmarks) setBookmarks(savedBookmarks);
    } catch (e) {
      console.warn('Error loading initial data', e);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // Toggle Bookmark Handler
  const handleToggleBookmark = async (hadith) => {
    const res = await storageService.toggleBookmark(hadith);
    setBookmarks(res.bookmarks);
    showToast(res.isSaved ? 'Saved to Bookmarks ⭐' : 'Removed from Bookmarks');
  };

  const isHadithBookmarked = (id) => {
    return bookmarks.some((b) => b.id === id);
  };

  // Open Book Handler
  const handleSelectBook = async (book) => {
    setSelectedBook(book);
    setBookSearchQuery('');
    setLoadingSections(true);

    try {
      const sections = await hadithApi.fetchBookSections(book.id);
      setBookSections(sections);
      const firstSec = sections[0] || { id: '1', name: 'Section 1', number: 1 };
      setSelectedSection(firstSec);

      // Fetch hadiths for first section
      loadSectionHadiths(book.id, firstSec.id);
    } catch (e) {
      console.warn('Error fetching sections', e);
    } finally {
      setLoadingSections(false);
    }
  };

  const loadSectionHadiths = async (bookId, sectionId) => {
    setLoadingHadiths(true);
    try {
      const hadiths = await hadithApi.fetchHadithsBySection(bookId, sectionId);
      setHadithsList(hadiths);
    } catch (e) {
      console.warn('Error loading hadiths', e);
    } finally {
      setLoadingHadiths(false);
    }
  };

  const handleSelectSection = (section) => {
    setSelectedSection(section);
    if (selectedBook) {
      loadSectionHadiths(selectedBook.id, section.id);
    }
  };

  // Handle Global Search
  const handlePerformGlobalSearch = async (text) => {
    setGlobalSearchQuery(text);
    if (!text || text.trim() === '') {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await hadithApi.searchHadiths(text);
      setSearchResults(results);
    } catch (e) {
      console.warn('Search error', e);
    } finally {
      setSearching(false);
    }
  };

  // Handle Two-Step Book Search
  const handleBookNumberSearch = async (hadithNum) => {
    setSearchHadithNumber(hadithNum);
    if (!searchSelectedBook || !hadithNum || hadithNum.trim() === '') {
      setSearchResults([]);
      return;
    }
    const num = parseInt(hadithNum.trim(), 10);
    if (isNaN(num)) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const query = `${searchSelectedBook.nameEnglish.split(' ').pop()} ${num}`;
      const results = await hadithApi.searchHadiths(query);
      // Filter to just this book
      const filtered = results.filter((h) => h.bookId === searchSelectedBook.id);
      setSearchResults(filtered.length > 0 ? filtered : results.slice(0, 5));
    } catch (e) {
      console.warn('Book number search error', e);
    } finally {
      setSearching(false);
    }
  };

  // Filter Hadiths in Home by Topic
  const getHomeHadiths = () => {
    if (selectedTopic === 'All') return STARTER_HADITHS;
    const cleanTopic = selectedTopic.split(' ')[0].toLowerCase();
    return STARTER_HADITHS.filter((h) =>
      (h.topic || '').toLowerCase().includes(cleanTopic)
    );
  };

  // Filter Hadiths in current Book
  const getFilteredBookHadiths = () => {
    if (!bookSearchQuery || bookSearchQuery.trim() === '') {
      return hadithsList;
    }
    const q = bookSearchQuery.toLowerCase();
    return hadithsList.filter((h) => {
      const matchNum = String(h.hadithNumber) === q;
      const matchEng = (h.english || '').toLowerCase().includes(q);
      const matchAra = (h.arabic || '').includes(bookSearchQuery);
      return matchNum || matchEng || matchAra;
    });
  };

  // Open Full Hadith Detail Modal
  const handleOpenDetails = (hadith) => {
    setActiveDetailHadith(hadith);
    setDetailModalVisible(true);
  };

  // Save Settings
  const handleUpdateSettings = async (newSettings) => {
    setSettings(newSettings);
    await storageService.saveSettings(newSettings);
  };

  // RENDER TAB: HOME
  const renderHomeScreen = () => (
    <FlatList
      data={getHomeHadiths()}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View>
          {/* Daily Hadith Hero */}
          <HadithOfTheDay
            hadith={dailyHadith}
            isBookmarked={isHadithBookmarked(dailyHadith.id)}
            onToggleBookmark={handleToggleBookmark}
            onPress={handleOpenDetails}
          />

          {/* Quick Canonical Books Carousel Header */}
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionHeaderTitle}>Major Collections</Text>
            <TouchableOpacity onPress={() => setActiveTab('books')}>
              <Text style={styles.seeAllText}>View All ({books.length})</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Book Cards Horizontal Scroll */}
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={books.slice(0, 4)}
            keyExtractor={(b) => b.id}
            contentContainerStyle={styles.horizontalBooksList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.quickBookPill}
                onPress={() => {
                  setActiveTab('books');
                  handleSelectBook(item);
                }}
              >
                <View style={[styles.bookPillAccent, { backgroundColor: item.color }]} />
                <Text style={styles.quickBookArabic}>{item.nameArabic}</Text>
                <Text style={styles.quickBookEnglish} numberOfLines={1}>{item.nameEnglish}</Text>
                <Text style={styles.quickBookCount}>{item.totalHadith.toLocaleString()} Hadiths</Text>
              </TouchableOpacity>
            )}
          />

          {/* Topics Filter Header */}
          <View style={[styles.sectionTitleRow, { marginTop: 16 }]}>
            <Text style={styles.sectionHeaderTitle}>Explore by Topic</Text>
          </View>

          {/* Topic Pills */}
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={TOPIC_CHIPS}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.topicChipsList}
            renderItem={({ item }) => {
              const active = selectedTopic === item;
              return (
                <TouchableOpacity
                  style={[styles.topicChip, active && styles.topicChipActive]}
                  onPress={() => setSelectedTopic(item)}
                >
                  <Text style={[styles.topicChipText, active && styles.topicChipTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />

          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionHeaderTitle}>Essential Hadiths</Text>
            <Text style={styles.resultsCount}>{getHomeHadiths().length} narrations</Text>
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <HadithCard
          hadith={item}
          isBookmarked={isHadithBookmarked(item.id)}
          onToggleBookmark={handleToggleBookmark}
          onOpenDetails={handleOpenDetails}
          arabicFontSize={settings.arabicFontSize}
          englishFontSize={settings.englishFontSize}
          onCopySuccess={() => showToast('Hadith copied to clipboard! 📋')}
        />
      )}
      contentContainerStyle={styles.scrollContainer}
    />
  );

  // RENDER TAB: BOOKS (OR BOOK READER)
  const renderBooksScreen = () => {
    // If a book is selected, show its Hadiths Reader view
    if (selectedBook) {
      return (
        <View style={{ flex: 1 }}>
          {/* Book Header Bar */}
          <View style={styles.bookHeaderBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectedBook(null)}
            >
              <Ionicons name="arrow-back" size={20} color={colors.goldLight} />
              <Text style={styles.backButtonText}>Collections</Text>
            </TouchableOpacity>

            <View style={styles.bookHeaderTitles}>
              <Text style={styles.bookBarTitle} numberOfLines={1}>{selectedBook.nameEnglish}</Text>
              <Text style={styles.bookBarArabic}>{selectedBook.nameArabic}</Text>
            </View>

            {/* Chapter Selector Trigger Button */}
            {selectedBook.hasSections && (
              <TouchableOpacity
                style={styles.chapterSelectorBtn}
                onPress={() => setSectionModalVisible(true)}
              >
                <Ionicons name="list" size={16} color={colors.gold} />
                <Text style={styles.chapterBtnText} numberOfLines={1}>
                  Ch. {selectedSection.number}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Current Chapter Banner */}
          <View style={styles.currentSectionBanner}>
            <View style={styles.chapterIconBadge}>
              <FontAwesome5 name="book-open" size={14} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.currentSectionLabel}>CURRENT CHAPTER</Text>
              <Text style={styles.currentSectionName} numberOfLines={1}>
                {selectedSection.name || 'Complete Book'}
              </Text>
            </View>

            {selectedBook.hasSections && (
              <TouchableOpacity
                style={styles.changeChapterLink}
                onPress={() => setSectionModalVisible(true)}
              >
                <Text style={styles.changeChapterLinkText}>Change</Text>
                <Ionicons name="chevron-down" size={14} color={colors.gold} />
              </TouchableOpacity>
            )}
          </View>

          {/* Search inside this book input */}
          <View style={styles.bookSearchBox}>
            <Ionicons name="search" size={16} color={colors.textMuted} />
            <TextInput
              style={styles.bookSearchInput}
              placeholder={`Search in ${selectedBook.nameEnglish}...`}
              placeholderTextColor={colors.textMuted}
              value={bookSearchQuery}
              onChangeText={setBookSearchQuery}
            />
            {bookSearchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setBookSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Hadiths list */}
          {loadingHadiths ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.gold} />
              <Text style={styles.loadingText}>Fetching Authentic Hadiths...</Text>
            </View>
          ) : (
            <FlatList
              data={getFilteredBookHadiths()}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 60 }}
              renderItem={({ item }) => (
                <HadithCard
                  hadith={item}
                  isBookmarked={isHadithBookmarked(item.id)}
                  onToggleBookmark={handleToggleBookmark}
                  onOpenDetails={handleOpenDetails}
                  arabicFontSize={settings.arabicFontSize}
                  englishFontSize={settings.englishFontSize}
                  onCopySuccess={() => showToast('Hadith copied to clipboard! 📋')}
                />
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyTitle}>No Hadiths Found</Text>
                  <Text style={styles.emptySubtitle}>Try clearing search filters</Text>
                </View>
              }
            />
          )}
        </View>
      );
    }

    // Otherwise show all canonical books grid/list
    return (
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.booksListHeader}>
            <Text style={styles.booksTitleArabic}>المصادر والكتب المعتمدة</Text>
            <Text style={styles.booksTitleEnglish}>Canonical Hadith Compilations</Text>
            <Text style={styles.booksSubtitle}>
              Tap any collection to explore chapters, narrators, and authentic traditions.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <BookCard book={item} onSelectBook={handleSelectBook} />
        )}
        contentContainerStyle={styles.scrollContainer}
      />
    );
  };

  // RENDER TAB: SEARCH (Two-Step Flow)
  const renderSearchScreen = () => {
    // STEP 2: Book selected — show number input + results
    if (searchSelectedBook) {
      return (
        <View style={{ flex: 1 }}>
          {/* Step 2 Header — Selected Book Banner */}
          <View style={styles.searchStepHeader}>
            <View style={[styles.searchBookBanner, { borderLeftColor: searchSelectedBook.color }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.searchStepLabel}>SEARCHING IN</Text>
                <Text style={styles.searchBookBannerTitle} numberOfLines={1}>
                  {searchSelectedBook.nameEnglish}
                </Text>
                <Text style={styles.searchBookBannerArabic}>{searchSelectedBook.nameArabic}</Text>
              </View>
              <TouchableOpacity
                style={styles.changeBookBtn}
                onPress={() => {
                  setSearchSelectedBook(null);
                  setSearchHadithNumber('');
                  setSearchResults([]);
                }}
              >
                <Ionicons name="swap-horizontal" size={14} color={colors.gold} />
                <Text style={styles.changeBookBtnText}>Change</Text>
              </TouchableOpacity>
            </View>

            {/* Hadith Number Input */}
            <View style={styles.hadithNumInputWrapper}>
              <Ionicons name="numeric" size={20} color={colors.gold} />
              <TextInput
                style={styles.hadithNumInput}
                placeholder={`Enter Hadith # (1 – ${searchSelectedBook.totalHadith.toLocaleString()})`}
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={searchHadithNumber}
                onChangeText={handleBookNumberSearch}
                autoFocus
              />
              {searchHadithNumber.length > 0 && (
                <TouchableOpacity onPress={() => { setSearchHadithNumber(''); setSearchResults([]); }}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Hint Row */}
            <View style={styles.searchHintRow}>
              <Ionicons name="information-circle-outline" size={13} color={colors.goldDark} />
              <Text style={styles.searchHintText}>
                Type any hadith number from this collection to fetch it
              </Text>
            </View>
          </View>

          {/* Results */}
          {searching ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.gold} />
              <Text style={styles.loadingText}>Fetching Hadith...</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 60 }}
              ListHeaderComponent={
                searchResults.length > 0 ? (
                  <View style={styles.resultsMetaRow}>
                    <Text style={styles.resultsCountText}>
                      {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                    </Text>
                  </View>
                ) : null
              }
              renderItem={({ item }) => (
                <HadithCard
                  hadith={item}
                  isBookmarked={isHadithBookmarked(item.id)}
                  onToggleBookmark={handleToggleBookmark}
                  onOpenDetails={handleOpenDetails}
                  arabicFontSize={settings.arabicFontSize}
                  englishFontSize={settings.englishFontSize}
                  onCopySuccess={() => showToast('Hadith copied to clipboard! 📋')}
                />
              )}
              ListEmptyComponent={
                searchHadithNumber.length > 0 ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="book-outline" size={48} color={colors.textMuted} />
                    <Text style={styles.emptyTitle}>Hadith Not Found</Text>
                    <Text style={styles.emptySubtitle}>
                      Try another number (1–{searchSelectedBook.totalHadith.toLocaleString()})
                    </Text>
                  </View>
                ) : (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="keypad-outline" size={52} color={colors.textMuted} />
                    <Text style={styles.emptyTitle}>Enter a Hadith Number</Text>
                    <Text style={styles.emptySubtitle}>
                      Type the hadith number above to search in {searchSelectedBook.nameEnglish}
                    </Text>
                  </View>
                )
              }
            />
          )}
        </View>
      );
    }

    // STEP 1: Select a Book
    return (
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.searchBookGrid}
        contentContainerStyle={{ paddingBottom: 60 }}
        ListHeaderComponent={
          <View style={styles.searchStep1Header}>
            {/* Title */}
            <View style={styles.searchStep1TitleRow}>
              <Text style={styles.searchStep1Arabic}>ابحث في الكتب</Text>
              <Text style={styles.searchStep1Title}>Step 1 — Select a Book</Text>
              <Text style={styles.searchStep1Subtitle}>
                Choose a Hadith collection, then enter the Hadith number to look it up directly.
              </Text>
            </View>

            {/* Step Indicators */}
            <View style={styles.stepIndicatorRow}>
              <View style={styles.stepIndicatorActive}>
                <Text style={styles.stepIndicatorActiveText}>1</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepIndicatorInactive}>
                <Text style={styles.stepIndicatorInactiveText}>2</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepIndicatorInactive}>
                <Ionicons name="checkmark" size={12} color={colors.textMuted} />
              </View>
            </View>
            <View style={styles.stepLabelRow}>
              <Text style={styles.stepLabelActive}>Select Book</Text>
              <Text style={styles.stepLabelInactive}>Enter Number</Text>
              <Text style={styles.stepLabelInactive}>Result</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.searchBookCard, { borderLeftColor: item.color }]}
            onPress={() => {
              setSearchSelectedBook(item);
              setSearchHadithNumber('');
              setSearchResults([]);
            }}
          >
            <View style={[styles.searchBookCardAccent, { backgroundColor: item.color }]} />
            <Text style={styles.searchBookCardArabic}>{item.nameArabic}</Text>
            <Text style={styles.searchBookCardName} numberOfLines={2}>{item.nameEnglish}</Text>
            <View style={styles.searchBookCardFooter}>
              <View style={[styles.searchBookGradeBadge, { backgroundColor: item.badgeColor + '22' }]}>
                <Text style={[styles.searchBookGradeText, { color: item.badgeColor }]} numberOfLines={1}>
                  {item.grade.split(' ')[0]}
                </Text>
              </View>
              <Text style={styles.searchBookHadithCount}>{item.totalHadith.toLocaleString()}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    );
  };

  // RENDER TAB: BOOKMARKS
  const renderBookmarksScreen = () => (
    <FlatList
      data={bookmarks}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={styles.bookmarksHeader}>
          <View style={styles.bookmarkBadge}>
            <Ionicons name="bookmark" size={18} color={colors.gold} />
            <Text style={styles.bookmarkBadgeText}>Saved Hadiths</Text>
          </View>
          <Text style={styles.bookmarksTitleArabic}>الأحاديث المحفوظة</Text>
          <Text style={styles.bookmarksSubtitle}>
            {bookmarks.length} {bookmarks.length === 1 ? 'tradition' : 'traditions'} saved for offline reflection
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <HadithCard
          hadith={item}
          isBookmarked={true}
          onToggleBookmark={handleToggleBookmark}
          onOpenDetails={handleOpenDetails}
          arabicFontSize={settings.arabicFontSize}
          englishFontSize={settings.englishFontSize}
          onCopySuccess={() => showToast('Hadith copied to clipboard! 📋')}
        />
      )}
      contentContainerStyle={styles.scrollContainer}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={54} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No Saved Hadiths Yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the bookmark icon on any Hadith card to save it for quick offline reading.
          </Text>
        </View>
      }
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Main App Islamic Header */}
      <Header
        onOpenSettings={() => setSettingsModalVisible(true)}
        onOpenTasbih={() => setTasbihModalVisible(true)}
        onOpenSearch={() => setActiveTab('search')}
      />

      {/* Active Screen View */}
      <View style={styles.mainContent}>
        {activeTab === 'home' && renderHomeScreen()}
        {activeTab === 'books' && renderBooksScreen()}
        {activeTab === 'search' && renderSearchScreen()}
        {activeTab === 'bookmarks' && renderBookmarksScreen()}
      </View>

      {/* Bottom Navigation Tab Bar */}
      <View style={styles.bottomTabBar}>
        {/* Home */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => {
            setActiveTab('home');
            setSelectedBook(null);
          }}
        >
          <Ionicons
            name={activeTab === 'home' ? 'home' : 'home-outline'}
            size={22}
            color={activeTab === 'home' ? colors.gold : colors.inactiveTab}
          />
          <Text style={[styles.tabLabel, activeTab === 'home' && styles.tabLabelActive]}>
            Home
          </Text>
        </TouchableOpacity>

        {/* Collections */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('books')}
        >
          <Ionicons
            name={activeTab === 'books' ? 'library' : 'library-outline'}
            size={22}
            color={activeTab === 'books' ? colors.gold : colors.inactiveTab}
          />
          <Text style={[styles.tabLabel, activeTab === 'books' && styles.tabLabelActive]}>
            Books
          </Text>
        </TouchableOpacity>

        {/* Search */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('search')}
        >
          <Ionicons
            name={activeTab === 'search' ? 'search' : 'search-outline'}
            size={22}
            color={activeTab === 'search' ? colors.gold : colors.inactiveTab}
          />
          <Text style={[styles.tabLabel, activeTab === 'search' && styles.tabLabelActive]}>
            Search
          </Text>
        </TouchableOpacity>

        {/* Bookmarks */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('bookmarks')}
        >
          <View>
            <Ionicons
              name={activeTab === 'bookmarks' ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={activeTab === 'bookmarks' ? colors.gold : colors.inactiveTab}
            />
            {bookmarks.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{bookmarks.length}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.tabLabel, activeTab === 'bookmarks' && styles.tabLabelActive]}>
            Saved
          </Text>
        </TouchableOpacity>
      </View>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Modals */}
      <SectionModal
        visible={sectionModalVisible}
        book={selectedBook}
        sections={bookSections}
        loading={loadingSections}
        selectedSectionId={selectedSection.id}
        onSelectSection={handleSelectSection}
        onClose={() => setSectionModalVisible(false)}
      />

      <HadithDetailModal
        visible={detailModalVisible}
        hadith={activeDetailHadith}
        isBookmarked={activeDetailHadith ? isHadithBookmarked(activeDetailHadith.id) : false}
        onToggleBookmark={handleToggleBookmark}
        onClose={() => setDetailModalVisible(false)}
        initialArabicFontSize={settings.arabicFontSize}
        initialEnglishFontSize={settings.englishFontSize}
      />

      <TasbihModal
        visible={tasbihModalVisible}
        onClose={() => setTasbihModalVisible(false)}
      />

      <SettingsModal
        visible={settingsModalVisible}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onClose={() => setSettingsModalVisible(false)}
        bookmarksCount={bookmarks.length}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mainContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 60,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.goldLight,
  },
  seeAllText: {
    fontSize: 12,
    color: colors.gold,
    fontWeight: '600',
  },
  resultsCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  horizontalBooksList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  quickBookPill: {
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    minWidth: 140,
  },
  bookPillAccent: {
    width: 24,
    height: 4,
    borderRadius: 2,
    marginBottom: 6,
  },
  quickBookArabic: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.goldLight,
    textAlign: 'right',
  },
  quickBookEnglish: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 4,
  },
  quickBookCount: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  topicChipsList: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  topicChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  topicChipActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: colors.gold,
  },
  topicChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  topicChipTextActive: {
    color: colors.goldLight,
    fontWeight: 'bold',
  },
  bookHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backButtonText: {
    color: colors.goldLight,
    fontSize: 13,
    fontWeight: '600',
  },
  bookHeaderTitles: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  bookBarTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
  },
  bookBarArabic: {
    color: colors.goldLight,
    fontSize: 13,
  },
  chapterSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  chapterBtnText: {
    color: colors.goldLight,
    fontSize: 12,
    fontWeight: 'bold',
    maxWidth: 75,
  },
  currentSectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(19, 43, 37, 0.9)',
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  chapterIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentSectionLabel: {
    fontSize: 9.5,
    color: colors.goldDark,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  currentSectionName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  changeChapterLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  changeChapterLinkText: {
    fontSize: 12,
    color: colors.gold,
    fontWeight: '600',
  },
  bookSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 40,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: 8,
  },
  bookSearchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
  },
  booksListHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  booksTitleArabic: {
    fontSize: 22,
    color: colors.goldLight,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  booksTitleEnglish: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  booksSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 10,
  },
  // ── Step 1: Search Book Selection ──
  searchStep1Header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchStep1TitleRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  searchStep1Arabic: {
    fontSize: 24,
    color: colors.goldLight,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  searchStep1Title: {
    fontSize: 17,
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  searchStep1Subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    gap: 0,
  },
  stepIndicatorActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicatorActiveText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: 'bold',
  },
  stepIndicatorInactive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicatorInactiveText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  stepLine: {
    width: 32,
    height: 2,
    backgroundColor: colors.surfaceBorder,
  },
  stepLabelRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 12,
  },
  stepLabelActive: {
    fontSize: 10,
    color: colors.goldLight,
    fontWeight: '700',
    width: 70,
    textAlign: 'center',
  },
  stepLabelInactive: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '500',
    width: 70,
    textAlign: 'center',
  },
  searchBookGrid: {
    paddingHorizontal: 12,
    gap: 10,
    justifyContent: 'space-between',
  },
  searchBookCard: {
    flex: 1,
    margin: 4,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderLeftWidth: 4,
    padding: 12,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  searchBookCardAccent: {
    width: 20,
    height: 3,
    borderRadius: 2,
    marginBottom: 6,
  },
  searchBookCardArabic: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.goldLight,
    textAlign: 'right',
    marginBottom: 2,
  },
  searchBookCardName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 17,
  },
  searchBookCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  searchBookGradeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  searchBookGradeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  searchBookHadithCount: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  // ── Step 2: Hadith Number Input ──
  searchStepHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  searchBookBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderLeftWidth: 5,
    padding: 14,
    marginBottom: 10,
  },
  searchStepLabel: {
    fontSize: 9.5,
    color: colors.goldDark,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  searchBookBannerTitle: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  searchBookBannerArabic: {
    fontSize: 13,
    color: colors.goldLight,
    marginTop: 2,
  },
  changeBookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  changeBookBtnText: {
    fontSize: 12,
    color: colors.gold,
    fontWeight: '700',
  },
  hadithNumInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.gold,
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
    marginBottom: 8,
  },
  hadithNumInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  searchHintText: {
    fontSize: 11,
    color: colors.textMuted,
    flex: 1,
  },
  resultsMetaRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsCountText: {
    fontSize: 13,
    color: colors.goldLight,
    fontWeight: '600',
  },
  bookmarksHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    alignItems: 'center',
  },
  bookmarkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 8,
  },
  bookmarkBadgeText: {
    color: colors.goldLight,
    fontSize: 12,
    fontWeight: '700',
  },
  bookmarksTitleArabic: {
    fontSize: 22,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  bookmarksSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'android' ? 10 : 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10.5,
    color: colors.inactiveTab,
    marginTop: 4,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.gold,
    fontWeight: '700',
  },
  tabBadge: {
    position: 'absolute',
    top: -3,
    right: -10,
    backgroundColor: colors.gold,
    borderRadius: 9,
    width: 17,
    height: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadgeText: {
    color: colors.background,
    fontSize: 9.5,
    fontWeight: 'bold',
  },
  loadingBox: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 12,
    fontSize: 13,
  },
  emptyContainer: {
    paddingVertical: 50,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 75,
    alignSelf: 'center',
    backgroundColor: 'rgba(19, 43, 37, 0.95)',
    borderWidth: 1,
    borderColor: colors.gold,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  toastText: {
    color: colors.goldLight,
    fontSize: 13,
    fontWeight: 'bold',
  },
});
