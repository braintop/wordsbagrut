// Word type definition
export interface Word {
    word_english: string;
    word_hebrew: string;
    description_en: string;
}

// User answer type
export interface Answer {
    word: Word;
    known: boolean;
}

// Quiz state type
export interface QuizState {
    words: Word[];
    currentIndex: number;
    answers: Answer[];
    isComplete: boolean;
}

// Quiz results
export interface QuizResults {
    totalWords: number;
    knownWords: number;
    unknownWords: number;
    unknownWordsList: Word[];
}

// Favorite list type
export interface FavoriteList {
    id?: string;
    listName: string;
    createdAt: Date;
    words: Word[];
} 