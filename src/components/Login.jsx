import { useState } from 'react';
import axios from 'axios';
import styles from './Login.module.css';
import logoOhana from '../assets/ohana1.jpg'; 
import { Link } from 'react-router-dom';

function Login({ onLoginSuccess }) {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError(null);
    setIsLoading(true);

    try {
      // CORRECCIÓN FINAL: La ruta correcta es /api/auth/login
      const response = await axios.post('https://ohana-back-production.up.railway.app/api/auth/login', {
        usuario: usuario,
        contrasena: contrasena
      });
      
      localStorage.setItem('authToken', response.data.token); 
      onLoginSuccess();
      
    } catch (err) {
      console.error('Error de login:', err);
      // Si el error es 404, es que la ruta sigue mal. Si es 401, es contraseña mal. Si es 500, es base de datos.
      if (err.response && err.response.status === 401) {
        setError('Usuario o contraseña incorrectos.');
      } else {
        setError('Error de conexión o usuario no encontrado.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      
      <div className={styles.formSection}>
        <div className={styles.formBox}>
          <div className={styles.header}>
            <img src={logoOhana} alt="Ohana Logo" className={styles.imageLogo} />
            <h1 className={styles.title}>Bienvenido</h1>
            <p className={styles.subtitle}>Ingresa a tu espacio Ohana</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.loginForm}>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="usuario">Usuario</label>
              <input 
                id="usuario" 
                className={styles.input} 
                type="text" 
                placeholder="Ej. stitch_626" 
                value={usuario} 
                onChange={(e) => setUsuario(e.target.value)} 
                required 
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="contrasena">Contraseña</label>
              <input 
                id="contrasena" 
                className={styles.input} 
                type="password" 
                placeholder="••••••••" 
                value={contrasena} 
                onChange={(e) => setContrasena(e.target.value)} 
                required 
              />
            </div>
            
            {error && <p className={styles.error}>{error}</p>}

            <button className={styles.button} type="submit" disabled={isLoading}>
              {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
            </button>
          </form>
          
          <div style={{textAlign: 'center', marginTop: '1.5rem'}}>
            <Link to="/register" className={styles.toggleLink}>
              Crear nueva cuenta
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.imageSection}>
         <div className={styles.overlay}></div>
         <div className={styles.glassCard}>
            <h1 className={styles.brandingTitle}>Sistema Ohana</h1>
            <p className={styles.brandingText}>
              "Ohana significa familia. Y la familia nunca te abandona ni te olvida."
            </p>
         </div>
      </div>

    </div>
  );
}

export default Login;