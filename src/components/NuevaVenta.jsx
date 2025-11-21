import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './NuevaVenta.module.css';
import logoOhana from '/src/assets/ohana1.jpg'; 

function NuevaVenta() {
  const [ticket, setTicket] = useState([]);
  const [codigo, setCodigo] = useState('');
  const [total, setTotal] = useState(0);
  
  // Estado para manejar múltiples resultados de búsqueda
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // --- FUNCIÓN PARA AGREGAR UN PRODUCTO ESPECÍFICO AL TICKET ---
  const procesarProducto = (productoEncontrado) => {
    const costo = productoEncontrado.precio_costo || productoEncontrado.precio_compra || 0;
    const tipoLimpio = (productoEncontrado.tipo ? productoEncontrado.tipo.trim().toLowerCase() : 'unidad');
    const precioVentaNumerico = parseFloat(productoEncontrado.precio_venta) || 0;
    const proveedor = productoEncontrado.proveedor || '-'; // Guardamos el proveedor
    
    // Si ya existe en el ticket, solo aumentamos cantidad
    const productoExistenteIndex = ticket.findIndex(p => p.codigo === productoEncontrado.codigo_barras);
    if (productoExistenteIndex >= 0) {
        handleCambiarCantidad(productoExistenteIndex, 1);
        return;
    }

    let nuevoProducto;
    
    if (tipoLimpio === 'unidad' || tipoLimpio === 'paquete') {
        nuevoProducto = {
            codigo: productoEncontrado.codigo_barras,
            descripcion: productoEncontrado.nombre,
            proveedor: proveedor, 
            precio: precioVentaNumerico, 
            cantidad: 1,
            importe: precioVentaNumerico * 1, 
            producto_id: productoEncontrado.id, 
            precio_unitario: precioVentaNumerico,
            costo_unitario: costo 
        };
    } else if (tipoLimpio === 'peso') {
        const peso = parseFloat(prompt(`¿Cuántos kilos de ${productoEncontrado.nombre}?`));
        if (!peso || isNaN(peso)) return;
        nuevoProducto = {
            codigo: productoEncontrado.codigo_barras,
            descripcion: productoEncontrado.nombre,
            proveedor: proveedor,
            precio: precioVentaNumerico,
            cantidad: peso.toFixed(3),
            importe: precioVentaNumerico * peso,
            producto_id: productoEncontrado.id,
            precio_unitario: precioVentaNumerico,
            costo_unitario: costo
        };
    }

    if (nuevoProducto && nuevoProducto.importe !== undefined) {
        setTicket(ticketActual => [...ticketActual, nuevoProducto]);
        setTotal(totalActual => totalActual + nuevoProducto.importe);
    } else {
        alert(`Error: Tipo de producto no reconocido ('${tipoLimpio}').`);
    }
  };

  // --- FUNCIÓN DE BÚSQUEDA ---
  const handleBuscar = async (e) => {
    e.preventDefault();
    if (!codigo) return;

    try {
      const url = `http://localhost:3000/api/productos/buscar/${codigo}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          alert("Producto no encontrado");
        } else {
          alert("Error al buscar.");
        }
        setCodigo('');
        return;
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        if (data.length === 1) {
          // Solo 1 resultado: agregar directo
          procesarProducto(data[0]);
          setCodigo('');
          setMostrarResultados(false);
        } else {
          // Varios resultados: mostrar lista
          setResultadosBusqueda(data);
          setMostrarResultados(true);
        }
      } else {
        // Objeto único: agregar directo
        procesarProducto(data);
        setCodigo('');
        setMostrarResultados(false);
      }

    } catch (err) {
      console.error('Error:', err);
      alert('Error de conexión.');
    }
  };

  const handleSeleccionarProducto = (producto) => {
    procesarProducto(producto);
    setMostrarResultados(false);
    setResultadosBusqueda([]);
    setCodigo('');
  };

  const handleCambiarCantidad = (index, delta) => {
    const nuevoTicket = [...ticket];
    const producto = nuevoTicket[index];
    let nuevaCantidad = parseFloat(producto.cantidad) + delta;
    if (nuevaCantidad <= 0) return;
    
    if (Number.isInteger(nuevaCantidad)) {
        nuevaCantidad = parseInt(nuevaCantidad);
    } else {
        nuevaCantidad = parseFloat(nuevaCantidad.toFixed(3));
    }

    producto.cantidad = nuevaCantidad;
    producto.importe = producto.precio_unitario * nuevaCantidad;
    setTicket(nuevoTicket);
    const nuevoTotal = nuevoTicket.reduce((acc, item) => acc + item.importe, 0);
    setTotal(nuevoTotal);
  };

  const handleEliminarProducto = (indiceDelProducto) => {
    try {
      const productoAEliminar = ticket[indiceDelProducto];
      if (!productoAEliminar) return; 
      const importeAEliminar = productoAEliminar.importe;
      const nuevoTicket = ticket.filter((_, index) => index !== indiceDelProducto);
      setTicket(nuevoTicket);
      setTotal(totalActual => totalActual - (importeAEliminar || 0));
    } catch (err) {
      console.error("Error al eliminar producto:", err);
    }
  };

  const handleCobrar = async () => {
    if (ticket.length === 0) {
      alert("El ticket está vacío.");
      return;
    }
    const pagoInput = prompt(`Total a pagar: $${total.toFixed(2)}\n\n¿Con cuánto paga el cliente?`);
    if (pagoInput === null) return; 
    const pago = parseFloat(pagoInput);
    if (isNaN(pago) || pago < total) {
      alert("Error: El monto ingresado es inválido o insuficiente.");
      return;
    }
    const cambioCalculado = pago - total;
    const confirmacion = window.confirm(`Confirmar venta?\nCambio: $${cambioCalculado.toFixed(2)}`);
    if (!confirmacion) return;

    try {
      const ventaPayload = {
        cliente_id: 1, 
        efectivo: pago,           
        cambio: cambioCalculado,  
        items: ticket.map(item => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          costo_unitario: item.costo_unitario
        }))
      };

      const response = await fetch('http://localhost:3000/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ventaPayload)
      });

      if (!response.ok) throw new Error('Error al guardar la venta');
      
      alert(`¡Venta guardada! \nRecuerda dar el cambio de: $${cambioCalculado.toFixed(2)}`);
      setTicket([]);
      setTotal(0);
      setCodigo('');
    } catch (error) {
      console.error('Error al cobrar:', error);
      alert(`Error al procesar la venta: ${error.message}`);
    }
  };

  // ESTILOS
  const btnStyle = {
    border: 'none',
    borderRadius: '8px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  };

  const tagStyle = {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const resultsModalStyle = {
    position: 'absolute',
    top: '85px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '90%',
    maxWidth: '600px',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
    zIndex: 100,
    maxHeight: '300px',
    overflowY: 'auto'
  };

  return (
    <div className={styles.pantallaVenta} style={{position: 'relative'}}>
      <header className={styles.areaEntrada}>
        <div className={styles.logoContainer}>
          <img src={logoOhana} alt="Logo Ohana" className={styles.logoOhana} />
          <Link to="/dashboard" className={styles.botonDashboard}>PANEL PRINCIPAL</Link>
        </div>

        <form className={styles.campoBusqueda} onSubmit={handleBuscar}>
          <input
            type="text"
            id="codigo-producto"
            placeholder="Código de barras o Nombre..."
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            autoFocus
            autoComplete="off"
          />
          <button type="submit" className={styles.botonAgregar}>Buscar/Agregar</button>
        </form>

        <div className={styles.accionesHeader}>
          <Link to="/corte-del-dia" className={styles.botonCorte}>Corte del Día</Link>
        </div>
      </header>

      {mostrarResultados && (
        <div style={resultsModalStyle}>
          <div style={{padding: '10px', background: '#f8f9fa', borderBottom: '1px solid #eee', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between'}}>
            <span>Selecciona un producto:</span>
            <button onClick={() => setMostrarResultados(false)} style={{border: 'none', background: 'none', cursor: 'pointer'}}>✖</button>
          </div>
          <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
            {resultadosBusqueda.map((prod) => (
              <li key={prod.id}>
                <button 
                  onClick={() => handleSeleccionarProducto(prod)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 15px',
                    border: 'none',
                    background: 'white',
                    borderBottom: '1px solid #f1f1f1',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.95rem'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#f0f9ff'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                >
                  <span>{prod.nombre}</span>
                  <span style={{fontWeight: 'bold', color: '#059669'}}>${parseFloat(prod.precio_venta).toFixed(2)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <main className={styles.areaTicket}>
        <div className={styles.ticketWrapper}>
          <table className={styles.tablaTicket}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th style={{textAlign: 'center'}}>Proveedor</th>
                <th>Precio</th>
                <th style={{textAlign: 'center'}}>Cantidad</th>
                <th>Importe</th>
                <th style={{textAlign: 'center'}}>Quitar</th>
              </tr>
            </thead>
            <tbody>
              {ticket.map((producto, index) => (
                producto ? (
                  <tr key={index}>
                    <td style={{color: '#666', fontFamily: 'monospace'}}>{producto.codigo}</td>
                    <td style={{fontWeight: '600', color: '#333'}}>{producto.descripcion || 'N/A'}</td>
                    
                    <td style={{textAlign: 'center'}}>
                        <span style={{...tagStyle, backgroundColor: '#eef2ff', color: '#6366f1', border: '1px solid #c7d2fe'}}>
                            {producto.proveedor}
                        </span>
                    </td>

                    <td style={{color: '#10b981', fontWeight: 'bold'}}>${producto.precio.toFixed(2)}</td>
                    
                    <td>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
                            <button onClick={() => handleCambiarCantidad(index, -1)} style={{...btnStyle, background: '#fee2e2', color: '#ef4444'}}>−</button>
                            <span style={{fontWeight: '700', minWidth: '35px', textAlign: 'center', fontSize: '1.1rem', color: '#1f2937'}}>
                                {producto.cantidad}
                            </span>
                            <button onClick={() => handleCambiarCantidad(index, 1)} style={{...btnStyle, background: '#e0f2fe', color: '#0284c7'}}>+</button>
                        </div>
                    </td>

                    <td style={{fontWeight: 'bold'}}>${producto.importe.toFixed(2)}</td>
                    
                    <td style={{textAlign: 'center'}}>
                      <button className={styles.botonEliminar} onClick={() => handleEliminarProducto(index)}>🗑️</button>
                    </td>
                  </tr>
                ) : null 
              ))}
              {ticket.length === 0 && (
                <tr>
                  <td colSpan="7" className={styles.ticketVacio}>
                    <span style={{fontSize: '3rem', display: 'block', marginBottom: '1rem'}}>🛒</span>
                    Escanea un código o escribe el nombre del producto...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      <footer className={styles.areaCobro}>
        <div className={styles.displayTotal}>
          <span>Total a Pagar:</span>
          <span className={styles.montoTotal}>${total.toFixed(2)}</span>
        </div>
        <button className={styles.botonCobrar} disabled={ticket.length === 0} onClick={handleCobrar}>
          Cobrar (F12)
        </button>
      </footer>
    </div>
  );
}

export default NuevaVenta;