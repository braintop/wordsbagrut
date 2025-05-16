import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Word, QuizState, QuizResults } from '../types/types';
import { loadWordsFromCSV, getWordsInRange } from '../services/wordService';

interface QuizContextType {
    allWords: Word[];
    quizState: QuizState;
    startQuiz: (startIndex: number, endIndex: number, customWords?: Word[]) => void;
    answerWord: (known: boolean) => void;
    goToNextWord: () => void;
    resetQuiz: () => void;
    getResults: () => QuizResults;
    loading: boolean;
}

const initialQuizState: QuizState = {
    words: [],
    currentIndex: 0,
    answers: [],
    isComplete: false,
};

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const useQuiz = () => {
    const context = useContext(QuizContext);
    if (!context) {
        throw new Error('useQuiz must be used within a QuizProvider');
    }
    return context;
};

export const QuizProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [allWords, setAllWords] = useState<Word[]>([]);
    const [quizState, setQuizState] = useState<QuizState>(initialQuizState);
    const [loading, setLoading] = useState(true);

    // Load all words on mount
    useEffect(() => {
        const loadWords = async () => {
            setLoading(true);
            const words = await loadWordsFromCSV();
            setAllWords(words);
            setLoading(false);
        };

        loadWords();
    }, []);

    // Start a new quiz with a range of words or custom words
    const startQuiz = (startIndex: number, endIndex: number, customWords?: Word[]) => {
        let selectedWords: Word[];

        if (customWords && customWords.length > 0) {
            // Use custom words (like from favorites)
            selectedWords = customWords;
        } else {
            // Use words from the main list by index range
            selectedWords = getWordsInRange(allWords, startIndex, endIndex);
        }

        setQuizState({
            words: selectedWords,
            currentIndex: 0,
            answers: [],
            isComplete: false,
        });
    };

    // Record an answer for the current word
    const answerWord = (known: boolean) => {
        if (quizState.isComplete) {
            return;
        }

        const currentWord = quizState.words[quizState.currentIndex];

        // Create a new answers array with the current answer
        const newAnswers = [...quizState.answers];
        newAnswers[quizState.currentIndex] = {
            word: currentWord,
            known: known
        };

        const isLastWord = quizState.currentIndex === quizState.words.length - 1;

        setQuizState({
            ...quizState,
            answers: newAnswers,
            isComplete: isLastWord,
        });
    };

    // Move to the next word
    const goToNextWord = () => {
        if (quizState.isComplete || quizState.currentIndex >= quizState.words.length - 1) {
            setQuizState({
                ...quizState,
                isComplete: true,
            });
            return;
        }

        setQuizState({
            ...quizState,
            currentIndex: quizState.currentIndex + 1,
        });
    };

    // Reset the quiz
    const resetQuiz = () => {
        setQuizState(initialQuizState);
    };

    // Calculate quiz results
    const getResults = (): QuizResults => {
        // Filter answers by known (true) and unknown (false)
        const knownAnswers = quizState.answers.filter(answer => answer && answer.known === true);
        const unknownAnswers = quizState.answers.filter(answer => answer && answer.known === false);

        return {
            totalWords: quizState.words.length,
            knownWords: knownAnswers.length,
            unknownWords: unknownAnswers.length,
            unknownWordsList: unknownAnswers.map(answer => answer.word),
        };
    };

    const value = {
        allWords,
        quizState,
        startQuiz,
        answerWord,
        goToNextWord,
        resetQuiz,
        getResults,
        loading,
    };

    return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}; 