import Papa from 'papaparse';
import type { Word } from '../types/types';

// Load CSV file and parse it
export const loadWordsFromCSV = async (bypassCache: boolean = false): Promise<Word[]> => {
    try {
        // Add cache busting parameter if needed
        const cacheBuster = bypassCache ? `?nocache=${Date.now()}` : '';

        // Try to load from public folder first (preferred)
        try {
            console.log(`Attempting to load words from public folder with cacheBuster: ${cacheBuster}`);
            const publicResponse = await fetch(`/words.csv${cacheBuster}`);

            if (publicResponse.ok) {
                const csvText = await publicResponse.text();
                console.log(`Successfully loaded ${csvText.length} bytes from public folder`);
                const words = parseCsvText(csvText);
                console.log(`Parsed ${words.length} words from public folder`);
                return words;
            } else {
                console.warn(`Failed to load from public folder: ${publicResponse.status}`);
            }
        } catch (publicError) {
            console.error('Error loading from public folder:', publicError);
        }

        // Fallback to src/data folder
        console.log(`Attempting to load words from src/data folder with cacheBuster: ${cacheBuster}`);
        const response = await fetch(`/src/data/words.csv${cacheBuster}`);

        if (response.ok) {
            const csvText = await response.text();
            console.log(`Successfully loaded ${csvText.length} bytes from src/data folder`);
            const words = parseCsvText(csvText);
            console.log(`Parsed ${words.length} words from src/data folder`);
            return words;
        } else {
            throw new Error(`Failed to load words from both locations: ${response.status}`);
        }
    } catch (error) {
        console.error('Error loading words:', error);

        // Fallback to local mock data for development/testing
        console.warn('Using fallback mock data (only 3 words)');
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

    console.log(`CSV parsing complete. Found ${result.data.length} rows.`);

    // Check for errors
    if (result.errors && result.errors.length > 0) {
        console.warn('CSV parsing had errors:', result.errors);
    }

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