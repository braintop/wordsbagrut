import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Box, Button, Container, TextField, Typography, Paper, CircularProgress, Alert, Stack } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useQuiz } from '../../context/QuizContext';
import { useAuth } from '../../context/AuthContext';

export default function HomePage() {
    const { allWords, startQuiz, loading, refreshWords } = useQuiz();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [startIndex, setStartIndex] = useState<number>(1);
    const [endIndex, setEndIndex] = useState<number>(20);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    // Update endIndex when allWords length changes
    useEffect(() => {
        if (allWords.length > 0) {
            // Set the initial end index to a reasonable value (either 50 or the max available)
            const defaultEndIndex = Math.min(50, allWords.length);
            setEndIndex(defaultEndIndex);
        }
    }, [allWords.length]);

    // Function to refresh word list and clear cache
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            // Force reload the words by bypassing cache
            if (typeof refreshWords === 'function') {
                await refreshWords();
            } else {
                // Fallback if refreshWords isn't available - reload the page with cache busting
                window.location.href = `${window.location.pathname}?nocache=${Date.now()}`;
            }
        } catch (error) {
            console.error('Error refreshing words:', error);
            setError('אירעה שגיאה בטעינת המילים. נסה שוב.');
        } finally {
            setRefreshing(false);
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (startIndex < 1) {
            setError('Start index must be at least 1');
            return;
        }

        if (endIndex > allWords.length) {
            setError(`End index must not exceed ${allWords.length}`);
            return;
        }

        if (startIndex > endIndex) {
            setError('Start index must be less than end index');
            return;
        }

        console.log(`Starting quiz with words from ${startIndex} to ${endIndex} (UI display)`);

        // Convert from 1-based (UI display) to 0-based (array index)
        const startIdx = startIndex - 1;
        const endIdx = endIndex;

        console.log(`Converted to array indices: ${startIdx} to ${endIdx}`);

        // Start the quiz with the selected range
        startQuiz(startIdx, endIdx);
        navigate('/quiz');
    };

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Words Bagrut - מבחן אוצר מילים
                </Typography>

                {loading ? (
                    <Box display="flex" justifyContent="center" my={4}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Alert severity="info" sx={{ mb: 3 }}>
                            יש לבחור טווח מילים ללמידה (מתוך {allWords.length} מילים)
                            <Box display="flex" justifyContent="flex-end" mt={1}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                >
                                    {refreshing ? 'מרענן...' : 'רענן רשימת מילים'}
                                </Button>
                            </Box>
                        </Alert>

                        <Box component="form" onSubmit={handleSubmit}>
                            <Stack spacing={3}>
                                <TextField
                                    label="מספר התחלה"
                                    type="number"
                                    value={startIndex}
                                    onChange={(e) => setStartIndex(parseInt(e.target.value, 10) || 1)}
                                    fullWidth
                                    inputProps={{ max: 10000 }}
                                    required
                                    helperText="המספר המינימלי הוא 1"
                                />

                                <TextField
                                    label="מספר סיום"
                                    type="number"
                                    value={endIndex}
                                    onChange={(e) => setEndIndex(parseInt(e.target.value, 10) || 1)}
                                    fullWidth
                                    inputProps={{ max: 10000 }}
                                    required
                                    helperText={`ניתן להזין כל מספר עד ${allWords.length} (סך המילים הזמינות)`}
                                />

                                {error && <Alert severity="error">{error}</Alert>}

                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    fullWidth
                                >
                                    התחל בחינה
                                </Button>
                            </Stack>
                        </Box>

                        {currentUser && (
                            <Box mt={4} textAlign="center">
                                <Button
                                    component={RouterLink}
                                    to="/favorites"
                                    variant="outlined"
                                    color="secondary"
                                >
                                    רשימות שמורות
                                </Button>
                            </Box>
                        )}
                    </>
                )}
            </Paper>
        </Container>
    );
} 