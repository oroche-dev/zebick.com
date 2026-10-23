import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('admin_token');

      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        // Verify token with backend
        const response = await axios.get(`${BACKEND_URL}/api/admin/verify`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.valid) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_email');
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        setIsAuthenticated(false);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_email');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '18px',
      }}>
        Überprüfung läuft...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/zb-panel-8x2k/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
