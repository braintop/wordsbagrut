import { useState } from 'react';
import { Box, Button, Container, Typography, Paper, TextField, CircularProgress, Alert, Divider, Grid, Card, CardContent, Chip, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../../context/QuizContext';
import { useAuth } from '../../context/AuthContext';
import { saveFavoriteList } from '../../services/favoriteService';

export default function ResultsPage() {
    const { quizState, getResults, resetQuiz } = useQuiz();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [listName, setListName] = useState(`Words - ${new Date().toLocaleDateString()}`);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Speech synthesis function
    const speakWord = (word: string) => {
        if ('speechSynthesis' in window) {
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

    // Redirect to home if no quiz results
    if (quizState.words.length === 0 || !quizState.isComplete) {
        navigate('/');
        return null;
    }

    const results = getResults();

    // Handle saving unknown words to favorites
    const handleSave = async () => {
        if (!currentUser) {
            setError('Please log in to save words');
            return;
        }

        if (listName.trim() === '') {
            setError('Please enter a name for your list');
            return;
        }

        if (results.unknownWordsList.length === 0) {
            setError('There are no unknown words to save');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            await saveFavoriteList(listName, results.unknownWordsList);
            setSaved(true);
        } catch (err) {
            setError('Failed to save the list. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Start a new quiz
    const handleNewQuiz = () => {
        resetQuiz();
        navigate('/');
    };

    // Go to favorites page
    const handleViewFavorites = () => {
        navigate('/favorites');
    };

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    תוצאות הבחינה
                </Typography>

                <Box mb={4}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" align="center">סך הכל מילים</Typography>
                                    <Typography variant="h3" align="center">{results.totalWords}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card variant="outlined" sx={{ bgcolor: 'success.light' }}>
                                <CardContent>
                                    <Typography variant="h6" align="center">מילים שידעתי</Typography>
                                    <Typography variant="h3" align="center">{results.knownWords}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card variant="outlined" sx={{ bgcolor: 'error.light' }}>
                                <CardContent>
                                    <Typography variant="h6" align="center">מילים לא ידועות</Typography>
                                    <Typography variant="h3" align="center">{results.unknownWords}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {results.unknownWordsList.length > 0 && (
                    <>
                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h5" gutterBottom>
                            רשימת מילים שלא ידעתי
                        </Typography>

                        <Box mb={4} mt={2} sx={{ maxHeight: '200px', overflowY: 'auto', p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                            <Grid container spacing={1}>
                                {results.unknownWordsList.map((word, index) => (
                                    <Grid key={index}>
                                        <Tooltip title="לחץ להקראה">
                                            <Chip
                                                label={`${word.word_english} - ${word.word_hebrew}`}
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => speakWord(word.word_english)}
                                                sx={{
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        backgroundColor: 'primary.light',
                                                        color: 'white'
                                                    }
                                                }}
                                            />
                                        </Tooltip>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>

                        {currentUser && (
                            <Box mb={4}>
                                <Typography variant="subtitle1" gutterBottom>
                                    שמור רשימה זו למועדפים:
                                </Typography>

                                <TextField
                                    label="שם הרשימה"
                                    fullWidth
                                    value={listName}
                                    onChange={(e) => setListName(e.target.value)}
                                    disabled={saving || saved}
                                    margin="normal"
                                />

                                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                                {saved && <Alert severity="success" sx={{ mt: 2 }}>הרשימה נשמרה בהצלחה!</Alert>}

                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    sx={{ mt: 2 }}
                                    onClick={handleSave}
                                    disabled={saving || saved}
                                >
                                    {saving ? <CircularProgress size={24} /> : 'שמור רשימה'}
                                </Button>
                            </Box>
                        )}
                    </>
                )}

                <Divider sx={{ my: 3 }} />

                <Box display="flex" justifyContent="space-between">
                    <Button variant="outlined" onClick={handleNewQuiz}>
                        בחינה חדשה
                    </Button>

                    {currentUser && (
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleViewFavorites}
                        >
                            צפה ברשימות שמורות
                        </Button>
                    )}
                </Box>
            </Paper>
        </Container>
    );
} 