import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import '../App.css';

function Profile() {
  const { isAuthenticated, user, loading } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const fetchProfile = () => {
    setLoadingProfile(true);
    api.get('/auth/me')
      .then(response => {
        setUserProfile(response.data);
        setFormData({
          firstName: response.data.user.firstName || '',
          lastName: response.data.user.lastName || '',
          email: response.data.user.email || ''
        });
      })
      .catch(error => {
        console.error('Failed to fetch user profile:', error);
        setError('Impossible de charger votre profil');
      })
      .finally(() => {
        setLoadingProfile(false);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setUpdating(true);

    try {
      await api.patch('/users/me', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      });

      setSuccess(true);
      fetchProfile(); // Refresh profile data

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setUpdating(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading || loadingProfile) {
    return (
      <div className="container">
        <div className="loading">
          <h2>Chargement...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container">
        <p>Vous devez être connecté pour accéder à cette page</p>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Mon Profil</h1>
        <p className="subtitle">Modifiez vos informations personnelles</p>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="firstName">Prénom</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Votre prénom"
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Nom</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Votre nom"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre@email.com"
              required
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              Profil mis à jour avec succès !
            </div>
          )}

          <button
            type="submit"
            className="btn btn-login"
            disabled={updating}
          >
            {updating ? 'Mise à jour...' : 'Mettre à jour'}
          </button>
        </form>

        <a href="/" className="back-link">← Retour à l'accueil</a>
      </header>
    </div>
  );
}

export default Profile;
