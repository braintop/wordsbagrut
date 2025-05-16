import { useState, useEffect } from 'react';
import { Box, Button, Container, Typography, Paper, CircularProgress, Alert, Grid, Card, CardContent, CardActions, Chip, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, IconButton, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../../context/QuizContext';
import { useAuth } from '../../context/AuthContext';
import { getFavoriteLists, deleteFavoriteList } from '../../services/favoriteService';
import type { FavoriteList, Word } from '../../types/types';
import { FaTrash, FaPlay, FaEye, FaVolumeUp } from 'react-icons/fa';

export default function FavoritesPage() {
    const { startQuiz } = useQuiz();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const x = 1; 
    const [lists, setLists] = useState<FavoriteList[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // For word list preview dialog
    const [selectedList, setSelectedList] = useState<FavoriteList | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);

    // For delete confirmation dialog
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [listToDelete, setListToDelete] = useState<string | null>(null);

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

    // Check if user is logged in
    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        }
    }, [currentUser, navigate]);

    // Load favorite lists
    useEffect(() => {
        const loadLists = async () => {
            setLoading(true);
            try {
                const loadedLists = await getFavoriteLists();
                setLists(loadedLists);
            } catch (err) {
                setError('Failed to load favorite lists.');
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            loadLists();
        }
    }, [currentUser]);

    // Open delete confirmation dialog
    const openDeleteConfirm = (listId: string) => {
        setListToDelete(listId);
        setDeleteConfirmOpen(true);
    };

    // Close delete confirmation dialog
    const closeDeleteConfirm = () => {
        setDeleteConfirmOpen(false);
        setListToDelete(null);
    };

    // Delete a list
    const handleDelete = async () => {
        if (!listToDelete) return;

        try {
            const success = await deleteFavoriteList(listToDelete);
            if (success) {
                setLists(lists.filter(list => list.id !== listToDelete));
                closeDeleteConfirm();
            } else {
                setError('Failed to delete list.');
            }
        } catch (err) {
            setError('Failed to delete list.');
        }
    };

    // Start a quiz with a favorite list
    const handleStartQuiz = (words: Word[]) => {
        startQuiz(0, 0, words); // Pass words directly instead of index range
        navigate('/quiz');
    };

    // Show preview of words in a list
    const handlePreview = (list: FavoriteList) => {
        setSelectedList(list);
        setPreviewOpen(true);
    };

    // Close preview dialog
    const handleClosePreview = () => {
        setPreviewOpen(false);
    };

    if (loading) {
        return (
            <Container maxWidth="md">
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    רשימות מילים שמורות
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                {lists.length === 0 ? (
                    <Alert severity="info" sx={{ mb: 3 }}>
                        אין רשימות שמורות. סיים בחינה ושמור מילים שלא ידעת.
                    </Alert>
                ) : (
                    <Grid container spacing={3}>
                        {lists.map(list => (
                            <Grid size={{ xs: 12, md: 6 }} key={list.id}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6">{list.listName}</Typography>
                                        <Typography variant="body2" color="textSecondary" gutterBottom>
                                            נוצר ב: {list.createdAt.toLocaleDateString()}
                                        </Typography>
                                        <Chip
                                            label={`${list.words.length} מילים`}
                                            color="primary"
                                            size="small"
                                            variant="outlined"
                                        />
                                    </CardContent>
                                    <CardActions>
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleStartQuiz(list.words)}
                                            title="התחל בחינה"
                                        >
                                            <FaPlay />
                                        </IconButton>
                                        <IconButton
                                            color="info"
                                            onClick={() => handlePreview(list)}
                                            title="צפה במילים"
                                        >
                                            <FaEye />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => openDeleteConfirm(list.id!)}
                                            title="מחק רשימה"
                                        >
                                            <FaTrash />
                                        </IconButton>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                <Box mt={4} display="flex" justifyContent="center">
                    <Button variant="outlined" onClick={() => navigate('/')}>
                        חזור לדף הבית
                    </Button>
                </Box>
            </Paper>

            {/* Preview Dialog */}
            <Dialog
                open={previewOpen}
                onClose={handleClosePreview}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {selectedList?.listName} - רשימת מילים
                </DialogTitle>
                <DialogContent>
                    <List>
                        {selectedList?.words.map((word, index) => (
                            <ListItem key={index} divider>
                                <ListItemText
                                    primary={
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography
                                                component="span"
                                                sx={{
                                                    cursor: 'pointer',
                                                    '&:hover': { textDecoration: 'underline' }
                                                }}
                                                onClick={() => speakWord(word.word_english)}
                                            >
                                                {word.word_english} - {word.word_hebrew}
                                            </Typography>
                                            <Tooltip title="הקרא מילה">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => speakWord(word.word_english)}
                                                    size="small"
                                                >
                                                    <FaVolumeUp />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    }
                                    secondary={word.description_en}
                                />
                            </ListItem>
                        ))}
                    </List>
                    <Box mt={2} textAlign="center">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                handleClosePreview();
                                if (selectedList) {
                                    handleStartQuiz(selectedList.words);
                                }
                            }}
                        >
                            התחל בחינה עם רשימה זו
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={closeDeleteConfirm}
            >
                <DialogTitle>
                    האם אתה בטוח שברצונך למחוק את הרשימה?
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        פעולה זו אינה ניתנת לביטול. כל המילים ברשימה זו יימחקו.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteConfirm} color="primary">
                        ביטול
                    </Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        מחק
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
} 