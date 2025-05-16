import { AppBar, Box, Button, Container, Toolbar, Typography, Avatar, Menu, MenuItem, IconButton, CircularProgress } from '@mui/material';
import { Outlet, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../api/api';

export default function Layout() {
    const { currentUser, loading } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [logoutLoading, setLogoutLoading] = useState(false);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        setLogoutLoading(true);
        try {
            await logoutUser();
            handleClose();
            navigate('/');
        } catch (error) {
            console.error('Error logging out:', error);
        } finally {
            setLogoutLoading(false);
        }
    };

    return (
        <>
            <AppBar position="static">
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <Typography
                            variant="h6"
                            noWrap
                            component={RouterLink}
                            to="/"
                            sx={{
                                mr: 2,
                                display: { xs: 'flex' },
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.3rem',
                                color: 'inherit',
                                textDecoration: 'none',
                            }}
                        >
                            WORDS BAGRUT
                        </Typography>

                        <Box sx={{ flexGrow: 1, display: 'flex' }}>
                            <Button
                                component={RouterLink}
                                to="/"
                                sx={{ my: 2, color: 'white', display: 'block' }}
                            >
                                Start
                            </Button>
                        </Box>

                        {loading ? (
                            <CircularProgress color="inherit" size={24} />
                        ) : currentUser ? (
                            <div>
                                <IconButton
                                    onClick={handleMenu}
                                    sx={{ p: 0 }}
                                    aria-controls="menu-appbar"
                                    aria-haspopup="true"
                                >
                                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                        {currentUser.email ? currentUser.email.charAt(0).toUpperCase() : '?'}
                                    </Avatar>
                                </IconButton>
                                <Menu
                                    id="menu-appbar"
                                    anchorEl={anchorEl}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                >
                                    <MenuItem onClick={handleClose}>Profile</MenuItem>
                                    <MenuItem onClick={handleLogout} disabled={logoutLoading}>
                                        {logoutLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                                        Logout
                                    </MenuItem>
                                </Menu>
                            </div>
                        ) : (
                            <Box sx={{ display: 'flex' }}>
                                <Button
                                    component={RouterLink}
                                    to="/login"
                                    sx={{ my: 2, color: 'white', display: 'block' }}
                                >
                                    Login
                                </Button>
                                <Button
                                    component={RouterLink}
                                    to="/register"
                                    sx={{ my: 2, color: 'white', display: 'block' }}
                                >
                                    Register
                                </Button>
                            </Box>
                        )}
                    </Toolbar>
                </Container>
            </AppBar>
            <Container maxWidth="xl" sx={{ mt: 4 }}>
                <Outlet />
            </Container>
        </>
    );
}
