import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';

function App() {
    return (
        <Routes>
            {/* visit /login to show Login component */}
            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />

            {/* visit / (home) temporarily redirect to login page (for debugging) */}
            {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}

            <Route path="/" element={<Home />} />

            {/* 404 page (optional) */}
            <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
    );
}

export default App;
