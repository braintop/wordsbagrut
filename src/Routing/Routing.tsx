import { Route, Routes } from 'react-router-dom';
import Layout from '../Pages/Layout';
import Login from '../Pages/Login/Login';
import Register from '../Pages/Register/Register';
import HomePage from '../Pages/Home/HomePage';
import QuizPage from '../Pages/Quiz/QuizPage';
import ResultsPage from '../Pages/Results/ResultsPage';
import FavoritesPage from '../Pages/Favorites/FavoritesPage';

const Routing = () => {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="quiz" element={<QuizPage />} />
                <Route path="results" element={<ResultsPage />} />
                <Route path="favorites" element={<FavoritesPage />} />
            </Route>
        </Routes>
    );
};

export default Routing;
