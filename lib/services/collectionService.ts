'use client';

import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface Verse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  theme: string;
  icon: string;
  verses: Verse[];
  isPreset: boolean;
  createdAt: Date;
  shareCode?: string;
}

interface CollectionDB extends DBSchema {
  collections: {
    key: string;
    value: Collection;
  };
  shareHistory: {
    key: string;
    value: {
      collectionId: string;
      sharedAt: Date;
      platform: string;
    };
  };
}

// Preset collections with curated verses
export const PRESET_COLLECTIONS: Omit<Collection, 'verses'>[] = [
  {
    id: 'comfort',
    name: 'Comfort in Hard Times',
    description: 'Verses that bring peace and comfort during difficult seasons',
    theme: 'comfort',
    icon: '🤗',
    isPreset: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'hope',
    name: 'Verses of Hope',
    description: 'Scripture that reminds us of God\'s promises and future hope',
    theme: 'hope',
    icon: '🌅',
    isPreset: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'strength',
    name: 'Strength for Today',
    description: 'Powerful verses to give you strength for daily challenges',
    theme: 'strength',
    icon: '💪',
    isPreset: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'peace',
    name: 'Peace & Rest',
    description: 'Calming verses for anxiety, worry, and restless hearts',
    theme: 'peace',
    icon: '☮️',
    isPreset: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'love',
    name: 'God\'s Amazing Love',
    description: 'Verses about God\'s unconditional love and our love for others',
    theme: 'love',
    icon: '❤️',
    isPreset: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'wisdom',
    name: 'Wisdom & Guidance',
    description: 'Scripture for making wise decisions and seeking God\'s will',
    theme: 'wisdom',
    icon: '🦉',
    isPreset: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'faith',
    name: 'Building Faith',
    description: 'Verses to strengthen and grow your faith in God',
    theme: 'faith',
    icon: '✨',
    isPreset: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'gratitude',
    name: 'Thanksgiving & Praise',
    description: 'Verses to cultivate a heart of gratitude and worship',
    theme: 'gratitude',
    icon: '🙏',
    isPreset: true,
    createdAt: new Date('2024-01-01'),
  },
];

// Preset verses for each collection
export const PRESET_VERSES: Record<string, Verse[]> = {
  comfort: [
    {
      book: 'Psalm',
      chapter: 23,
      verse: 4,
      text: 'Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.',
      reference: 'Psalm 23:4',
    },
    {
      book: '2 Corinthians',
      chapter: 1,
      verse: 3,
      text: 'Praise be to the God and Father of our Lord Jesus Christ, the Father of compassion and the God of all comfort.',
      reference: '2 Corinthians 1:3',
    },
    {
      book: 'Isaiah',
      chapter: 41,
      verse: 10,
      text: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.',
      reference: 'Isaiah 41:10',
    },
    {
      book: 'Matthew',
      chapter: 11,
      verse: 28,
      text: 'Come to me, all you who are weary and burdened, and I will give you rest.',
      reference: 'Matthew 11:28',
    },
    {
      book: '1 Peter',
      chapter: 5,
      verse: 7,
      text: 'Cast all your anxiety on him because he cares for you.',
      reference: '1 Peter 5:7',
    },
  ],
  hope: [
    {
      book: 'Jeremiah',
      chapter: 29,
      verse: 11,
      text: 'For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, to give you hope and a future.',
      reference: 'Jeremiah 29:11',
    },
    {
      book: 'Romans',
      chapter: 8,
      verse: 28,
      text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
      reference: 'Romans 8:28',
    },
    {
      book: 'Romans',
      chapter: 15,
      verse: 13,
      text: 'May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.',
      reference: 'Romans 15:13',
    },
    {
      book: 'Lamentations',
      chapter: 3,
      verse: 22,
      text: 'Because of the Lord\'s great love we are not consumed, for his compassions never fail.',
      reference: 'Lamentations 3:22',
    },
  ],
  strength: [
    {
      book: 'Philippians',
      chapter: 4,
      verse: 13,
      text: 'I can do all this through him who gives me strength.',
      reference: 'Philippians 4:13',
    },
    {
      book: 'Isaiah',
      chapter: 40,
      verse: 31,
      text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.',
      reference: 'Isaiah 40:31',
    },
    {
      book: 'Joshua',
      chapter: 1,
      verse: 9,
      text: 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.',
      reference: 'Joshua 1:9',
    },
    {
      book: '2 Timothy',
      chapter: 1,
      verse: 7,
      text: 'For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.',
      reference: '2 Timothy 1:7',
    },
  ],
  peace: [
    {
      book: 'Philippians',
      chapter: 4,
      verse: 6,
      text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.',
      reference: 'Philippians 4:6',
    },
    {
      book: 'John',
      chapter: 14,
      verse: 27,
      text: 'Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.',
      reference: 'John 14:27',
    },
    {
      book: 'Psalm',
      chapter: 46,
      verse: 10,
      text: 'Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.',
      reference: 'Psalm 46:10',
    },
    {
      book: 'Isaiah',
      chapter: 26,
      verse: 3,
      text: 'You will keep in perfect peace those whose minds are steadfast, because they trust in you.',
      reference: 'Isaiah 26:3',
    },
  ],
  love: [
    {
      book: 'John',
      chapter: 3,
      verse: 16,
      text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
      reference: 'John 3:16',
    },
    {
      book: '1 John',
      chapter: 4,
      verse: 19,
      text: 'We love because he first loved us.',
      reference: '1 John 4:19',
    },
    {
      book: 'Romans',
      chapter: 5,
      verse: 8,
      text: 'But God demonstrates his own love for us in this: While we were still sinners, Christ died for us.',
      reference: 'Romans 5:8',
    },
    {
      book: '1 Corinthians',
      chapter: 13,
      verse: 4,
      text: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud.',
      reference: '1 Corinthians 13:4',
    },
  ],
  wisdom: [
    {
      book: 'Proverbs',
      chapter: 3,
      verse: 5,
      text: 'Trust in the Lord with all your heart and lean not on your own understanding.',
      reference: 'Proverbs 3:5',
    },
    {
      book: 'James',
      chapter: 1,
      verse: 5,
      text: 'If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.',
      reference: 'James 1:5',
    },
    {
      book: 'Psalm',
      chapter: 119,
      verse: 105,
      text: 'Your word is a lamp for my feet, a light on my path.',
      reference: 'Psalm 119:105',
    },
    {
      book: 'Proverbs',
      chapter: 27,
      verse: 17,
      text: 'As iron sharpens iron, so one person sharpens another.',
      reference: 'Proverbs 27:17',
    },
  ],
  faith: [
    {
      book: 'Hebrews',
      chapter: 11,
      verse: 1,
      text: 'Now faith is confidence in what we hope for and assurance about what we do not see.',
      reference: 'Hebrews 11:1',
    },
    {
      book: 'Romans',
      chapter: 10,
      verse: 17,
      text: 'Consequently, faith comes from hearing the message, and the message is heard through the word about Christ.',
      reference: 'Romans 10:17',
    },
    {
      book: 'Matthew',
      chapter: 17,
      verse: 20,
      text: 'Truly I tell you, if you have faith as small as a mustard seed, you can say to this mountain, "Move from here to there," and it will move. Nothing will be impossible for you.',
      reference: 'Matthew 17:20',
    },
    {
      book: 'Ephesians',
      chapter: 2,
      verse: 8,
      text: 'For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God.',
      reference: 'Ephesians 2:8',
    },
  ],
  gratitude: [
    {
      book: '1 Thessalonians',
      chapter: 5,
      verse: 18,
      text: 'Give thanks in all circumstances; for this is God\'s will for you in Christ Jesus.',
      reference: '1 Thessalonians 5:18',
    },
    {
      book: 'Psalm',
      chapter: 100,
      verse: 4,
      text: 'Enter his gates with thanksgiving and his courts with praise; give thanks to him and praise his name.',
      reference: 'Psalm 100:4',
    },
    {
      book: 'Colossians',
      chapter: 3,
      verse: 17,
      text: 'And whatever you do, whether in word or deed, do it all in the name of the Lord Jesus, giving thanks to God the Father through him.',
      reference: 'Colossians 3:17',
    },
    {
      book: 'Philippians',
      chapter: 4,
      verse: 4,
      text: 'Rejoice in the Lord always. I will say it again: Rejoice!',
      reference: 'Philippians 4:4',
    },
  ],
};

export class CollectionService {
  private static instance: CollectionService;
  private db: IDBPDatabase<CollectionDB> | null = null;
  private readonly DB_NAME = 'HolyDropCollections';
  private readonly DB_VERSION = 1;
  
  public static getInstance(): CollectionService {
    if (!CollectionService.instance) {
      CollectionService.instance = new CollectionService();
    }
    return CollectionService.instance;
  }
  
  private async initDB(): Promise<IDBPDatabase<CollectionDB>> {
    if (this.db) return this.db;
    
    if (typeof window === 'undefined') {
      throw new Error('IndexedDB not available in server environment');
    }
    
    this.db = await openDB<CollectionDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // Collections store
        if (!db.objectStoreNames.contains('collections')) {
          db.createObjectStore('collections', { keyPath: 'id' });
        }
        
        // Share history store
        if (!db.objectStoreNames.contains('shareHistory')) {
          const shareHistoryStore = db.createObjectStore('shareHistory', { 
            keyPath: 'id',
            autoIncrement: true 
          });
          (shareHistoryStore as any).createIndex('collectionId', 'collectionId');
          (shareHistoryStore as any).createIndex('sharedAt', 'sharedAt');
        }
      },
    });
    
    return this.db;
  }
  
  async getCollection(id: string): Promise<Collection | null> {
    // Check if it's a preset collection
    const preset = PRESET_COLLECTIONS.find(p => p.id === id);
    if (preset) {
      return {
        ...preset,
        verses: PRESET_VERSES[id] || [],
      };
    }
    
    // Check user collections
    try {
      const db = await this.initDB();
      return await db.get('collections', id) || null;
    } catch (error) {
      console.error('Failed to get collection:', error);
      return null;
    }
  }
  
  async getAllCollections(): Promise<Collection[]> {
    const collections: Collection[] = [];
    
    // Add preset collections
    for (const preset of PRESET_COLLECTIONS) {
      collections.push({
        ...preset,
        verses: PRESET_VERSES[preset.id] || [],
      });
    }
    
    // Add user collections
    try {
      const db = await this.initDB();
      const userCollections = await db.getAll('collections');
      collections.push(...userCollections);
    } catch (error) {
      console.error('Failed to get user collections:', error);
    }
    
    return collections.sort((a, b) => {
      // Preset collections first, then by creation date
      if (a.isPreset && !b.isPreset) return -1;
      if (!a.isPreset && b.isPreset) return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }
  
  async createCollection(
    name: string,
    description: string,
    theme: string,
    icon: string,
    verses: Verse[] = []
  ): Promise<Collection> {
    const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const collection: Collection = {
      id,
      name,
      description,
      theme,
      icon,
      verses,
      isPreset: false,
      createdAt: new Date(),
    };
    
    try {
      const db = await this.initDB();
      await db.put('collections', collection);
      return collection;
    } catch (error) {
      console.error('Failed to create collection:', error);
      throw error;
    }
  }
  
  async updateCollection(id: string, updates: Partial<Collection>): Promise<Collection | null> {
    if (PRESET_COLLECTIONS.find(p => p.id === id)) {
      throw new Error('Cannot update preset collections');
    }
    
    try {
      const db = await this.initDB();
      const existing = await db.get('collections', id);
      if (!existing) return null;
      
      const updated = { ...existing, ...updates };
      await db.put('collections', updated);
      return updated;
    } catch (error) {
      console.error('Failed to update collection:', error);
      throw error;
    }
  }
  
  async deleteCollection(id: string): Promise<boolean> {
    if (PRESET_COLLECTIONS.find(p => p.id === id)) {
      throw new Error('Cannot delete preset collections');
    }
    
    try {
      const db = await this.initDB();
      await db.delete('collections', id);
      return true;
    } catch (error) {
      console.error('Failed to delete collection:', error);
      return false;
    }
  }
  
  async addVerseToCollection(collectionId: string, verse: Verse): Promise<boolean> {
    if (PRESET_COLLECTIONS.find(p => p.id === collectionId)) {
      throw new Error('Cannot modify preset collections');
    }
    
    try {
      const db = await this.initDB();
      const collection = await db.get('collections', collectionId);
      if (!collection) return false;
      
      // Check if verse already exists
      const exists = collection.verses.some(v => 
        v.book === verse.book && v.chapter === verse.chapter && v.verse === verse.verse
      );
      
      if (!exists) {
        collection.verses.push(verse);
        await db.put('collections', collection);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to add verse to collection:', error);
      return false;
    }
  }
  
  async removeVerseFromCollection(collectionId: string, verse: Verse): Promise<boolean> {
    if (PRESET_COLLECTIONS.find(p => p.id === collectionId)) {
      throw new Error('Cannot modify preset collections');
    }
    
    try {
      const db = await this.initDB();
      const collection = await db.get('collections', collectionId);
      if (!collection) return false;
      
      collection.verses = collection.verses.filter(v => 
        !(v.book === verse.book && v.chapter === verse.chapter && v.verse === verse.verse)
      );
      
      await db.put('collections', collection);
      return true;
    } catch (error) {
      console.error('Failed to remove verse from collection:', error);
      return false;
    }
  }
  
  async generateShareCode(collectionId: string): Promise<string> {
    const collection = await this.getCollection(collectionId);
    if (!collection) throw new Error('Collection not found');
    
    // Generate a short, shareable code
    const shareCode = `hd-${collectionId}-${Date.now().toString(36)}`;
    
    if (!collection.isPreset) {
      // Update user collection with share code
      await this.updateCollection(collectionId, { shareCode });
    }
    
    return shareCode;
  }
  
  async getCollectionByShareCode(shareCode: string): Promise<Collection | null> {
    // Extract collection ID from share code
    const parts = shareCode.split('-');
    if (parts.length < 2 || parts[0] !== 'hd') return null;
    
    const collectionId = parts[1];
    return await this.getCollection(collectionId);
  }
  
  async recordShare(collectionId: string, platform: string): Promise<void> {
    try {
      const db = await this.initDB();
      await db.add('shareHistory', {
        collectionId,
        platform,
        sharedAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to record share:', error);
    }
  }
  
  async getShareHistory(collectionId: string): Promise<Array<{platform: string; sharedAt: Date}>> {
    try {
      const db = await this.initDB();
      const history = await (db as any).getAllFromIndex('shareHistory', 'collectionId', collectionId);
      return history.map((h: any) => ({
        platform: h.platform,
        sharedAt: h.sharedAt,
      }));
    } catch (error) {
      console.error('Failed to get share history:', error);
      return [];
    }
  }
  
  // Get collections by theme
  async getCollectionsByTheme(theme: string): Promise<Collection[]> {
    const allCollections = await this.getAllCollections();
    return allCollections.filter(c => c.theme === theme);
  }
  
  // Search collections by name or description
  async searchCollections(query: string): Promise<Collection[]> {
    const allCollections = await this.getAllCollections();
    const lowerQuery = query.toLowerCase();
    
    return allCollections.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) ||
      c.description.toLowerCase().includes(lowerQuery) ||
      c.verses.some(v => 
        v.text.toLowerCase().includes(lowerQuery) ||
        v.reference.toLowerCase().includes(lowerQuery)
      )
    );
  }
}