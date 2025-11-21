// src/components/Dashboard.jsx
import styles from './Dashboard.module.css';
import { Link } from 'react-router-dom';
import logoOhana from '../assets/ohana1.jpg'; // (Asegúrate que la ruta sea correcta)

function Dashboard({ onLogout }) {

  const handleLogout = () => {
    onLogout();
  };

  return (
    <div className={styles.dashboardContainer}>
      <nav className={styles.navbar}>
        <img 
          src={logoOhana} 
          alt="Logo Ohana" 
          className={styles.logo} 
        />
        <button onClick={handleLogout} className={styles.logoutButton}>
          Cerrar Sesión
        </button>
      </nav>
      
      <main className={styles.mainContent}>
        <h2>Panel Principal</h2>
        <p>Preparad@ para el dia de hoy, Ponte a chambiar selecciona una opcón.</p>
        
        {/* El grid ahora será un contenedor de "filas" */}
        <div className={styles.grid}>
          
          {/* --- NUEVA ESTRUCTURA HORIZONTAL --- */}
          <Link to="/productos" className={`${styles.card} ${styles.cardPrimary}`}>
            <div className={styles.cardIcon}>
              📦
            </div>
            <div className={styles.cardContent}>
              <h3>Productos</h3>
              <p>Administrar inventario</p>
            </div>
          </Link>
          
          {/* --- NUEVA ESTRUCTURA HORIZONTAL --- */}
          <Link to="/nueva-venta" className={`${styles.card} ${styles.cardSuccess}`}>
            <div className={styles.cardIcon}>
              🛒
            </div>
            <div className={styles.cardContent}>
              <h3>Nueva Venta</h3>
              <p>Registrar una transacción</p>
            </div>
          </Link>
          
          {/* --- NUEVA ESTRUCTURA HORIZONTAL --- */}
          <Link to="/corte-del-dia" className={`${styles.card} ${styles.cardWarning}`}>
            <div className={styles.cardIcon}>
              📊
            </div>
            <div className={styles.cardContent}>
              <h3>Reportes</h3>
              <p>Ver ventas del día</p>
            </div>
          </Link>

          {/* --- NUEVA ESTRUCTURA HORIZONTAL --- */}
          <Link to="/deudores" className={`${styles.card} ${styles.cardInfo}`}>
            <div className={styles.cardIcon}>
              💸
            </div>
            <div className={styles.cardContent}>
              <h3>Deudores</h3>
              <p>Administrar cuentas</p>
            </div>
          </Link>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;