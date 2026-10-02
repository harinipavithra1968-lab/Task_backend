import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem('user') || 'null')
  );

  const save = ({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const login = async (identifier, password) => {
    const data = await api('/auth/login', {
      method: 'POST',
      body: { identifier, password },
    });

    save(data);
  };

  const register = async (form) => {
    const data = await api('/auth/register', {
      method: 'POST',
      body: form,
    });

    save(data);
  };

  // Handle Google login after Google redirects back to the frontend
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('token', token);

      // Get the Google user's information from the backend
      fetch('https://backend-6efa.onrender.com/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error('Unable to get user information');
          }
          return res.json();
        })
        .then((user) => {
          localStorage.setItem('user', JSON.stringify(user));
          setUser(user);

          // Remove token from the URL
          window.history.replaceState({}, document.title, '/');

          // Go to TaskDesk
          window.location.href = '/';
        })
        .catch((error) => {
          console.error('Google login error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        });
    }
  }, []);

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}