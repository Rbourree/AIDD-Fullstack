import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const { isAuthenticated, loading, login } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      login();
    }
  }, [loading, isAuthenticated, login]);

  return null;
};

export default Login;
