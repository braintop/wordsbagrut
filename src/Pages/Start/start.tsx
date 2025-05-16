import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Start() {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to the new HomePage
        navigate('/');
    }, [navigate]);

    return null;
}
