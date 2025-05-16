import Papa from 'papaparse';
import type { Word } from '../types/types';

// Load CSV file and parse it
export const loadWordsFromCSV = async (bypassCache: boolean = false): Promise<Word[]> => {
    try {
        // Add cache busting parameter if needed
        const cacheBuster = bypassCache ? `?nocache=${Date.now()}` : '';

        const response = await fetch(`/src/data/words.csv${cacheBuster}`);
        // If fetching from the bundler fails, try the public folder
        if (!response.ok) {
            const publicResponse = await fetch(`/words.csv${cacheBuster}`);
            if (!publicResponse.ok) {
                throw new Error('Failed to load words CSV file');
            }
            const csvText = await publicResponse.text();
            return parseCsvText(csvText);
        }

        const csvText = await response.text();
        return parseCsvText(csvText);
    } catch (error) {
        console.error('Error loading words:', error);

        // Fallback to local mock data for development/testing
        return [
            { word_english: 'apple', word_hebrew: 'תפוח', description_en: 'A round fruit' },
            { word_english: 'book', word_hebrew: 'ספר', description_en: 'A set of printed pages' },
            { word_english: 'cat', word_hebrew: 'חתול', description_en: 'A small domesticated carnivorous mammal' },
        ];
    }
};

// Parse CSV text into Word objects
const parseCsvText = (csvText: string): Word[] => {
    const result = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
    });

    return result.data as Word[];
};

// Get words between start and end indices
export const getWordsInRange = (words: Word[], startIndex: number, endIndex: number): Word[] => {
    // Make sure indices are valid
    const validStart = Math.max(0, startIndex);
    const validEnd = Math.min(words.length, endIndex);

    console.log(`Getting words from index ${validStart} to ${validEnd} (total: ${validEnd - validStart})`);

    // Return words in the specified range
    return words.slice(validStart, validEnd);
};

// Calculate quiz results
export const calculateResults = (words: Word[], answers: boolean[]): {
    totalWords: number;
    knownWords: number;
    unknownWords: number;
    unknownWordsList: Word[];
} => {
    const unknownWordsList: Word[] = [];

    let knownWords = 0;
    for (let i = 0; i < words.length; i++) {
        if (answers[i]) {
            knownWords++;
        } else {
            unknownWordsList.push(words[i]);
        }
    }

    return {
        totalWords: words.length,
        knownWords,
        unknownWords: words.length - knownWords,
        unknownWordsList,
    };
}; 