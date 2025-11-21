// src/components/ProductList.jsx
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from './ProductList.module.css';
import logoOhana from '/src/assets/ohana1.jpg';
import ProductModal from './ProductModal.jsx';

function ProductList({ onLogout }) {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  
  // --- ESTADO: Filtro seleccionado (puede ser un proveedor, 'TODOS' u 'OFERTAS') ---
  const [selectedProvider, setSelectedProvider] = useState('TODOS');

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:3000/api/productos', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (Array.isArray(response.data)) {
            setProductos(response.data);
        } else {
            setError("Error: Formato de datos incorrecto.");
        }
      } catch (err) {
        console.error("Error:", err);
        setError("No se pudieron cargar los productos.");
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, [token]);

  // --- LÓGICA DE FILTRADO Y PROVEEDORES ---

  // 1. Obtener lista de proveedores únicos
  const providers = useMemo(() => {
    if (!Array.isArray(productos)) return [];
    const unique = [...new Set(productos.map(p => p.proveedor).filter(p => p))];
    return unique.sort();
  }, [productos]);

  // 2. Filtrar productos según la selección
  const filteredProducts = useMemo(() => {
    if (selectedProvider === 'TODOS') {
      return productos;
    }
    // LOGICA NUEVA: Si el usuario seleccionó 'OFERTAS'
    if (selectedProvider === 'OFERTAS') {
      // Filtra productos donde es_oferta sea true o 1
      return productos.filter(p => p.es_oferta === true || p.es_oferta === 1);
    }
    // Filtrado normal por nombre de proveedor
    return productos.filter(p => p.proveedor === selectedProvider);
  }, [productos, selectedProvider]);


  // --- FUNCIONES DEL MODAL ---
  const handleOpenModal = (product = null) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
  };

  const handleSaveProduct = async (productData) => {
    productData.precio_venta = parseFloat(productData.precio_venta) || 0;
    productData.precio_compra = parseFloat(productData.precio_compra) || 0;
    productData.stock = parseInt(productData.stock, 10) || 0;
    
    const headers = { Authorization: `Bearer ${token}` };
    try {
      if (currentProduct) {
        const response = await axios.put(`http://localhost:3000/api/productos/${currentProduct.id}`, productData, { headers });
        setProductos(productos.map(p => (p.id === currentProduct.id ? response.data : p)));
      } else {
        const response = await axios.post('http://localhost:3000/api/productos', productData, { headers });
        setProductos([...productos, response.data]);
      }
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert("Error al guardar");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("¿Eliminar producto?")) {
      try {
        await axios.delete(`http://localhost:3000/api/productos/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProductos(productos.filter(p => p.id !== productId));
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className={styles.pageContainer}>
      
      <nav className={styles.navbar}>
        <div className={styles.logoContainer}>
          <img src={logoOhana} alt="Logo" className={styles.logoOhana} />
          <h1 className={styles.pageTitle}>Administración</h1>
        </div>
        <div className={styles.navActions}>
          <button onClick={() => handleOpenModal(null)} className={styles.addButton}>
             + Nuevo
          </button>
          <Link to="/dashboard" className={styles.backButton}>Panel</Link>
          <button onClick={onLogout} className={styles.logoutButton}>Salir</button>
        </div>
      </nav>

      <main className={styles.mainContent}>
        
        {loading && <p className={styles.loadingMessage}>Cargando...</p>}
        {error && <p className={styles.errorMessage}>{error}</p>}
        
        {!loading && !error && (
          <div className={styles.contentLayout}>
            
            {/* --- SIDEBAR: Navegación y Proveedores --- */}
            <aside className={styles.sidebar}>
              <h3 className={styles.sidebarTitle}>Navegación</h3>
              <ul className={styles.providerList}>
                
                {/* Opción "Ver Todos" */}
                <li 
                  className={`${styles.providerItem} ${selectedProvider === 'TODOS' ? styles.providerItemActive : ''}`}
                  onClick={() => setSelectedProvider('TODOS')}
                >
                  <span>🌈 Ver Todos</span>
                  <span className={styles.providerCount}>{productos.length}</span>
                </li>

                 {/* --- NUEVO: Opción "Ofertas Hot" --- */}
                 <li 
                  className={`${styles.offerItem} ${selectedProvider === 'OFERTAS' ? styles.offerItemActive : ''}`}
                  onClick={() => setSelectedProvider('OFERTAS')}
                >
                  <span>🔥 Ofertas Hot</span>
                  <span className={styles.providerCount}>
                    {/* Cuenta cuántos productos son oferta */}
                    {productos.filter(p => p.es_oferta === true || p.es_oferta === 1).length}
                  </span>
                </li>
              </ul>

              {/* Separador visual */}
              <hr className={styles.sidebarSeparator} />

              <h3 className={styles.sidebarTitle}>Proveedores</h3>
              <ul className={styles.providerList}>
                {/* Lista dinámica de proveedores */}
                {providers.map(prov => (
                  <li 
                    key={prov}
                    className={`${styles.providerItem} ${selectedProvider === prov ? styles.providerItemActive : ''}`}
                    onClick={() => setSelectedProvider(prov)}
                  >
                    <span>{prov}</span>
                    <span className={styles.providerCount}>
                      {productos.filter(p => p.proveedor === prov).length}
                    </span>
                  </li>
                ))}
              </ul>
            </aside>

            {/* --- GRID DE PRODUCTOS --- */}
            <div className={styles.gridContainer}>
              {filteredProducts.length === 0 ? (
                <p className={styles.noProductsMessage}>
                  {selectedProvider === 'OFERTAS' 
                    ? "No hay ofertas activas en este momento 😢" 
                    : "No hay productos para este proveedor."}
                </p>
              ) : (
                <div className={styles.productsGrid}>
                  {filteredProducts.map((producto) => ( 
                    <div key={producto.id} className={styles.productCard}>
                      
                      {/* --- NUEVO: Badge si es Oferta --- */}
                      {(producto.es_oferta === true || producto.es_oferta === 1) && (
                        <div className={styles.badgeOffer}>OFF %</div>
                      )}

                      <div className={styles.cardHeader}>
                        <div className={styles.imagePlaceholder}>
                          <span className={styles.icon}>📦</span>
                        </div>
                        <div className={styles.titleGroup}>
                          <h3 className={styles.productName}>{producto.nombre}</h3>
                          <p className={styles.productProvider}>{producto.proveedor || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div className={styles.cardBody}>
                        <p className={styles.productDetails}>
                          <strong>Cód:</strong> {producto.codigo_barras || 'N/A'}
                        </p>
                        <p className={styles.productDetails}>
                          <strong>Stock:</strong> {producto.stock || 0} un.
                        </p>
                      </div>

                      <div className={styles.cardFooter}>
                        <div className={styles.priceContainer}>
                          <p className={styles.productPrice}>${parseFloat(producto.precio_venta || 0).toFixed(2)}</p>
                          <p className={styles.productCost}>Costo: ${parseFloat(producto.precio_compra || 0).toFixed(2)}</p>
                        </div>
                        <div className={styles.cardActions}>
                          <button onClick={() => handleOpenModal(producto)} className={styles.editButton}>✏️</button>
                          <button onClick={() => handleDeleteProduct(producto.id)} className={styles.deleteButton}>🗑️</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
          </div>
        )}
      </main>

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProduct}
        product={currentProduct}
      />
    </div>
  );
}

export default ProductList;