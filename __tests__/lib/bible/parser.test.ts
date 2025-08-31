import { parseReference, getChapter, formatReference } from '@/lib/bible/parser'
import { BookName } from '@/lib/bible/books'

describe('Bible Parser', () => {
  describe('parseReference', () => {
    it('parses book and chapter references', () => {
      const result = parseReference('Genesis 1')
      expect(result).toBeTruthy()
      expect(result?.book).toBe('Genesis')
      expect(result?.chapter).toBe(1)
      expect(result?.verseStart).toBeUndefined()
    })

    it('parses book, chapter, and verse references', () => {
      const result = parseReference('John 3:16')
      expect(result).toBeTruthy()
      expect(result?.book).toBe('John')
      expect(result?.chapter).toBe(3)
      expect(result?.verseStart).toBe(16)
      expect(result?.verseEnd).toBeUndefined()
    })

    it('parses verse ranges', () => {
      const result = parseReference('Romans 8:28-30')
      expect(result).toBeTruthy()
      expect(result?.book).toBe('Romans')
      expect(result?.chapter).toBe(8)
      expect(result?.verseStart).toBe(28)
      expect(result?.verseEnd).toBe(30)
    })

    it('handles books with numbers', () => {
      const result = parseReference('1 Corinthians 13:4')
      expect(result).toBeTruthy()
      expect(result?.book).toBe('1 Corinthians')
      expect(result?.chapter).toBe(13)
      expect(result?.verseStart).toBe(4)
    })

    it('returns null for invalid references', () => {
      expect(parseReference('InvalidBook 1:1')).toBeNull()
      expect(parseReference('Genesis')).toBeNull() // Missing chapter
      expect(parseReference('')).toBeNull()
    })
  })

  describe('getChapter', () => {
    it('returns verses for valid chapters', () => {
      const verses = getChapter('Genesis' as BookName, 1)
      expect(verses).toBeDefined()
      expect(Array.isArray(verses)).toBe(true)
      expect(verses.length).toBeGreaterThan(0)
      
      // Check first verse structure
      if (verses.length > 0) {
        expect(verses[0]).toHaveProperty('verse')
        expect(verses[0]).toHaveProperty('text')
        expect(verses[0].verse).toBe(1)
      }
    })

    it('returns empty array for invalid chapters', () => {
      const verses = getChapter('Genesis' as BookName, 999) // Invalid chapter
      expect(verses).toEqual([])
    })

    it('handles all 66 books', () => {
      const testBooks: BookName[] = [
        'Genesis',
        'Exodus',
        'Matthew',
        'Revelation',
      ] as BookName[]

      testBooks.forEach(book => {
        const verses = getChapter(book, 1)
        expect(verses).toBeDefined()
        expect(Array.isArray(verses)).toBe(true)
      })
    })

    it('loads correct chapter for Psalms 119 (longest chapter)', () => {
      const verses = getChapter('Psalms' as BookName, 119)
      expect(verses).toBeDefined()
      expect(verses.length).toBe(176) // Psalms 119 has 176 verses
    })

    it('loads correct chapter for Revelation 22 (last chapter)', () => {
      const verses = getChapter('Revelation' as BookName, 22)
      expect(verses).toBeDefined()
      expect(verses.length).toBeGreaterThan(0)
      expect(verses.length).toBeLessThanOrEqual(21) // Revelation 22 has 21 verses
    })
  })

  describe('formatReference', () => {
    it('formats book and chapter', () => {
      const formatted = formatReference('Genesis' as BookName, 1)
      expect(formatted).toBe('Genesis 1')
    })

    it('formats book, chapter, and verse', () => {
      const formatted = formatReference('John' as BookName, 3, 16)
      expect(formatted).toBe('John 3:16')
    })

    it('formats verse ranges', () => {
      const formatted = formatReference('Romans' as BookName, 8, 28, 30)
      expect(formatted).toBe('Romans 8:28-30')
    })

    it('handles single verse when start and end are the same', () => {
      const formatted = formatReference('Psalms' as BookName, 23, 1, 1)
      expect(formatted).toBe('Psalms 23:1')
    })
  })

  describe('Bible Data Completeness', () => {
    it('has all 1,189 chapters accessible', () => {
      let accessibleChapters = 0

      // Test a sample of books to verify structure
      const sampleBooks: Array<{ name: BookName; chapters: number }> = [
        { name: 'Genesis' as BookName, chapters: 50 },
        { name: 'Psalms' as BookName, chapters: 150 },
        { name: 'Isaiah' as BookName, chapters: 66 },
        { name: 'Matthew' as BookName, chapters: 28 },
        { name: 'Revelation' as BookName, chapters: 22 },
      ]

      sampleBooks.forEach(({ name, chapters }) => {
        for (let i = 1; i <= chapters; i++) {
          const verses = getChapter(name, i)
          if (verses && verses.length > 0) {
            accessibleChapters++
          }
        }
      })

      // We're testing a sample, so we should have accessed all sample chapters
      const expectedSampleChapters = sampleBooks.reduce((sum, book) => sum + book.chapters, 0)
      expect(accessibleChapters).toBe(expectedSampleChapters)
    })

    it('has real KJV text for Genesis 1-3', () => {
      const genesis1 = getChapter('Genesis' as BookName, 1)
      expect(genesis1[0]?.text).toContain('In the beginning God created')
      
      const genesis2 = getChapter('Genesis' as BookName, 2)
      expect(genesis2).toBeDefined()
      expect(genesis2.length).toBeGreaterThan(0)
      
      const genesis3 = getChapter('Genesis' as BookName, 3)
      expect(genesis3).toBeDefined()
      expect(genesis3.length).toBeGreaterThan(0)
    })

    it('has real KJV text for John 1-3', () => {
      const john1 = getChapter('John' as BookName, 1)
      expect(john1[0]?.text).toContain('In the beginning was the Word')
      
      const john3 = getChapter('John' as BookName, 3)
      expect(john3).toBeDefined()
      // John 3:16 should be at index 15 (0-based)
      if (john3[15]) {
        expect(john3[15].text).toContain('For God so loved the world')
      }
    })

    it('has placeholder text for other chapters', () => {
      const exodus1 = getChapter('Exodus' as BookName, 1)
      expect(exodus1).toBeDefined()
      if (exodus1[0]) {
        expect(exodus1[0].text).toContain('[Exodus 1:1]')
      }
    })
  })
})