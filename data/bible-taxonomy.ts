export const BIBLE_TAXONOMY = {
  // Life Situations - What people actually search for
  lifeSituations: {
    anxiety: {
      keywords: ['anxious', 'worried', 'worry', 'fear', 'afraid', 'troubled', 'distressed', 'panic', 'overwhelmed', 'stress', 'nervous'],
      relatedVerses: ['philippians-4-6', 'matthew-6-25', '1-peter-5-7', 'isaiah-41-10', 'psalm-23-4'],
      relatedTopics: ['peace', 'trust', 'fear-not', 'faith', 'comfort'],
      commonSearches: ['anxiety attack', 'worried about future', 'fear and anxiety', 'stop worrying', 'anxious thoughts']
    },
    depression: {
      keywords: ['sad', 'sadness', 'sorrow', 'despair', 'downcast', 'dejected', 'mourning', 'grief', 'hopeless', 'empty', 'darkness'],
      relatedVerses: ['psalm-34-18', 'isaiah-61-3', '2-corinthians-1-3', 'psalm-42-11', 'romans-8-28'],
      relatedTopics: ['hope', 'joy', 'comfort', 'healing', 'restoration'],
      commonSearches: ['feeling depressed', 'lost hope', 'deep sadness', 'broken heart', 'emotional pain']
    },
    relationships: {
      keywords: ['marriage', 'wife', 'husband', 'friend', 'friendship', 'family', 'children', 'parents', 'love', 'dating', 'spouse'],
      relatedVerses: ['1-corinthians-13-4', 'ephesians-5-25', 'proverbs-17-17', 'colossians-3-19', 'ephesians-6-1'],
      relatedTopics: ['love', 'forgiveness', 'unity', 'communication', 'marriage'],
      commonSearches: ['marriage problems', 'friendship advice', 'family conflict', 'parenting help', 'relationship issues']
    },
    financial: {
      keywords: ['money', 'debt', 'poor', 'rich', 'wealth', 'provision', 'lack', 'need', 'poverty', 'tithe', 'giving', 'finances'],
      relatedVerses: ['philippians-4-19', 'matthew-6-26', 'malachi-3-10', 'proverbs-22-7', '2-corinthians-9-7'],
      relatedTopics: ['provision', 'contentment', 'stewardship', 'generosity', 'trust'],
      commonSearches: ['financial struggles', 'money problems', 'debt help', 'provision verses', 'tithing guidance']
    },
    guidance: {
      keywords: ['direction', 'decision', 'path', 'way', 'guide', 'lead', 'wisdom', 'choice', 'confused', 'will', 'purpose'],
      relatedVerses: ['proverbs-3-5', 'psalm-119-105', 'jeremiah-29-11', 'james-1-5', 'romans-8-28'],
      relatedTopics: ['wisdom', 'prayer', 'trust', 'gods-will', 'purpose'],
      commonSearches: ['need direction', 'making decisions', 'gods will', 'life purpose', 'seeking guidance']
    },
    healing: {
      keywords: ['sick', 'illness', 'disease', 'heal', 'healing', 'health', 'pain', 'suffering', 'cure', 'medicine', 'doctor'],
      relatedVerses: ['james-5-14', 'psalm-103-3', 'jeremiah-30-17', '1-peter-2-24', 'matthew-8-17'],
      relatedTopics: ['faith', 'prayer', 'miracles', 'restoration', 'hope'],
      commonSearches: ['prayers for healing', 'sick family member', 'chronic illness', 'healing scriptures', 'divine healing']
    },
    addiction: {
      keywords: ['addiction', 'temptation', 'struggle', 'bondage', 'freedom', 'chains', 'slave', 'overcome', 'habit', 'addiction'],
      relatedVerses: ['1-corinthians-10-13', 'galatians-5-1', 'john-8-36', '2-corinthians-5-17', 'romans-6-14'],
      relatedTopics: ['freedom', 'strength', 'self-control', 'deliverance', 'new-life'],
      commonSearches: ['overcoming addiction', 'breaking free', 'temptation help', 'freedom from bondage', 'deliverance']
    },
    grief: {
      keywords: ['death', 'loss', 'mourn', 'weep', 'tears', 'bereaved', 'widow', 'orphan', 'grave', 'funeral', 'sorrow'],
      relatedVerses: ['psalm-23-4', 'revelation-21-4', '1-thessalonians-4-13', 'psalm-34-18', 'matthew-5-4'],
      relatedTopics: ['comfort', 'hope', 'eternal-life', 'resurrection', 'peace'],
      commonSearches: ['dealing with death', 'lost loved one', 'grieving process', 'comfort in loss', 'heaven verses']
    },
    forgiveness: {
      keywords: ['forgive', 'forgiveness', 'forgiven', 'mercy', 'pardon', 'cleanse', 'guilt', 'shame', 'sin', 'repent'],
      relatedVerses: ['1-john-1-9', 'ephesians-4-32', 'matthew-6-14', 'colossians-3-13', 'psalm-103-12'],
      relatedTopics: ['grace', 'mercy', 'redemption', 'cleansing', 'restoration'],
      commonSearches: ['how to forgive', 'god forgives', 'forgiveness verses', 'letting go', 'forgiving others']
    },
    loneliness: {
      keywords: ['lonely', 'alone', 'isolated', 'abandoned', 'forsaken', 'solitude', 'companionship', 'friends'],
      relatedVerses: ['hebrews-13-5', 'psalm-68-6', 'matthew-28-20', 'deuteronomy-31-6', 'psalm-27-10'],
      relatedTopics: ['gods-presence', 'comfort', 'companionship', 'fellowship', 'never-alone'],
      commonSearches: ['feeling lonely', 'god with me', 'never alone', 'loneliness comfort', 'finding friends']
    },
    work: {
      keywords: ['work', 'job', 'employment', 'career', 'labor', 'workplace', 'boss', 'coworker', 'unemployed', 'business'],
      relatedVerses: ['colossians-3-23', 'proverbs-14-23', 'ecclesiastes-3-13', '1-thessalonians-4-11', 'genesis-2-15'],
      relatedTopics: ['diligence', 'integrity', 'service', 'stewardship', 'excellence'],
      commonSearches: ['work ethics', 'job search', 'workplace problems', 'career guidance', 'work purpose']
    },
    doubt: {
      keywords: ['doubt', 'doubting', 'uncertain', 'question', 'skeptical', 'unbelief', 'faith', 'trust', 'confused'],
      relatedVerses: ['james-1-6', 'mark-9-24', 'john-20-27', 'romans-10-17', 'hebrews-11-1'],
      relatedTopics: ['faith', 'trust', 'belief', 'certainty', 'evidence'],
      commonSearches: ['struggling with doubt', 'faith questions', 'believing god', 'overcoming doubt', 'faith vs doubt']
    },
    anger: {
      keywords: ['angry', 'anger', 'rage', 'fury', 'wrath', 'mad', 'irritated', 'frustrated', 'temper', 'hatred'],
      relatedVerses: ['ephesians-4-26', 'james-1-19', 'proverbs-15-1', 'colossians-3-8', 'psalm-37-8'],
      relatedTopics: ['self-control', 'patience', 'peace', 'forgiveness', 'love'],
      commonSearches: ['controlling anger', 'anger management', 'righteous anger', 'dealing with rage', 'calm spirit']
    },
    pride: {
      keywords: ['pride', 'proud', 'arrogant', 'boastful', 'humble', 'humility', 'ego', 'self-righteous', 'conceited'],
      relatedVerses: ['proverbs-16-18', 'james-4-6', '1-peter-5-6', 'philippians-2-3', 'proverbs-11-2'],
      relatedTopics: ['humility', 'character', 'wisdom', 'righteousness', 'modesty'],
      commonSearches: ['overcoming pride', 'humility verses', 'pride goes before fall', 'being humble', 'lowering pride']
    },
    patience: {
      keywords: ['patience', 'patient', 'wait', 'waiting', 'endurance', 'perseverance', 'longsuffering', 'steadfast'],
      relatedVerses: ['psalm-27-14', 'romans-8-25', 'james-5-7', 'galatians-6-9', 'isaiah-40-31'],
      relatedTopics: ['endurance', 'trust', 'faith', 'perseverance', 'hope'],
      commonSearches: ['learning patience', 'waiting on god', 'endurance verses', 'patient waiting', 'gods timing']
    },
    jealousy: {
      keywords: ['jealous', 'jealousy', 'envy', 'envious', 'covet', 'coveting', 'resentment', 'comparison'],
      relatedVerses: ['1-corinthians-13-4', 'james-3-16', 'proverbs-14-30', 'galatians-5-26', 'exodus-20-17'],
      relatedTopics: ['contentment', 'love', 'peace', 'gratitude', 'comparison'],
      commonSearches: ['overcoming jealousy', 'dealing with envy', 'contentment verses', 'stop comparing', 'jealousy help']
    },
    parenting: {
      keywords: ['children', 'child', 'parent', 'parenting', 'discipline', 'train', 'teach', 'raise', 'kids', 'family'],
      relatedVerses: ['proverbs-22-6', 'ephesians-6-4', 'deuteronomy-6-7', 'proverbs-13-24', 'psalm-127-3'],
      relatedTopics: ['family', 'training', 'discipline', 'love', 'wisdom'],
      commonSearches: ['parenting advice', 'disciplining children', 'raising kids', 'family values', 'child training']
    },
    persecution: {
      keywords: ['persecution', 'persecuted', 'suffering', 'trial', 'tribulation', 'oppression', 'affliction', 'hardship'],
      relatedVerses: ['matthew-5-10', '2-timothy-3-12', '1-peter-4-16', 'romans-8-35', 'john-15-20'],
      relatedTopics: ['suffering', 'endurance', 'faith', 'courage', 'reward'],
      commonSearches: ['facing persecution', 'suffering for faith', 'enduring hardship', 'trial verses', 'persecution comfort']
    },
    justice: {
      keywords: ['justice', 'just', 'fair', 'fairness', 'righteous', 'righteousness', 'judgment', 'equity', 'oppression'],
      relatedVerses: ['micah-6-8', 'psalm-89-14', 'isaiah-1-17', 'amos-5-24', 'proverbs-21-15'],
      relatedTopics: ['righteousness', 'mercy', 'fairness', 'gods-character', 'social-justice'],
      commonSearches: ['biblical justice', 'gods justice', 'social justice', 'righteousness verses', 'fair treatment']
    },
    temptation: {
      keywords: ['temptation', 'tempted', 'lust', 'desire', 'flesh', 'sin', 'resist', 'overcome', 'struggle'],
      relatedVerses: ['1-corinthians-10-13', 'james-1-14', 'matthew-26-41', 'hebrews-4-15', '1-john-2-16'],
      relatedTopics: ['resistance', 'strength', 'prayer', 'spirit', 'victory'],
      commonSearches: ['resisting temptation', 'overcoming lust', 'temptation help', 'spiritual warfare', 'sin struggle']
    }
  },
  
  // Theological Concepts
  theology: {
    salvation: {
      keywords: ['saved', 'salvation', 'redeemed', 'redemption', 'forgiven', 'eternal life', 'born again', 'gospel', 'grace'],
      relatedVerses: ['john-3-16', 'romans-10-9', 'ephesians-2-8', 'acts-16-31', '2-corinthians-5-17'],
      importance: 'core',
      difficulty: 'beginner'
    },
    grace: {
      keywords: ['grace', 'unmerited favor', 'gift', 'freely given', 'undeserved', 'mercy', 'kindness'],
      relatedVerses: ['ephesians-2-8', 'romans-3-24', '2-corinthians-12-9', 'titus-2-11', 'hebrews-4-16'],
      importance: 'core',
      difficulty: 'intermediate'
    },
    trinity: {
      keywords: ['trinity', 'triune', 'father son spirit', 'three in one', 'godhead', 'divine nature'],
      relatedVerses: ['matthew-28-19', '2-corinthians-13-14', '1-john-5-7', 'john-1-1', 'acts-5-3'],
      importance: 'core',
      difficulty: 'advanced'
    },
    faith: {
      keywords: ['faith', 'believe', 'trust', 'confidence', 'assurance', 'belief', 'faithful'],
      relatedVerses: ['hebrews-11-1', 'romans-10-17', 'ephesians-2-8', 'mark-11-22', 'james-2-17'],
      importance: 'core',
      difficulty: 'beginner'
    },
    love: {
      keywords: ['love', 'loves', 'loved', 'loving', 'charity', 'affection', 'beloved', 'agape'],
      relatedVerses: ['1-john-4-8', '1-corinthians-13', 'john-3-16', 'romans-5-8', 'matthew-22-37'],
      importance: 'core',
      difficulty: 'beginner'
    },
    holiness: {
      keywords: ['holy', 'holiness', 'sanctified', 'sanctification', 'pure', 'righteous', 'set apart', 'consecrated'],
      relatedVerses: ['1-peter-1-16', 'hebrews-12-14', '1-thessalonians-4-3', 'leviticus-20-26', '2-corinthians-7-1'],
      importance: 'core',
      difficulty: 'intermediate'
    },
    prayer: {
      keywords: ['pray', 'prayer', 'intercession', 'petition', 'supplication', 'worship', 'communion'],
      relatedVerses: ['1-thessalonians-5-17', 'philippians-4-6', 'matthew-6-9', 'james-5-16', '1-john-5-14'],
      importance: 'essential',
      difficulty: 'beginner'
    },
    worship: {
      keywords: ['worship', 'praise', 'adoration', 'glory', 'honor', 'magnify', 'exalt', 'reverence'],
      relatedVerses: ['john-4-24', 'psalm-95-6', 'revelation-4-11', 'romans-12-1', 'hebrews-13-15'],
      importance: 'essential',
      difficulty: 'beginner'
    },
    prophecy: {
      keywords: ['prophecy', 'prophet', 'prophetic', 'vision', 'revelation', 'foretell', 'predict'],
      relatedVerses: ['2-peter-1-21', '1-corinthians-14-1', 'amos-3-7', 'revelation-1-3', 'daniel-2-28'],
      importance: 'important',
      difficulty: 'advanced'
    },
    judgment: {
      keywords: ['judgment', 'judge', 'condemnation', 'verdict', 'justice', 'tribunal', 'court'],
      relatedVerses: ['hebrews-9-27', '2-corinthians-5-10', 'romans-14-10', 'revelation-20-12', 'matthew-25-31'],
      importance: 'important',
      difficulty: 'intermediate'
    }
  },
  
  // Character Traits & Virtues (Fruit of the Spirit + Biblical Virtues)
  character: {
    love: {
      keywords: ['love', 'loves', 'loved', 'loving', 'charity', 'affection', 'beloved', 'agape'],
      relatedVerses: ['1-corinthians-13', 'john-3-16', '1-john-4-8', 'romans-5-8', 'matthew-22-37'],
      fruitOfSpirit: true,
      category: 'essential'
    },
    joy: {
      keywords: ['joy', 'joyful', 'rejoice', 'gladness', 'happiness', 'cheerful', 'delight'],
      relatedVerses: ['philippians-4-4', 'nehemiah-8-10', 'psalm-16-11', 'john-15-11', '1-thessalonians-5-16'],
      fruitOfSpirit: true,
      category: 'essential'
    },
    peace: {
      keywords: ['peace', 'peaceful', 'calm', 'tranquil', 'serenity', 'harmony', 'rest'],
      relatedVerses: ['john-14-27', 'philippians-4-7', 'romans-5-1', 'isaiah-26-3', 'colossians-3-15'],
      fruitOfSpirit: true,
      category: 'essential'
    },
    patience: {
      keywords: ['patient', 'patience', 'endurance', 'perseverance', 'longsuffering', 'steadfast', 'wait'],
      relatedVerses: ['1-corinthians-13-4', 'galatians-5-22', 'james-5-7', 'romans-8-25', 'psalm-27-14'],
      fruitOfSpirit: true,
      category: 'character'
    },
    kindness: {
      keywords: ['kind', 'kindness', 'gentle', 'compassionate', 'tender', 'merciful', 'caring'],
      relatedVerses: ['ephesians-4-32', 'colossians-3-12', '1-corinthians-13-4', 'galatians-5-22', '2-peter-1-7'],
      fruitOfSpirit: true,
      category: 'character'
    },
    goodness: {
      keywords: ['good', 'goodness', 'righteous', 'virtuous', 'moral', 'excellent', 'noble'],
      relatedVerses: ['galatians-5-22', 'romans-15-14', 'ephesians-5-9', '2-thessalonians-1-11', 'psalm-23-6'],
      fruitOfSpirit: true,
      category: 'character'
    },
    faithfulness: {
      keywords: ['faithful', 'faithfulness', 'reliable', 'trustworthy', 'dependable', 'loyal', 'steadfast'],
      relatedVerses: ['1-corinthians-4-2', 'galatians-5-22', 'proverbs-3-3', 'lamentations-3-23', 'revelation-2-10'],
      fruitOfSpirit: true,
      category: 'character'
    },
    gentleness: {
      keywords: ['gentle', 'gentleness', 'meek', 'meekness', 'humble', 'mild', 'tender'],
      relatedVerses: ['galatians-5-23', 'matthew-5-5', '1-peter-3-4', 'philippians-4-5', 'galatians-6-1'],
      fruitOfSpirit: true,
      category: 'character'
    },
    selfControl: {
      keywords: ['self-control', 'temperance', 'discipline', 'restraint', 'moderation', 'self-discipline'],
      relatedVerses: ['galatians-5-23', '1-corinthians-9-25', '2-peter-1-6', 'proverbs-25-28', 'titus-2-2'],
      fruitOfSpirit: true,
      category: 'character'
    },
    wisdom: {
      keywords: ['wise', 'wisdom', 'understanding', 'discernment', 'knowledge', 'prudent', 'intelligent'],
      relatedVerses: ['james-1-5', 'proverbs-3-13', '1-corinthians-1-30', 'colossians-3-16', 'ecclesiastes-7-12'],
      fruitOfSpirit: false,
      category: 'essential'
    },
    courage: {
      keywords: ['courage', 'courageous', 'brave', 'bold', 'fearless', 'strong', 'valiant'],
      relatedVerses: ['joshua-1-9', '1-corinthians-16-13', 'psalm-27-14', 'deuteronomy-31-6', '2-timothy-1-7'],
      fruitOfSpirit: false,
      category: 'character'
    },
    integrity: {
      keywords: ['integrity', 'honest', 'truth', 'truthful', 'upright', 'sincere', 'genuine'],
      relatedVerses: ['proverbs-10-9', 'psalm-25-21', 'proverbs-11-3', '1-chronicles-29-17', 'titus-2-7'],
      fruitOfSpirit: false,
      category: 'character'
    }
  },
  
  // Biblical Events & Stories
  events: {
    creation: {
      keywords: ['creation', 'beginning', 'created', 'made', 'formed', 'genesis', 'adam', 'eve', 'garden'],
      books: ['Genesis'],
      chapters: ['Genesis 1', 'Genesis 2'],
      timeframe: 'beginning'
    },
    fall: {
      keywords: ['fall', 'sin', 'disobedience', 'serpent', 'forbidden', 'tree', 'knowledge', 'evil'],
      books: ['Genesis'],
      chapters: ['Genesis 3'],
      timeframe: 'beginning'
    },
    flood: {
      keywords: ['flood', 'noah', 'ark', 'rain', 'covenant', 'rainbow', 'animals', 'dove'],
      books: ['Genesis'],
      chapters: ['Genesis 6', 'Genesis 7', 'Genesis 8', 'Genesis 9'],
      timeframe: 'patriarchs'
    },
    exodus: {
      keywords: ['exodus', 'egypt', 'pharaoh', 'moses', 'plagues', 'passover', 'red sea', 'wilderness'],
      books: ['Exodus'],
      chapters: ['Exodus 1-15'],
      timeframe: 'moses'
    },
    sinai: {
      keywords: ['sinai', 'commandments', 'law', 'moses', 'mountain', 'covenant', 'tablets'],
      books: ['Exodus', 'Deuteronomy'],
      chapters: ['Exodus 19-20', 'Deuteronomy 5'],
      timeframe: 'moses'
    },
    conquest: {
      keywords: ['conquest', 'canaan', 'joshua', 'promised land', 'jericho', 'battles', 'inheritance'],
      books: ['Joshua'],
      chapters: ['Joshua 1-12'],
      timeframe: 'joshua'
    },
    exile: {
      keywords: ['exile', 'babylon', 'captivity', 'deportation', 'nebuchadnezzar', 'daniel', 'jerusalem'],
      books: ['2 Kings', 'Jeremiah', 'Daniel', 'Ezekiel'],
      chapters: ['2 Kings 25', 'Jeremiah 52'],
      timeframe: 'exile'
    },
    return: {
      keywords: ['return', 'restoration', 'rebuild', 'temple', 'ezra', 'nehemiah', 'cyrus'],
      books: ['Ezra', 'Nehemiah'],
      chapters: ['Ezra 1-6', 'Nehemiah 1-6'],
      timeframe: 'return'
    },
    incarnation: {
      keywords: ['incarnation', 'birth', 'jesus', 'mary', 'bethlehem', 'virgin', 'emmanuel', 'christmas'],
      books: ['Matthew', 'Luke'],
      chapters: ['Matthew 1-2', 'Luke 1-2'],
      timeframe: 'jesus'
    },
    crucifixion: {
      keywords: ['crucifixion', 'cross', 'death', 'sacrifice', 'calvary', 'golgotha', 'jesus', 'crucified'],
      books: ['Matthew', 'Mark', 'Luke', 'John'],
      chapters: ['Matthew 27', 'Mark 15', 'Luke 23', 'John 19'],
      timeframe: 'jesus'
    },
    resurrection: {
      keywords: ['resurrection', 'risen', 'empty tomb', 'easter', 'victory', 'alive', 'appeared'],
      books: ['Matthew', 'Mark', 'Luke', 'John'],
      chapters: ['Matthew 28', 'Mark 16', 'Luke 24', 'John 20'],
      timeframe: 'jesus'
    },
    pentecost: {
      keywords: ['pentecost', 'holy spirit', 'tongues', 'fire', 'wind', 'peter', 'preaching'],
      books: ['Acts'],
      chapters: ['Acts 2'],
      timeframe: 'early-church'
    }
  },
  
  // Book metadata with enhanced information
  bookMetadata: {
    // Old Testament
    genesis: { genre: 'law', author: 'Moses', testament: 'old', chapters: 50, themes: ['creation', 'covenant', 'promise'], difficulty: 'beginner' },
    exodus: { genre: 'law', author: 'Moses', testament: 'old', chapters: 40, themes: ['deliverance', 'law', 'covenant'], difficulty: 'beginner' },
    leviticus: { genre: 'law', author: 'Moses', testament: 'old', chapters: 27, themes: ['holiness', 'sacrifice', 'priesthood'], difficulty: 'advanced' },
    numbers: { genre: 'law', author: 'Moses', testament: 'old', chapters: 36, themes: ['wilderness', 'faithfulness', 'obedience'], difficulty: 'intermediate' },
    deuteronomy: { genre: 'law', author: 'Moses', testament: 'old', chapters: 34, themes: ['covenant', 'obedience', 'blessing'], difficulty: 'intermediate' },
    joshua: { genre: 'history', author: 'Joshua', testament: 'old', chapters: 24, themes: ['conquest', 'faith', 'leadership'], difficulty: 'beginner' },
    judges: { genre: 'history', author: 'Unknown', testament: 'old', chapters: 21, themes: ['cycle', 'deliverance', 'leadership'], difficulty: 'intermediate' },
    ruth: { genre: 'history', author: 'Unknown', testament: 'old', chapters: 4, themes: ['loyalty', 'redemption', 'love'], difficulty: 'beginner' },
    '1-samuel': { genre: 'history', author: 'Samuel/Unknown', testament: 'old', chapters: 31, themes: ['leadership', 'kingship', 'obedience'], difficulty: 'beginner' },
    '2-samuel': { genre: 'history', author: 'Unknown', testament: 'old', chapters: 24, themes: ['david', 'kingdom', 'covenant'], difficulty: 'beginner' },
    '1-kings': { genre: 'history', author: 'Unknown', testament: 'old', chapters: 22, themes: ['kingdom', 'temple', 'wisdom'], difficulty: 'intermediate' },
    '2-kings': { genre: 'history', author: 'Unknown', testament: 'old', chapters: 25, themes: ['kingdom', 'exile', 'judgment'], difficulty: 'intermediate' },
    psalms: { genre: 'poetry', author: 'David/Various', testament: 'old', chapters: 150, themes: ['worship', 'prayer', 'praise'], difficulty: 'beginner' },
    proverbs: { genre: 'wisdom', author: 'Solomon/Various', testament: 'old', chapters: 31, themes: ['wisdom', 'character', 'practical'], difficulty: 'beginner' },
    ecclesiastes: { genre: 'wisdom', author: 'Solomon', testament: 'old', chapters: 12, themes: ['meaning', 'vanity', 'wisdom'], difficulty: 'advanced' },
    'song-of-solomon': { genre: 'poetry', author: 'Solomon', testament: 'old', chapters: 8, themes: ['love', 'romance', 'devotion'], difficulty: 'intermediate' },
    isaiah: { genre: 'prophecy', author: 'Isaiah', testament: 'old', chapters: 66, themes: ['messiah', 'judgment', 'comfort'], difficulty: 'intermediate' },
    jeremiah: { genre: 'prophecy', author: 'Jeremiah', testament: 'old', chapters: 52, themes: ['judgment', 'new covenant', 'restoration'], difficulty: 'intermediate' },
    daniel: { genre: 'prophecy', author: 'Daniel', testament: 'old', chapters: 12, themes: ['prophecy', 'sovereignty', 'faithfulness'], difficulty: 'advanced' },
    
    // New Testament  
    matthew: { genre: 'gospel', author: 'Matthew', testament: 'new', chapters: 28, themes: ['kingdom', 'messiah', 'teaching'], difficulty: 'beginner' },
    mark: { genre: 'gospel', author: 'Mark', testament: 'new', chapters: 16, themes: ['action', 'servant', 'miracles'], difficulty: 'beginner' },
    luke: { genre: 'gospel', author: 'Luke', testament: 'new', chapters: 24, themes: ['salvation', 'compassion', 'history'], difficulty: 'beginner' },
    john: { genre: 'gospel', author: 'John', testament: 'new', chapters: 21, themes: ['deity', 'belief', 'eternal-life'], difficulty: 'beginner' },
    acts: { genre: 'history', author: 'Luke', testament: 'new', chapters: 28, themes: ['church', 'missions', 'holy-spirit'], difficulty: 'beginner' },
    romans: { genre: 'epistle', author: 'Paul', testament: 'new', chapters: 16, themes: ['salvation', 'righteousness', 'grace'], difficulty: 'intermediate' },
    '1-corinthians': { genre: 'epistle', author: 'Paul', testament: 'new', chapters: 16, themes: ['unity', 'gifts', 'love'], difficulty: 'intermediate' },
    '2-corinthians': { genre: 'epistle', author: 'Paul', testament: 'new', chapters: 13, themes: ['ministry', 'suffering', 'comfort'], difficulty: 'intermediate' },
    galatians: { genre: 'epistle', author: 'Paul', testament: 'new', chapters: 6, themes: ['freedom', 'grace', 'spirit'], difficulty: 'intermediate' },
    ephesians: { genre: 'epistle', author: 'Paul', testament: 'new', chapters: 6, themes: ['church', 'unity', 'spiritual-warfare'], difficulty: 'intermediate' },
    philippians: { genre: 'epistle', author: 'Paul', testament: 'new', chapters: 4, themes: ['joy', 'humility', 'contentment'], difficulty: 'beginner' },
    colossians: { genre: 'epistle', author: 'Paul', testament: 'new', chapters: 4, themes: ['christ', 'supremacy', 'new-life'], difficulty: 'intermediate' },
    '1-thessalonians': { genre: 'epistle', author: 'Paul', testament: 'new', chapters: 5, themes: ['second-coming', 'holy-living', 'comfort'], difficulty: 'beginner' },
    '1-timothy': { genre: 'epistle', author: 'Paul', testament: 'new', chapters: 6, themes: ['leadership', 'doctrine', 'conduct'], difficulty: 'intermediate' },
    '2-timothy': { genre: 'epistle', author: 'Paul', testament: 'new', chapters: 4, themes: ['endurance', 'scripture', 'ministry'], difficulty: 'intermediate' },
    titus: { genre: 'epistle', author: 'Paul', testament: 'new', chapters: 3, themes: ['good-works', 'leadership', 'grace'], difficulty: 'intermediate' },
    hebrews: { genre: 'epistle', author: 'Unknown', testament: 'new', chapters: 13, themes: ['superiority', 'faith', 'perseverance'], difficulty: 'advanced' },
    james: { genre: 'epistle', author: 'James', testament: 'new', chapters: 5, themes: ['practical-faith', 'works', 'wisdom'], difficulty: 'beginner' },
    '1-peter': { genre: 'epistle', author: 'Peter', testament: 'new', chapters: 5, themes: ['suffering', 'hope', 'holiness'], difficulty: 'intermediate' },
    '2-peter': { genre: 'epistle', author: 'Peter', testament: 'new', chapters: 3, themes: ['false-teachers', 'knowledge', 'second-coming'], difficulty: 'advanced' },
    '1-john': { genre: 'epistle', author: 'John', testament: 'new', chapters: 5, themes: ['love', 'assurance', 'fellowship'], difficulty: 'beginner' },
    jude: { genre: 'epistle', author: 'Jude', testament: 'new', chapters: 1, themes: ['contending', 'apostasy', 'perseverance'], difficulty: 'advanced' },
    revelation: { genre: 'apocalyptic', author: 'John', testament: 'new', chapters: 22, themes: ['prophecy', 'victory', 'worship'], difficulty: 'advanced' }
  }
};

// Common typos and corrections
export const TYPO_CORRECTIONS: Record<string, string> = {
  // Book names
  'pslams': 'psalms',
  'salms': 'psalms',
  'genisis': 'genesis',
  'geneses': 'genesis',
  'revelations': 'revelation',
  'revelation': 'revelation',
  'corintheans': 'corinthians',
  'corinthians': 'corinthians',
  'phillipians': 'philippians',
  'philippians': 'philippians',
  'ephesians': 'ephesians',
  'ephesans': 'ephesians',
  'collossians': 'colossians',
  'collosians': 'colossians',
  'thessalonians': 'thessalonians',
  'thesalonians': 'thessalonians',
  'hebrews': 'hebrews',
  'hebrues': 'hebrews',
  'leviticus': 'leviticus',
  'levitcus': 'leviticus',
  'deuteronomy': 'deuteronomy',
  'duteronomy': 'deuteronomy',
  'ecclesiastes': 'ecclesiastes',
  'ecclesiates': 'ecclesiastes',
  'lamentations': 'lamentations',
  'lametations': 'lamentations',
  
  // Common words
  'jesus': 'jesus',
  'jeasus': 'jesus',
  'christ': 'christ',
  'cristh': 'christ',
  'god': 'god',
  'lord': 'lord',
  'lrod': 'lord',
  'holy': 'holy',
  'holi': 'holy',
  'spirit': 'spirit',
  'spiritt': 'spirit',
  'heaven': 'heaven',
  'hevan': 'heaven',
  'prayer': 'prayer',
  'prair': 'prayer',
  'faith': 'faith',
  'fath': 'faith',
  'love': 'love',
  'luv': 'love',
  'peace': 'peace',
  'pease': 'peace',
  'forgiveness': 'forgiveness',
  'forgivness': 'forgiveness',
  'salvation': 'salvation',
  'salvaton': 'salvation',
  'strength': 'strength',
  'strenght': 'strength',
  'wisdom': 'wisdom',
  'wisdome': 'wisdom',
  'guidance': 'guidance',
  'guidnce': 'guidance',
  'healing': 'healing',
  'heeling': 'healing',
  'comfort': 'comfort',
  'comfrot': 'comfort',
  'anxiety': 'anxiety',
  'anxeity': 'anxiety',
  'worry': 'worry',
  'wory': 'worry',
  'fear': 'fear',
  'feer': 'fear',
  'hope': 'hope',
  'hoop': 'hope',
  'trust': 'trust',
  'turst': 'trust',
  'blessing': 'blessing',
  'blesing': 'blessing',
  'miracle': 'miracle',
  'miricle': 'miracle'
};

// Search operators and patterns
export const SEARCH_PATTERNS = {
  verseReference: /(\d?\s*)?([A-Za-z]+)\s+(\d+)(?::(\d+)(?:-(\d+))?)?/,
  bookRange: /([A-Za-z]+)\s+(\d+)-(\d+)/,
  quotedPhrase: /"([^"]+)"/g,
  nearOperator: /(\w+)\s+NEAR\s+(\w+)/i,
  notOperator: /NOT\s+(\w+)/i,
  andOperator: /(\w+)\s+AND\s+(\w+)/i,
  orOperator: /(\w+)\s+OR\s+(\w+)/i,
  topicQuery: /^(verses?\s+)?(about|on|regarding|for)\s+(.+)/i,
  questionQuery: /^(what|how|when|where|why|who)\s+/i,
  speakerQuery: /(jesus|christ|god|lord|paul|david|moses|peter|john)\s+(said|says|spoke|tells|commands)/i,
  emotionQuery: /^(i\s+am|i\s+feel|feeling|when\s+i)\s+/i,
  situationQuery: /^(help\s+with|dealing\s+with|struggling\s+with|going\s+through)\s+/i
};

// Semantic relationship mappings
export const SEMANTIC_RELATIONSHIPS = {
  synonyms: {
    'scared': ['afraid', 'fearful', 'frightened', 'terrified'],
    'sad': ['depressed', 'sorrowful', 'grief', 'mourning'],
    'happy': ['joyful', 'glad', 'rejoice', 'cheerful'],
    'angry': ['mad', 'furious', 'rage', 'wrath'],
    'worried': ['anxious', 'troubled', 'concerned', 'distressed'],
    'sick': ['ill', 'diseased', 'unwell', 'afflicted'],
    'poor': ['needy', 'lacking', 'impoverished', 'destitute'],
    'rich': ['wealthy', 'prosperous', 'abundant', 'blessed'],
    'help': ['aid', 'assistance', 'support', 'rescue'],
    'guide': ['direct', 'lead', 'show', 'teach']
  },
  
  antonyms: {
    'fear': ['courage', 'bravery', 'boldness'],
    'hate': ['love', 'compassion', 'kindness'],
    'despair': ['hope', 'faith', 'confidence'],
    'darkness': ['light', 'brightness', 'illumination'],
    'death': ['life', 'resurrection', 'eternal-life'],
    'sin': ['righteousness', 'holiness', 'purity'],
    'curse': ['blessing', 'favor', 'grace'],
    'bondage': ['freedom', 'liberty', 'deliverance']
  },
  
  conceptualRelationships: {
    'marriage': ['husband', 'wife', 'spouse', 'family', 'love', 'unity'],
    'parenting': ['children', 'discipline', 'training', 'wisdom', 'love'],
    'leadership': ['authority', 'responsibility', 'service', 'humility', 'wisdom'],
    'worship': ['praise', 'adoration', 'reverence', 'honor', 'glory'],
    'mission': ['evangelism', 'witness', 'gospel', 'salvation', 'discipleship']
  }
};