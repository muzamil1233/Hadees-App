import { HADITH_BOOKS, STARTER_HADITHS } from './hadithData.js';
import { storageService } from './storageService.js';

const CDN_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';

// In-memory cache to make screen transitions instant
const memorySectionsCache = {};
const memoryHadithCache = {};
const memorySingleHadithCache = {};

export const hadithApi = {
  getBooks() {
    return HADITH_BOOKS;
  },

  getBookById(bookId) {
    return HADITH_BOOKS.find((b) => b.id === bookId) || HADITH_BOOKS[0];
  },

  /**
   * Parse queries like:
   * "sahih muslim 2248", "sahih muslim2248", "muslim2248", "muslim 2248"
   * "sahih bukhari 1", "bukhari 1", "bukhari1"
   * "tirmidhi 1987", "abu dawud 1500", "nasai 45", "ibn majah 200", etc.
   */
  parseHadithQuery(query) {
    if (!query) return null;
    let clean = query.trim().toLowerCase();
    // Normalize common separators and labels
    clean = clean.replace(/[:\-#]/g, ' ');
    clean = clean.replace(/\b(hadith|hades|hadees|number|num|no)\b/g, ' ');
    clean = clean.replace(/\s+/g, ' ').trim();

    const bookPatterns = [
      { id: 'bukhari', regex: /^(?:sahih\s+al[- ]?bukhari|sahih\s+bukhari|al[- ]?bukhari|bukhari|bokhari)\s*(\d+)$/i },
      { id: 'muslim', regex: /^(?:sahih\s+muslim|muslim)\s*(\d+)$/i },
      { id: 'tirmidhi', regex: /^(?:jami\s+at[- ]?tirmidhi|jami\s+tirmidhi|at[- ]?tirmidhi|tirmidhi|tirmazi)\s*(\d+)$/i },
      { id: 'abudawud', regex: /^(?:sunan\s+abi\s+dawud|sunan\s+abu\s+dawud|abu\s*dawud|abi\s*dawud|abu\s*dawood|abudawud)\s*(\d+)$/i },
      { id: 'nasai', regex: /^(?:sunan\s+an[- ]?nasa'?i|sunan\s+al[- ]?nasa'?i|sunan\s+nasa'?i|an[- ]?nasa'?i|nasa'?i|nisai)\s*(\d+)$/i },
      { id: 'ibnmajah', regex: /^(?:sunan\s+ibn\s+majah|ibn\s*majah|ibnmajah)\s*(\d+)$/i },
      { id: 'malik', regex: /^(?:muwatta\s+malik|muwatta|malik)\s*(\d+)$/i },
      { id: 'nawawi', regex: /^(?:forty\s+hadith\s+of\s+an[- ]?nawawi|40\s+hadith\s+nawawi|40\s+nawawi|nawawi\s*40|nawawi|an[- ]?nawawi)\s*(\d+)$/i },
      { id: 'qudsi', regex: /^(?:hadith\s+qudsi|qudsi)\s*(\d+)$/i },
    ];

    for (const { id, regex } of bookPatterns) {
      const match = clean.match(regex);
      if (match) {
        return {
          bookId: id,
          hadithNumber: parseInt(match[1], 10),
          bookMeta: this.getBookById(id),
        };
      }
    }

    // Bare number query
    if (/^\d+$/.test(clean)) {
      return {
        bookId: null,
        hadithNumber: parseInt(clean, 10),
        bookMeta: null,
      };
    }

    return null;
  },

  async fetchBookSections(bookId) {
    if (memorySectionsCache[bookId]) {
      return memorySectionsCache[bookId];
    }

    try {
      if (bookId === 'nawawi' || bookId === 'qudsi') {
        const singleSection = [
          {
            id: '1',
            number: 1,
            name: bookId === 'nawawi' ? 'Complete 40 Hadiths (الأربعون)' : 'Complete Hadith Qudsi (الأحاديث القدسية)',
            hadithCount: bookId === 'nawawi' ? 42 : 40,
          },
        ];
        memorySectionsCache[bookId] = singleSection;
        return singleSection;
      }

      const response = await fetch(`${CDN_BASE}/info.json`);
      if (!response.ok) throw new Error('Failed to fetch info');
      const data = await response.json();

      const bookInfo = data[bookId];
      if (bookInfo && bookInfo.metadata && bookInfo.metadata.sections) {
        const sectionsObj = bookInfo.metadata.sections;
        const detailsObj = bookInfo.metadata.section_detail || {};

        const sectionsList = Object.keys(sectionsObj)
          .filter((k) => k !== '0' && sectionsObj[k] && sectionsObj[k].trim() !== '')
          .map((k) => {
            const detail = detailsObj[k] || {};
            const first = detail.hadithnumber_first || 1;
            const last = detail.hadithnumber_last || first;
            const count = last >= first ? last - first + 1 : 1;

            return {
              id: k,
              number: parseInt(k, 10),
              name: sectionsObj[k],
              hadithCount: count,
              firstHadith: first,
              lastHadith: last,
            };
          });

        memorySectionsCache[bookId] = sectionsList;
        return sectionsList;
      }
    } catch (e) {
      console.warn(`Could not fetch online sections for ${bookId}, using fallback:`, e.message);
    }

    const fallbackSections = [
      { id: '1', number: 1, name: 'Kitab al-Iman (Book of Faith)', hadithCount: 50 },
      { id: '2', number: 2, name: 'Kitab as-Salah (Book of Prayer)', hadithCount: 45 },
      { id: '3', number: 3, name: 'Kitab az-Zakat (Book of Charity)', hadithCount: 30 },
      { id: '4', number: 4, name: 'Kitab as-Sawm (Book of Fasting)', hadithCount: 25 },
      { id: '5', number: 5, name: 'Kitab al-Adab (Good Manners)', hadithCount: 40 },
    ];
    memorySectionsCache[bookId] = fallbackSections;
    return fallbackSections;
  },

  /**
   * Fetch single Hadith by bookId and hadithNumber
   * Concurrently retrieves Arabic, English, and Urdu translations!
   */
  async fetchHadithByBookAndNumber(bookId, hadithNumber) {
    const num = parseInt(hadithNumber, 10);
    const cacheKey = `${bookId}-${num}`;

    if (memorySingleHadithCache[cacheKey]) {
      return memorySingleHadithCache[cacheKey];
    }

    // Check Starter Hadiths first
    const starterMatch = STARTER_HADITHS.find(
      (h) => h.bookId === bookId && String(h.hadithNumber) === String(num)
    );
    if (starterMatch) {
      const enriched = { ...starterMatch, isDirectMatch: true };
      memorySingleHadithCache[cacheKey] = enriched;
      return enriched;
    }

    // Check Memory Sections Cache
    for (const list of Object.values(memoryHadithCache)) {
      const found = list.find(
        (h) => h.bookId === bookId && String(h.hadithNumber) === String(num)
      );
      if (found) {
        const enriched = { ...found, isDirectMatch: true };
        memorySingleHadithCache[cacheKey] = enriched;
        return enriched;
      }
    }

    // Fetch from Online CDN API
    try {
      const bookMeta = this.getBookById(bookId);
      const isUrduAvailable = bookMeta.hasUrdu !== false && bookId !== 'nawawi' && bookId !== 'qudsi';

      const araUrl = `${CDN_BASE}/editions/ara-${bookId}/${num}.json`;
      const engUrl = `${CDN_BASE}/editions/eng-${bookId}/${num}.json`;
      const urdUrl = isUrduAvailable ? `${CDN_BASE}/editions/urd-${bookId}/${num}.json` : null;

      const [araRes, engRes, urdRes] = await Promise.all([
        fetch(araUrl).catch(() => null),
        fetch(engUrl).catch(() => null),
        urdUrl ? fetch(urdUrl).catch(() => null) : Promise.resolve(null),
      ]);

      const engData = engRes && engRes.ok ? await engRes.json() : null;
      const araData = araRes && araRes.ok ? await araRes.json() : null;
      const urdData = urdRes && urdRes.ok ? await urdRes.json() : null;

      if (!engData && !araData && !urdData) {
        return null;
      }

      const engItem = (engData && engData.hadiths && engData.hadiths[0]) || {};
      const araItem = (araData && araData.hadiths && araData.hadiths[0]) || {};
      const urdItem = (urdData && urdData.hadiths && urdData.hadiths[0]) || {};

      // Determine Section Name
      let sectionName = '';
      let sectionId = '1';
      const metaSource = engData || araData || urdData;
      if (metaSource && metaSource.metadata && metaSource.metadata.section) {
        const secKeys = Object.keys(metaSource.metadata.section);
        if (secKeys.length > 0) {
          sectionId = secKeys[0];
          sectionName = metaSource.metadata.section[sectionId];
        }
      }

      // Determine Grade
      let gradeText = bookMeta.grade || 'Authentic';
      let gradeColor = bookMeta.badgeColor || '#10B981';
      if (engItem.grades && engItem.grades.length > 0) {
        const mainGrade = engItem.grades[0];
        gradeText = `${mainGrade.grade} (${mainGrade.name || 'Scholar'})`;
        const lower = mainGrade.grade.toLowerCase();
        if (lower.includes('sahih')) gradeColor = '#10B981';
        else if (lower.includes('hasan')) gradeColor = '#F59E0B';
        else if (lower.includes('daif') || lower.includes("da'if")) gradeColor = '#EF4444';
      }

      // Extract Narrator
      const text = engItem.text || '';
      let narrator = 'Prophetic Tradition';
      const narratorMatch = text.match(/^(Narrated\s+[^:]+|It was narrated\s+[^:]+|On the authority of\s+[^:]+):/i);
      if (narratorMatch) {
        narrator = narratorMatch[1];
      }

      const hadithResult = {
        id: `${bookId}-${num}`,
        bookId,
        bookName: bookMeta.nameEnglish,
        bookNameArabic: bookMeta.nameArabic,
        hadithNumber: num,
        arabicNumber: araItem.arabicnumber || engItem.arabicnumber || num,
        sectionId,
        sectionName: sectionName || `Section ${sectionId}`,
        narrator,
        arabic: araItem.text || 'الحديث الشريف',
        english: engItem.text || 'English translation unavailable.',
        urdu: urdItem.text || '',
        grade: gradeText,
        gradeColor,
        isDirectMatch: true,
      };

      memorySingleHadithCache[cacheKey] = hadithResult;
      return hadithResult;
    } catch (e) {
      console.warn(`Failed to fetch hadith ${bookId} #${num}:`, e.message);
      return null;
    }
  },

  async fetchHadithsBySection(bookId, sectionId = '1') {
    const cacheKey = `${bookId}_sec_${sectionId}`;
    if (memoryHadithCache[cacheKey]) {
      return memoryHadithCache[cacheKey];
    }

    const offlineCached = await storageService.getCachedSection(bookId, sectionId);
    if (offlineCached && offlineCached.length > 0) {
      memoryHadithCache[cacheKey] = offlineCached;
      return offlineCached;
    }

    try {
      const bookMeta = this.getBookById(bookId);
      const isUrduAvailable = bookMeta.hasUrdu !== false && bookId !== 'nawawi' && bookId !== 'qudsi';

      const araUrl = `${CDN_BASE}/editions/ara-${bookId}/sections/${sectionId}.min.json`;
      const engUrl = `${CDN_BASE}/editions/eng-${bookId}/sections/${sectionId}.min.json`;
      const urdUrl = isUrduAvailable ? `${CDN_BASE}/editions/urd-${bookId}/sections/${sectionId}.min.json` : null;

      const [araRes, engRes, urdRes] = await Promise.all([
        fetch(araUrl).catch(() => null),
        fetch(engUrl).catch(() => null),
        urdUrl ? fetch(urdUrl).catch(() => null) : Promise.resolve(null),
      ]);

      if ((!araRes || !araRes.ok) && (!engRes || !engRes.ok)) {
        throw new Error(`Failed to fetch section ${sectionId} for ${bookId}`);
      }

      const araData = araRes && araRes.ok ? await araRes.json() : { hadiths: [] };
      const engData = engRes && engRes.ok ? await engRes.json() : { hadiths: [] };
      const urdData = urdRes && urdRes.ok ? await urdRes.json() : { hadiths: [] };

      const araHadiths = araData.hadiths || [];
      const engHadiths = engData.hadiths || [];
      const urdHadiths = urdData.hadiths || [];

      const sectionName =
        (engData.metadata && engData.metadata.section && engData.metadata.section[sectionId]) ||
        (urdData.metadata && urdData.metadata.section && urdData.metadata.section[sectionId]) ||
        `Section ${sectionId}`;

      const count = Math.max(engHadiths.length, araHadiths.length);
      const merged = [];

      for (let i = 0; i < count; i++) {
        const engItem = engHadiths[i] || {};
        const hNum = engItem.hadithnumber || (araHadiths[i] && araHadiths[i].hadithnumber) || i + 1;

        const araItem =
          araHadiths.find((a) => a.hadithnumber === hNum) ||
          araHadiths[i] ||
          {};

        const urdItem =
          urdHadiths.find((u) => u.hadithnumber === hNum) ||
          urdHadiths[i] ||
          {};

        let gradeText = bookMeta.grade || 'Authentic';
        let gradeColor = bookMeta.badgeColor || '#10B981';

        if (engItem.grades && engItem.grades.length > 0) {
          const mainGrade = engItem.grades[0];
          gradeText = `${mainGrade.grade} (${mainGrade.name || 'Scholar'})`;
          const lower = mainGrade.grade.toLowerCase();
          if (lower.includes('sahih')) gradeColor = '#10B981';
          else if (lower.includes('hasan')) gradeColor = '#F59E0B';
          else if (lower.includes('daif') || lower.includes("da'if")) gradeColor = '#EF4444';
        }

        const text = engItem.text || '';
        let narrator = 'Prophetic Tradition';
        const narratorMatch = text.match(/^(Narrated\s+[^:]+|It was narrated\s+[^:]+|On the authority of\s+[^:]+):/i);
        if (narratorMatch) {
          narrator = narratorMatch[1];
        }

        merged.push({
          id: `${bookId}-${hNum}`,
          bookId,
          bookName: bookMeta.nameEnglish,
          bookNameArabic: bookMeta.nameArabic,
          hadithNumber: hNum,
          arabicNumber: araItem.arabicnumber || engItem.arabicnumber || hNum,
          sectionId,
          sectionName,
          narrator,
          arabic: araItem.text || 'الحديث الشريف',
          english: engItem.text || 'Translation unavailable.',
          urdu: urdItem.text || '',
          grade: gradeText,
          gradeColor,
        });
      }

      if (merged.length > 0) {
        memoryHadithCache[cacheKey] = merged;
        storageService.cacheSection(bookId, sectionId, merged);
        return merged;
      }
    } catch (e) {
      console.warn(`Online fetch failed for ${bookId} section ${sectionId}:`, e.message);
    }

    const matchingStarters = STARTER_HADITHS.filter((h) => h.bookId === bookId);
    if (matchingStarters.length > 0) {
      memoryHadithCache[cacheKey] = matchingStarters;
      return matchingStarters;
    }

    memoryHadithCache[cacheKey] = STARTER_HADITHS;
    return STARTER_HADITHS;
  },

  getHadithOfTheDay() {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
    );
    const index = dayOfYear % STARTER_HADITHS.length;
    return STARTER_HADITHS[index] || STARTER_HADITHS[0];
  },

  /**
   * Universal smart search:
   * 1. Detects exact Book + Number queries (e.g. "sahih muslim 2248", "muslim2248", "bukhari 1")
   * 2. Fetches matching authentic Hadith with Arabic, Urdu & English
   * 3. Performs deep multi-lingual search across Arabic, Urdu, English, Narrators, and Topics
   */
  async searchHadiths(query) {
    if (!query || query.trim() === '') return [];
    const rawTrimmed = query.trim();
    const q = rawTrimmed.toLowerCase();
    const results = [];

    // Step 1: Check for smart direct book & number pattern
    const parsed = this.parseHadithQuery(rawTrimmed);
    if (parsed) {
      if (parsed.bookId) {
        const directHadith = await this.fetchHadithByBookAndNumber(
          parsed.bookId,
          parsed.hadithNumber
        );
        if (directHadith) {
          results.push(directHadith);
        }
      } else {
        // Only a number provided (e.g. "2248"): check starter and common collections
        const starterNum = STARTER_HADITHS.find(
          (h) => String(h.hadithNumber) === String(parsed.hadithNumber)
        );
        if (starterNum) {
          results.push({ ...starterNum, isDirectMatch: true });
        } else {
          // Try Sahih Muslim then Sahih Bukhari
          const muslimDirect = await this.fetchHadithByBookAndNumber(
            'muslim',
            parsed.hadithNumber
          );
          if (muslimDirect) results.push(muslimDirect);
        }
      }
    }

    // Step 2: Search STARTER_HADITHS
    STARTER_HADITHS.forEach((h) => {
      if (results.some((r) => r.id === h.id)) return;
      const matchNum = String(h.hadithNumber) === q;
      const matchEng = (h.english || '').toLowerCase().includes(q);
      const matchUrd = (h.urdu || '').includes(rawTrimmed);
      const matchAra = (h.arabic || '').includes(rawTrimmed);
      const matchNarrator = (h.narrator || '').toLowerCase().includes(q);
      const matchBook = (h.bookName || '').toLowerCase().includes(q);
      const matchTopic = (h.topic || '').toLowerCase().includes(q);

      if (matchNum || matchEng || matchUrd || matchAra || matchNarrator || matchBook || matchTopic) {
        results.push(h);
      }
    });

    // Step 3: Search all in-memory loaded hadiths
    Object.values(memoryHadithCache).forEach((hadithList) => {
      hadithList.forEach((h) => {
        if (!results.some((r) => r.id === h.id)) {
          const matchNum = String(h.hadithNumber) === q;
          const matchEng = (h.english || '').toLowerCase().includes(q);
          const matchUrd = (h.urdu || '').includes(rawTrimmed);
          const matchAra = (h.arabic || '').includes(rawTrimmed);
          const matchNarrator = (h.narrator || '').toLowerCase().includes(q);
          const matchBook = (h.bookName || '').toLowerCase().includes(q);

          if (matchNum || matchEng || matchUrd || matchAra || matchNarrator || matchBook) {
            results.push(h);
          }
        }
      });
    });

    return results;
  },
};

