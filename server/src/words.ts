import words from "./data/categorized_words.json";

export type WordCategory = "easy" | "medium" | "hard" | "normal";

// Helper to get the pool of words based on category
function getWordPool(category: WordCategory): string[] {
  if (category === "normal") {
    return [...words.easy, ...words.medium, ...words.hard];
  }
  return words[category];
}

/**
 * Returns a random word from a category, optionally excluding used words.
 * - category: which word list to pick from
 * - usedWords: Set of words that have already been used
 */
export function getRandomWord(
  category: WordCategory,
  usedWords: Set<string> = new Set()
): { word?: string } {
  const pool = getWordPool(category).filter(word => !usedWords.has(word));

  if (pool.length === 0) {
    const newpool = getWordPool("normal");
    const randomWord = newpool[Math.floor(Math.random() * newpool.length)];
    return { word: randomWord };  // ← drop the error, just silently fallback
}

  const randomWord = pool[Math.floor(Math.random() * pool.length)];
  return { word: randomWord };
}
