import { useEffect, useState, useRef } from 'react';
import { Box, Button, Container, Typography, Paper, Card, CardContent, LinearProgress, IconButton, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../../context/QuizContext';
import { FaThumbsUp, FaThumbsDown, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

export default function QuizPage() {
    const { quizState, answerWord, goToNextWord, loading } = useQuiz();
    const navigate = useNavigate();
    const [answered, setAnswered] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const currentIndexRef = useRef(quizState.currentIndex);

    // Redirect to home if no quiz is active
    useEffect(() => {
        if (!loading && quizState.words.length === 0) {
            navigate('/');
        }

        // Redirect to results if quiz is complete
        if (quizState.isComplete) {
            navigate('/results');
        }
    }, [quizState, navigate, loading]);

    // Auto speak new words when they change (if not muted)
    useEffect(() => {
        if (!loading &&
            quizState.currentIndex !== currentIndexRef.current &&
            quizState.currentIndex < quizState.words.length &&
            !isMuted) {

            const currentWord = quizState.words[quizState.currentIndex];
            speakWord(currentWord.word_english);
            currentIndexRef.current = quizState.currentIndex;
        }
    }, [quizState.currentIndex, loading, quizState.words, isMuted]);

    // Speech synthesis function
    const speakWord = (word: string) => {
        if (isMuted) return; // Don't speak if muted

        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            // Create a new instance of SpeechSynthesisUtterance
            const utterance = new SpeechSynthesisUtterance(word);

            // Set language to English
            utterance.lang = 'en-US';

            // Optional: adjust speech rate and pitch if needed
            utterance.rate = 0.9;  // Slightly slower than default

            // Speak the word
            window.speechSynthesis.speak(utterance);
        } else {
            console.error('Speech synthesis is not supported in this browser.');
        }
    };

    // Toggle mute/unmute
    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    // Handle user's answer
    const handleAnswer = (known: boolean) => {
        // Mark that the user has answered this question
        setAnswered(true);
        // Record the answer
        answerWord(known);
    };

    // Handle moving to the next word
    const handleNext = () => {
        goToNextWord();
        setAnswered(false); // Reset for the next word
    };

    // Calculate progress
    const progress = (quizState.currentIndex / quizState.words.length) * 100;

    // Get current word
    const currentWord = quizState.currentIndex < quizState.words.length
        ? quizState.words[quizState.currentIndex]
        : null;

    if (loading || !currentWord) {
        return (
            <Container maxWidth="md">
                <Box display="flex" justifyContent="center" mt={10}>
                    <Typography>Loading...</Typography>
                </Box>
            </Container>
        );
    }

    // Get current answer
    const currentAnswer = quizState.answers[quizState.currentIndex];
    const isAnswered = answered || currentAnswer !== undefined;

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" gutterBottom>
                        מילה {quizState.currentIndex + 1} מתוך {quizState.words.length}
                    </Typography>

                    <Tooltip title={isMuted ? "הפעל הקראה אוטומטית" : "כבה הקראה אוטומטית"}>
                        <IconButton
                            color={isMuted ? "default" : "primary"}
                            onClick={toggleMute}
                            sx={{ mb: 1 }}
                        >
                            {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
                        </IconButton>
                    </Tooltip>
                </Box>

                <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5, mb: 3 }} />

                <Card variant="outlined" sx={{ mb: 4 }}>
                    <CardContent>
                        <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
                            <Typography
                                variant="h3"
                                component="h2"
                                align="center"
                                sx={{
                                    mb: 2,
                                    cursor: 'pointer',
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                                onClick={() => speakWord(currentWord.word_english)}
                            >
                                {currentWord.word_english}
                            </Typography>

                            <Tooltip title="הקרא מילה">
                                <IconButton
                                    color="primary"
                                    onClick={() => speakWord(currentWord.word_english)}
                                    size="small"
                                >
                                    <FaVolumeUp />
                                </IconButton>
                            </Tooltip>
                        </Box>

                        <Typography variant="body1" color="textSecondary" align="center">
                            {currentWord.description_en}
                        </Typography>

                        {isAnswered && (
                            <Typography variant="h4" align="center" sx={{ mt: 3, color: 'primary.main' }}>
                                {currentWord.word_hebrew}
                            </Typography>
                        )}
                    </CardContent>
                </Card>

                {!isAnswered ? (
                    <>
                        <Typography variant="h6" gutterBottom align="center">
                            האם ידעת את המילה?
                        </Typography>

                        <Box display="flex" justifyContent="center" gap={4} mb={4}>
                            <IconButton
                                color="success"
                                sx={{ p: 3 }}
                                onClick={() => handleAnswer(true)}
                            >
                                <FaThumbsUp size={40} />
                            </IconButton>

                            <IconButton
                                color="error"
                                sx={{ p: 3 }}
                                onClick={() => handleAnswer(false)}
                            >
                                <FaThumbsDown size={40} />
                            </IconButton>
                        </Box>
                    </>
                ) : (
                    <Box textAlign="center" mb={2}>
                        <Typography variant="h6" color={currentAnswer?.known ? "success.main" : "error.main"}>
                            {currentAnswer?.known ? "✓ ידעת את המילה" : "✗ לא ידעת את המילה"}
                        </Typography>
                    </Box>
                )}

                <Box textAlign="center">
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleNext}
                        disabled={!isAnswered}
                    >
                        הבא
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
} 