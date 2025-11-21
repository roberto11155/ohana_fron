// src/App.jsx

import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Importa tus componentes
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import NuevaVenta from './components/NuevaVenta'; 
import ProductList from './components/ProductList'; 
import CorteDelDia from './components/CorteDelDia'; 
import Deudores from './components/Deudores';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false); 
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  // Muestra un mensaje mientras se verifica el token
  if (isLoading) {
    return <div>Cargando aplicación...</div>; 
  }

  return (
    <Routes>
      
      {/* --- Ruta Raíz (/) --- */}
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
        }
      />
      
      {/* --- Ruta del Dashboard (Protegida) --- */}
      <Route 
        path="/dashboard" 
        element={
          isAuthenticated ? (
            <Dashboard onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" /> 
          )
        } 
      />

      {/* --- Rutas de la App (Protegidas) --- */}
      <Route 
        path="/nueva-venta" 
        element={
          isAuthenticated ? (
            <NuevaVenta /> 
          ) : (
            <Navigate to="/login" />
          )
        } 
      />
      
      <Route 
        path="/productos" 
        element={
          isAuthenticated ? (
            <ProductList /> 
          ) : (
            <Navigate to="/login" />
          )
        } 
      />

      <Route 
        path="/corte-del-dia" 
        element={
          isAuthenticated ? (
            <CorteDelDia /> 
          ) : (
            <Navigate to="/login" />
          )
        } 
      />

      {/* --- AQUÍ AGREGAMOS LA RUTA DE DEUDORES --- */}
      <Route 
        path="/deudores" 
        element={
          isAuthenticated ? (
            <Deudores /> 
          ) : (
            <Navigate to="/login" />
          )
        } 
      />

      {/* --- Rutas de Autenticación --- */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" /> 
          ) : (
            <Login onLoginSuccess={handleLoginSuccess} />
          )
        } 
      />

      <Route 
        path="/register" 
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" /> 
          ) : (
            <Register />
          )
        } 
      />
      
    </Routes>
  );
}

export default App;