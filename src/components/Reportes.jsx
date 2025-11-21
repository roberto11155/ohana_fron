
import { Link } from 'react-router-dom';
import styles from './Reportes.module.css';
import logoOhana from '/src/assets/ohana1.jpg'; 

// --- HELPERS ---
const formatoDinero = (cantidad) => {
  const numero = parseFloat(cantidad);
  return isNaN(numero) ? '$0.00' : `$${numero.toFixed(2)}`;
};

const formatoFecha = (fechaString) => {
  if (!fechaString) return '-';
  try {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) { return '-'; }
};

const formatoHora = (fechaString) => {
    if (!fechaString) return '-';
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit'});
    } catch (e) { return '-'; }
};

function Reportes() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Datos del reporte
  const [ventasDia, setVentasDia] = useState([]);
  const [ventasMes, setVentasMes] = useState([]);
  const [topProductos, setTopProductos] = useState([]);
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [conteo, setConteo] = useState({ clientes: 0, productos: 0 });

  // Pestaña activa: 'dia', 'mes', 'top'
  const [tabActiva, setTabActiva] = useState('dia'); 

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resDia, resMes, resTop, resTotal, resConteo] = await Promise.all([
        fetch('http://localhost:3000/api/reportes/ventas-dia'),
        fetch('http://localhost:3000/api/reportes/ventas-mes'),
        fetch('http://localhost:3000/api/reportes/mas-vendidos'),
        fetch('http://localhost:3000/api/reportes/total-ingresos'),
        fetch('http://localhost:3000/api/reportes/conteo-datos')
      ]);

      const dataDia = await resDia.json();
      const dataMes = await resMes.json();
      const dataTop = await resTop.json();
      const dataTotal = await resTotal.json();
      const dataConteo = await resConteo.json();

      setVentasDia(Array.isArray(dataDia) ? dataDia : []);
      setVentasMes(Array.isArray(dataMes) ? dataMes : []);
      setTopProductos(Array.isArray(dataTop) ? dataTop : []);
      setTotalIngresos(dataTotal.ingresos_totales || 0);
      setConteo(dataConteo);

      setLoading(false);
    } catch (err) {
      console.error("Error cargando reportes:", err);
      setError("No se pudo conectar con el servidor de reportes.");
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.loading}>Generando reporte...</div>;
  if (error) return <div className={styles.error}>⚠️ {error}</div>;

  const totalVentasHoy = ventasDia.reduce((acc, v) => acc + parseFloat(v.total), 0);

  return (
    <div className={styles.pageContainer}>
      
      {/* --- MENÚ LATERAL --- */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <img src={logoOhana} alt="Logo" className={styles.sidebarLogo} />
          <h2>Reportes</h2>
        </div>
        
        <nav className={styles.navMenu}>
          <button 
            className={`${styles.navBtn} ${tabActiva === 'dia' ? styles.active : ''}`}
            onClick={() => setTabActiva('dia')}
          >
            📅 Ventas de Hoy
          </button>
          <button 
            className={`${styles.navBtn} ${tabActiva === 'mes' ? styles.active : ''}`}
            onClick={() => setTabActiva('mes')}
          >
            📆 Ventas del Mes
          </button>
          <button 
            className={`${styles.navBtn} ${tabActiva === 'top' ? styles.active : ''}`}
            onClick={() => setTabActiva('top')}
          >
            🏆 Productos Top
          </button>
          
          <div className={styles.separator}></div>
          
          <Link to="/dashboard" className={styles.navLink}>🔙 Volver al Panel</Link>
        </nav>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className={styles.mainContent}>
        
        {/* KPIs */}
        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <h3>Ventas Hoy</h3>
            <p className={styles.kpiValue}>{formatoDinero(totalVentasHoy)}</p>
            <span className={styles.kpiLabel}>{ventasDia.length} ventas</span>
          </div>
          <div className={styles.kpiCard}>
            <h3>Ingresos Totales</h3>
            <p className={styles.kpiValue} style={{color: '#10b981'}}>{formatoDinero(totalIngresos)}</p>
            <span className={styles.kpiLabel}>Histórico acumulado</span>
          </div>
          <div className={styles.kpiCard}>
            <h3>Catálogo</h3>
            <p className={styles.kpiValue} style={{color: '#3b82f6'}}>{conteo.productos}</p>
            <span className={styles.kpiLabel}>Productos activos</span>
          </div>
          <div className={styles.kpiCard}>
            <h3>Clientes</h3>
            <p className={styles.kpiValue} style={{color: '#8b5cf6'}}>{conteo.clientes}</p>
            <span className={styles.kpiLabel}>Registrados</span>
          </div>
        </div>

        {/* --- TABLA DINÁMICA --- */}
        <div className={styles.contentCard}>
          
          {/* VISTA: DÍA */}
          {tabActiva === 'dia' && (
            <>
              <div className={styles.cardHeader}>
                <h2>Detalle de Ventas (Hoy)</h2>
                <button className={styles.printBtn} onClick={() => window.print()}>🖨️ Imprimir</button>
              </div>
              {ventasDia.length === 0 ? (
                <p className={styles.emptyState}>No hay ventas hoy.</p>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Hora</th>
                      <th>Cliente</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventasDia.map(v => (
                      <tr key={v.id}>
                        <td>#{v.id}</td>
                        {/* Usamos creado_en aquí */}
                        <td>{formatoHora(v.creado_en)}</td>
                        <td>{v.cliente || 'Público General'}</td>
                        <td className={styles.amount}>{formatoDinero(v.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {/* VISTA: MES */}
          {tabActiva === 'mes' && (
            <>
              <div className={styles.cardHeader}>
                <h2>Historial del Mes</h2>
                <button className={styles.printBtn} onClick={() => window.print()}>🖨️ Imprimir</button>
              </div>
              {ventasMes.length === 0 ? (
                <p className={styles.emptyState}>No hay ventas este mes.</p>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>ID Venta</th>
                      <th>Cliente</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventasMes.map(v => (
                      <tr key={v.id}>
                        {/* Usamos creado_en aquí también */}
                        <td>{formatoFecha(v.creado_en)}</td>
                        <td>#{v.id}</td>
                        <td>{v.cliente || 'Público General'}</td>
                        <td className={styles.amount}>{formatoDinero(v.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {/* VISTA: TOP PRODUCTOS */}
          {tabActiva === 'top' && (
            <>
              <div className={styles.cardHeader}>
                <h2>🏆 Top 10 Más Vendidos</h2>
              </div>
              {topProductos.length === 0 ? (
                <p className={styles.emptyState}>Aún no hay datos suficientes.</p>
              ) : (
                <div className={styles.topListContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Producto</th>
                        <th style={{textAlign:'center'}}>Vendidos</th>
                        <th>Popularidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProductos.map((p, index) => {
                        const maxVentas = parseInt(topProductos[0].total_vendido);
                        const porcentaje = (parseInt(p.total_vendido) / maxVentas) * 100;
                        
                        return (
                          <tr key={index}>
                            <td className={styles.rankCell}>
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                            </td>
                            <td style={{fontWeight: '600'}}>{p.nombre}</td>
                            <td style={{textAlign: 'center', fontSize: '1.1rem'}}>{p.total_vendido}</td>
                            <td style={{width: '35%'}}>
                              <div className={styles.progressBarContainer}>
                                <div 
                                  className={styles.progressBar} 
                                  style={{width: `${porcentaje}%`}}
                                ></div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

        </div>
      </main>
    </div>
  );
}

export default Reportes;