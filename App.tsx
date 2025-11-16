
import React from 'react';
import ShoppingPage from './components/ShoppingPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';

const MainContent: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="bg-gray-900 h-screen flex items-center justify-center">
                <div className="text-white text-lg font-semibold animate-pulse">Loading Application...</div>
            </div>
        );
    }

    if (user) {
        return <ShoppingPage user={user} />;
    }

    return <Login />;
}


const App: React.FC = () => {
    return (
        <AuthProvider>
            <MainContent />
        </AuthProvider>
    );
};

export default App;
