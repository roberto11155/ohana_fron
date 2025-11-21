// src/components/ProductModal.jsx
import { useState, useEffect } from 'react';
import styles from './ProductModal.module.css';

// --- CORRECCIÓN: Agregamos es_oferta: false al estado inicial ---
const initialState = {
  nombre: '',
  precio_venta: '',
  precio_compra: '',
  stock: '',
  codigo_barras: '',
  proveedor: '',
  es_oferta: false // <--- ESTO FALTABA Y ES MUY IMPORTANTE
};

function ProductModal({ isOpen, onClose, onSave, product }) {
  const [formData, setFormData] = useState(initialState);

  // EFECTO: Rellenar el formulario
  useEffect(() => {
    if (product) {
      // Modo 'Editar'
      setFormData({
        nombre: product.nombre || '',
        precio_venta: product.precio_venta || '',
        precio_compra: product.precio_compra || '',
        stock: product.stock || '',
        codigo_barras: product.codigo_barras || '',
        proveedor: product.proveedor || '',
        // Aseguramos que lea bien si es true o 1
        es_oferta: product.es_oferta === true || product.es_oferta === 1
      });
    } else {
      // Modo 'Agregar' - Reseteamos todo a vacío/falso
      setFormData(initialState);
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Si es checkbox usamos 'checked', si es texto usamos 'value'
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>
          {product ? 'Editar Producto' : 'Agregar Nuevo Producto'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="nombre">Nombre del Producto</label>
            <input
              type="text" id="nombre" name="nombre"
              value={formData.nombre} onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="precio_venta">Precio de Venta ($)</label>
              <input
                type="number" id="precio_venta" name="precio_venta"
                value={formData.precio_venta} onChange={handleChange}
                step="0.01" min="0" required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="precio_compra">Precio de Compra ($)</label>
              <input
                type="number" id="precio_compra" name="precio_compra"
                value={formData.precio_compra} onChange={handleChange}
                step="0.01" min="0"
              />
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="proveedor">Proveedor</label>
            <input
              type="text" id="proveedor" name="proveedor"
              value={formData.proveedor} onChange={handleChange}
              placeholder="Ej: Coca Cola, Sabritas..."
            />
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="stock">Stock (Inventario)</label>
              <input
                type="number" id="stock" name="stock"
                value={formData.stock} onChange={handleChange}
                step="1" min="0"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="codigo_barras">Código de Barras</label>
              <input
                type="text" id="codigo_barras" name="codigo_barras"
                value={formData.codigo_barras} onChange={handleChange}
              />
            </div>
          </div>

          {/* --- SECCIÓN DE OFERTA (Visualmente Naranja) --- */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            margin: '1.5rem 0', padding: '12px',
            backgroundColor: '#fff7ed', borderRadius: '10px',
            border: '1px dashed #f97316'
          }}>
            <input 
              type="checkbox" id="es_oferta" name="es_oferta"
              checked={formData.es_oferta}
              onChange={handleChange}
              style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#ea580c' }}
            />
            <label htmlFor="es_oferta" style={{ 
              cursor: 'pointer', fontWeight: '800', color: '#ea580c', margin: 0
            }}>
              🔥 Marcar como Oferta Hot
            </label>
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveButton}>
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductModal;