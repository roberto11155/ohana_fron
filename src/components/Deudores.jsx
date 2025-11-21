import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import styles from './Deudores.module.css';

// 👇 IMPORTA TU LOGO AQUÍ (Verifica que la ruta sea correcta)
import logoOhana from '../assets/ohana1.jpg'; 

const Deudores = () => {
  const [deudores, setDeudores] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Notificaciones
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // Formulario
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [nuevaDeuda, setNuevaDeuda] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');

  const API_URL = 'http://localhost:3000/api/deudores';

  // --- Helpers ---
  const mostrarNotificacion = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3500);
  };

  const formatearFecha = (fechaString) => {
    if (!fechaString) return 'Hoy';
    const fecha = new Date(fechaString);
    return new Intl.DateTimeFormat('es-MX', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(fecha);
  };

  // --- API Fetching ---
  const obtenerDeudores = async () => {
    try {
      const respuesta = await fetch(API_URL);
      if (!respuesta.ok) throw new Error('Error');
      const datos = await respuesta.json();
      setDeudores(datos);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const crearDeudor = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nuevoNombre,
          telefono: nuevoTelefono,
          deuda: nuevaDeuda,
          descripcion: nuevaDescripcion
        })
      });

      if (respuesta.ok) {
        setNuevoNombre(''); setNuevoTelefono(''); setNuevaDeuda(''); setNuevaDescripcion('');
        obtenerDeudores(); 
        mostrarNotificacion("😠 ¡Agregado! Debes de pagar", "warning");
      }
    } catch (error) { console.error(error); }
  };

  const eliminarDeudor = async (id) => {
    if (!window.confirm('¿Confirmar que ya pagó?')) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      obtenerDeudores();
      mostrarNotificacion("🤝✨ ¡Gracias por pagar!", "success");
    } catch (error) { console.error(error); }
  };

  useEffect(() => { obtenerDeudores(); }, []);

  // --- RENDERIZADO ---
  return (
    <div className={styles.pageContainer}>
      
      {/* 1. NAVBAR */}
      <nav className={styles.navbar}>
        <div className={styles.logoContainer}>
          {/* 👇 AQUÍ AGREGAMOS EL LOGO */}
          <img src={logoOhana} alt="Ohana Logo" className={styles.imageLogo} />
          
          <h1 className={styles.pageTitle}>Control Deudas</h1>
        </div>
        
        <Link to="/dashboard" className={styles.backButton}>
          ← Volver
        </Link>
      </nav>

      {/* Notificación Flotante */}
      {mensaje.texto && (
        <div className={`${styles.notification} ${styles[mensaje.tipo]}`}>
          {mensaje.texto}
        </div>
      )}

      {/* 2. CONTENIDO PRINCIPAL */}
      <main className={styles.mainContent}>

        {/* TARJETA DE FORMULARIO */}
        <div className={styles.formCard}>
          <h3 className={styles.formTitle}>Nueva Deuda</h3>
          <form onSubmit={crearDeudor} className={styles.formRow}>
            
            <div className={styles.inputGroup}>
              <label className={styles.label}>Nombre Deudor</label>
              <input className={styles.input} type="text" placeholder="¿Quién?" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} required />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Teléfono</label>
              <input className={styles.input} type="text" placeholder="55..." value={nuevoTelefono} onChange={(e) => setNuevoTelefono(e.target.value)} />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Monto ($)</label>
              <input className={styles.input} type="number" placeholder="0.00" value={nuevaDeuda} onChange={(e) => setNuevaDeuda(e.target.value)} required style={{maxWidth: '120px'}} />
            </div>

            <div className={styles.inputGroup} style={{flexGrow: 2}}>
              <label className={styles.label}>Nota / Motivo</label>
              <input className={styles.input} type="text" placeholder="Ej. Fiado..." value={nuevaDescripcion} onChange={(e) => setNuevaDescripcion(e.target.value)} />
            </div>

            <button type="submit" className={styles.btnSave}>AGREGAR</button>
          </form>
        </div>

        {/* GRID DE TARJETAS */}
        {cargando ? (
          <div className={styles.loading}>Cargando datos...</div>
        ) : deudores.length === 0 ? (
          <div className={styles.loading} style={{color: '#888'}}>🎉 ¡Nadie debe nada!</div>
        ) : (
          <div className={styles.productsGrid}>
            {deudores.map((deudor) => (
              <div key={deudor.id} className={styles.debtorCard}>
                
                <div className={styles.cardHeader}>
                  <div className={styles.avatar}>
                    {deudor.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.debtInfo}>
                    <span className={styles.debtAmount}>${deudor.deuda}</span>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <h4 className={styles.debtorName}>{deudor.nombre}</h4>
                  <div className={styles.debtDesc}>
                    {deudor.descripcion || 'Sin nota'}
                  </div>
                  {deudor.telefono && (
                    <div style={{marginTop:'10px', fontSize:'0.9rem', color:'#666'}}>
                      📞 {deudor.telefono}
                    </div>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.dateInfo}>
                    📅 {formatearFecha(deudor.fecha)}
                  </span>
                  <button 
                    className={styles.btnPay} 
                    onClick={() => eliminarDeudor(deudor.id)}
                  >
                    PAGAR ✅
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default Deudores;