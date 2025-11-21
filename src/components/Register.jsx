// src/components/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Register.module.css'; 
import logoOhana from '../assets/ohana1.jpg'; // (Asegúrate de que este sea el nombre correcto)

function Register() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 

    if (contrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden.');
      return; 
    }

    setIsLoading(true);

    try {
      await axios.post('http://localhost:3000/api/auth/register', {
        nombre: nombre,
        email: email,
        usuario: usuario,
        contrasena: contrasena
      });
      
      navigate('/login'); 

    } catch (err) {
      console.error('Error de registro:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Error al crear la cuenta. Inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.formBox}>
        <div className={styles.header}>
          
          <img src={logoOhana} alt="Ohana POS Logo" className={styles.imageLogo} />
          
          {/* --- AQUÍ ESTÁ TU TEXTO ILUSTRATIVO --- */}
          {/* (Corregí la ortografía de "bienvenido" y "familia") */}
          <h1 className={styles.title}>Crea tu cuenta</h1>
          <p className={styles.subtitle} style={{ lineHeight: '1.5', marginTop: '0.5rem' }}>
            ¡Bienvenido a la familia Ohana! Completa tus datos para unirte y empezar a gestionar tu negocio.
          </p>
          {/* --- FIN DEL CAMBIO --- */}

        </div>

        <form onSubmit={handleSubmit} className={styles.registerForm}>
          
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="nombre">Nombre Completo:</label>
            <input id="nombre" className={styles.input} type="text" placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="email">Email:</label>
            <input id="email" className={styles.input} type="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="usuario">Usuario:</label>
            <input id="usuario" className={styles.input} type="text" placeholder="Elige un usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} required />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="contrasena">Contraseña:</label>
            <input id="contrasena" className={styles.input} type="password" placeholder="Mínimo 6 caracteres" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="confirmarContrasena">Confirmar Contraseña:</label>
            <input id="confirmarContrasena" className={styles.input} type="password" placeholder="Repite tu contraseña" value={confirmarContrasena} onChange={(e) => setConfirmarContrasena(e.target.value)} required />
          </div>

          {error && <p className={styles.error}>{error}</p>}
          
          <button className={styles.button} type="submit" disabled={isLoading}>
            {isLoading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <Link to="/login" className={styles.toggleLink}>
          ¿Ya tienes cuenta? Inicia sesión aquí
        </Link>
      </div>
    </div>
  );
}

export default Register;