import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './CorteDelDia.module.css';

// NOTA: En tu PC, descomenta la línea de importación real
import logoOhana from '../assets/ohana1.jpg';


const BASE_URL = 'http://localhost:3000/api/reportes'; 

// --- HELPERS ---
const formatoDinero = (cantidad) => {
  const numero = parseFloat(cantidad);
  return isNaN(numero) ? '$0.00' : `$${numero.toFixed(2)}`;
};

const formatoFecha = (fechaString) => {
  if (!fechaString) return '-';
  const fecha = new Date(fechaString);
  return new Date(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
};

const formatoFechaLarga = (fechaString) => {
  if (!fechaString) return '-';
  const fecha = new Date(fechaString);
  return new Date(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const formatoHora = (fechaString) => {
  if (!fechaString) return '-';
  const fecha = new Date(fechaString);
  return fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute:'2-digit', hour12: true });
};

function CorteDelDia({ onLogout }) { 
  const [ventas, setVentas] = useState([]);         // Datos crudos
  const [datosTabla, setDatosTabla] = useState([]); // Datos para tabla principal
  const [chartData, setChartData] = useState([]);   // Datos gráfica
  
  // Estados para el Modal de Detalle
  const [modalOpen, setModalOpen] = useState(false);
  const [ventasDiaDetalle, setVentasDiaDetalle] = useState([]);
  const [fechaDetalle, setFechaDetalle] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  
  const [filtro, setFiltro] = useState('dia'); // 'dia' | 'mes'

  useEffect(() => {
    cargarDatos();
  }, [filtro]);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = filtro === 'dia' ? '/ventas-dia' : '/ventas-mes';
      const response = await fetch(`${BASE_URL}${endpoint}`);
      
      if (!response.ok) throw new Error(`Error de conexión.`);
      
      const data = await response.json();
      const listaVentas = Array.isArray(data) ? data : (data.ventas || []);
      
      setVentas(listaVentas);

      // --- LÓGICA DE AGRUPACIÓN ---
      if (filtro === 'dia') {
        setDatosTabla(listaVentas);
        
        // Gráfica por hora
        const ventasPorHora = {};
        listaVentas.forEach(v => {
          const hora = new Date(v.creado_en).getHours();
          const etiqueta = `${hora}:00`;
          ventasPorHora[etiqueta] = (ventasPorHora[etiqueta] || 0) + parseFloat(v.total);
        });
        const graficaDia = Object.keys(ventasPorHora).map(key => ({ label: key, value: ventasPorHora[key] }));
        setChartData(graficaDia.length ? graficaDia : [{ label: 'Hoy', value: 0 }]);

      } else {
        // MODO MES: Agrupar por fecha
        const cortesDiarios = {};
        listaVentas.forEach(v => {
          const fechaObj = new Date(v.creado_en);
          const fechaKey = fechaObj.toISOString().split('T')[0]; 
          
          if (!cortesDiarios[fechaKey]) {
            cortesDiarios[fechaKey] = {
              id: fechaKey,
              fecha: fechaKey, 
              concepto: `Corte del día`,
              total: 0,
              efectivo: 0,
              cambio: 0,
              transacciones: 0
            };
          }
          cortesDiarios[fechaKey].total += parseFloat(v.total || 0);
          cortesDiarios[fechaKey].efectivo += parseFloat(v.efectivo || 0);
          cortesDiarios[fechaKey].cambio += parseFloat(v.cambio || 0);
          cortesDiarios[fechaKey].transacciones += 1;
        });

        const listaCortes = Object.values(cortesDiarios).sort((a, b) => a.fecha.localeCompare(b.fecha));
        setDatosTabla(listaCortes);

        const graficaMes = listaCortes.map(corte => {
            const dia = new Date(corte.fecha).getUTCDate();
            return { label: `${dia}`, value: corte.total };
        });
        setChartData(graficaMes.length ? graficaMes : [{ label: 'Este Mes', value: 0 }]);
      }
      
      const sumaTotal = listaVentas.reduce((acc, v) => acc + (parseFloat(v.total) || 0), 0);
      setTotal(sumaTotal);

    } catch (err) {
      console.error(err);
      setVentas([]); setDatosTabla([]); setChartData([{ label: 'Sin datos', value: 0 }]); setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNCIÓN PARA ABRIR MODAL ---
  const verDetalleDia = (fechaIso) => {
    // Solo aplica si estamos en vista mensual
    if (filtro === 'dia') return;

    // Filtramos las ventas originales para encontrar las de ese día
    const ventasDelDia = ventas.filter(v => {
       const vFecha = new Date(v.creado_en).toISOString().split('T')[0];
       return vFecha === fechaIso;
    });

    setVentasDiaDetalle(ventasDelDia);
    setFechaDetalle(fechaIso);
    setModalOpen(true);
  };

  const handleImprimir = () => window.print();

  const handleLogoutLocal = () => {
    if(window.confirm("¿Cerrar sesión?")) {
        if (onLogout) onLogout();
        else window.location.href = '/login';
    }
  };

  const tituloReporte = filtro === 'dia' ? 'Corte del Día' : 'Reporte Mensual de Ventas';
  const fechaHoy = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  const maxValue = Math.max(...chartData.map(d => d.value), 100);

  return (
    <div className={styles.pageContainer}>
      
      <nav className={styles.navbar}>
        <div className={styles.logoContainer}>
          <img src={logoOhana} alt="Ohana" className={styles.logoOhana} />
          <Link to="/dashboard" className={styles.backButton}>← Volver al Panel</Link>
        </div>
        <button onClick={handleLogoutLocal} className={styles.logoutButton}>Salir</button>
      </nav>

      <div className={styles.mainContent}>
        <div className={styles.card}>
          
          <div className={styles.cardHeader}>
            <div className={styles.headerTitles}>
              <h1>{tituloReporte}</h1>
              <p className={styles.fechaBadge}>{fechaHoy}</p>
            </div>
            
            <div className={styles.filterGroup}>
              <button className={`${styles.filterBtn} ${filtro === 'dia' ? styles.active : ''}`} onClick={() => setFiltro('dia')}>Hoy</button>
              <button className={`${styles.filterBtn} ${filtro === 'mes' ? styles.active : ''}`} onClick={() => setFiltro('mes')}>Este Mes</button>
            </div>
          </div>

          <div className={styles.summarySection}>
            <span className={styles.summaryLabel}>Ingreso Total ({filtro === 'dia' ? 'Hoy' : 'Acumulado Mes'})</span>
            <span className={styles.summaryTotal}>{formatoDinero(total)}</span>
          </div>

          {!loading && (
            <div className={styles.chartContainer}>
              <h3 className={styles.chartTitle}>
                {filtro === 'mes' ? 'Ventas Diarias (Día del Mes)' : 'Ventas por Hora (Hoy)'}
              </h3>
              <div className={styles.chartArea}>
                {chartData.map((data, index) => (
                  <div key={index} className={styles.chartColumn}>
                    <div 
                      className={styles.chartBar} 
                      style={{ height: `${(data.value / maxValue) * 100}%` }}
                      data-value={formatoDinero(data.value)}
                    ></div>
                    <span className={styles.chartLabel}>{data.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && <div className={styles.loading}>Cargando...</div>}
          {error && <div className={styles.error}>{error}</div>}

          {!loading && datosTabla.length > 0 && (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{filtro === 'dia' ? 'Hora' : 'Fecha'}</th>
                    <th>Concepto</th>
                    <th className={styles.textRight}>Total Venta</th>
                    <th className={styles.textRight}>{filtro === 'dia' ? 'Pago' : 'Transacciones'}</th>
                    <th className={styles.textRight}>{filtro === 'dia' ? 'Cambio' : 'Promedio'}</th>
                  </tr>
                </thead>
                <tbody>
                  {datosTabla.map((item, idx) => (
                    <tr key={item.id || idx}>
                      {/* --- FECHA CLICKEABLE EN MODO MES --- */}
                      <td 
                        onClick={() => verDetalleDia(item.fecha)}
                        className={filtro === 'mes' ? styles.clickableDate : ''}
                        title={filtro === 'mes' ? "Ver detalles del día" : ""}
                      >
                        {filtro === 'dia' ? formatoHora(item.creado_en) : formatoFecha(item.fecha)}
                      </td>
                      <td>
                        <span className={styles.concepto}>
                          {filtro === 'dia' ? (item.productos_vendidos || 'Venta General') : item.concepto}
                        </span>
                      </td>
                      <td className={`${styles.textRight} ${styles.fontBold}`}>{formatoDinero(item.total)}</td>
                      <td className={styles.textRight}>
                        {filtro === 'dia' ? formatoDinero(item.efectivo) : item.transacciones}
                      </td>
                      <td className={`${styles.textRight} ${styles.cambio}`}>
                         {filtro === 'dia' 
                            ? formatoDinero(item.cambio) 
                            : formatoDinero(item.total / item.transacciones) 
                         }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className={styles.cardFooter}>
            <button onClick={handleImprimir} className={styles.printButton}>🖨 Imprimir Reporte</button>
          </div>

        </div>
      </div>

      {/* --- MODAL DE DETALLE --- */}
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setModalOpen(false)}>×</button>
            
            <div className={styles.modalHeader}>
              <h2>Detalle de Ventas</h2>
              <p>{formatoFechaLarga(fechaDetalle)}</p>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Productos / Concepto</th>
                    <th className={styles.textRight}>Total</th>
                    <th className={styles.textRight}>Pago</th>
                    <th className={styles.textRight}>Cambio</th>
                  </tr>
                </thead>
                <tbody>
                  {ventasDiaDetalle.map((venta, idx) => (
                    <tr key={idx}>
                      <td>{formatoHora(venta.creado_en)}</td>
                      <td><span className={styles.concepto}>{venta.productos_vendidos}</span></td>
                      <td className={`${styles.textRight} ${styles.fontBold}`}>{formatoDinero(venta.total)}</td>
                      <td className={styles.textRight}>{formatoDinero(venta.efectivo)}</td>
                      <td className={`${styles.textRight} ${styles.cambio}`}>{formatoDinero(venta.cambio)}</td>
                    </tr>
                  ))}
                  {ventasDiaDetalle.length === 0 && (
                    <tr><td colSpan="5" style={{textAlign: 'center'}}>No hay detalles disponibles.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default CorteDelDia;