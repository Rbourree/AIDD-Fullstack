import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import api from './api/axios';
import Profile from './pages/Profile';
import './App.css';

function Home() {
  const { isAuthenticated, user, loading, login, logout } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setLoadingProfile(true);
      api.get('/auth/me')
        .then(response => {
          setUserProfile(response.data);
        })
        .catch(error => {
          console.error('Failed to fetch user profile:', error);
        })
        .finally(() => {
          setLoadingProfile(false);
        });
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <h2>Initialisation...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        {isAuthenticated ? (
          <>
            <h1>Bienvenue, {userProfile?.user?.firstName || user?.preferred_username || user?.email}!</h1>
            <p className="subtitle">Vous êtes connecté via Keycloak</p>

            {loadingProfile ? (
              <p>Chargement de votre profil...</p>
            ) : userProfile && (
              <div className="profile-info">
                <p><strong>Email:</strong> {userProfile.user.email}</p>
                {userProfile.tenants && userProfile.tenants.length > 0 && (
                  <div className="tenants">
                    <strong>Vos tenants:</strong>
                    <ul>
                      {userProfile.tenants.map(tenant => (
                        <li key={tenant.id}>
                          {tenant.name} ({tenant.role})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="button-group">
              <Link to="/profile" className="btn btn-login">
                Modifier mon profil
              </Link>
              <button className="btn btn-logout" onClick={logout}>
                Se déconnecter
              </button>
            </div>
          </>
        ) : (
          <>
            <h1>Bienvenue</h1>
            <p className="subtitle">Application React avec Keycloak</p>
            <button className="btn btn-login" onClick={login}>
              Se connecter
            </button>
          </>
        )}
      </header>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;