import React, { useEffect, useState, useMemo } from 'react';
import { useData } from '../state/DataContext';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Link } from 'react-router-dom';

// Componente para una fila de la lista virtualizada
const Row = ({ index, style, data }) => {
  const item = data.items[index];
  if (!item) return null;

  return (
    <div style={style} className="item-row">
      <Link to={`/items/${item.id}`} className="item-link">
        <div className="item-content">
          <h3 className="item-name">{item.name}</h3>
          {item.price && (
            <span className="item-price">${item.price}</span>
          )}
          {item.description && (
            <p className="item-description">{item.description}</p>
          )}
        </div>
      </Link>
    </div>
  );
};

function Items() {
  const { items, fetchItems, loading, totalItems } = useData();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');

  // Sincronizar el estado de la lista con la URL y el backend
  useEffect(() => {
    // Almacena un controlador de aborto para poder cancelar la petición si el componente se desmonta
    const abortController = new AbortController();

    // Función asíncrona para cargar ítems del backend
    const loadItems = async () => {
      try {
        await fetchItems({ 
          signal: abortController.signal, 
          page, 
          query 
        });
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Fetch aborted.');
        } else {
          console.error('Failed to load items:', err);
        }
      }
    };
    
    // Llama a la función de carga
    loadItems();

    // Función de limpieza para cancelar la petición en curso si el componente se desmonta
    return () => {
      abortController.abort();
    };
  }, [fetchItems, page, query]);

  // Manejo de paginación
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / 10); // Asume 10 ítems por página
  }, [totalItems]);

  // Manejo de búsqueda
  const handleSearchChange = (e) => {
    setQuery(e.target.value);
    setPage(1); // Reiniciar la paginación al realizar una nueva búsqueda
  };

  // Estados de la UI/UX
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando ítems...</p>
      </div>
    );
  }

  if (items.length === 0 && !loading) {
    return (
      <div className="empty-state-container">
        <h2 className="empty-state-title">No se encontraron ítems</h2>
        <p className="empty-state-text">Intenta ajustar tu búsqueda o crea un nuevo ítem.</p>
        <div className="search-bar-container">
            <input
                type="text"
                value={query}
                onChange={handleSearchChange}
                placeholder="Buscar ítems..."
                className="search-input"
            />
        </div>
      </div>
    );
  }

  // Renderizar la lista virtualizada si hay ítems
  return (
    <div className="items-page-container">
      <div className="search-bar-container">
        <input
            type="text"
            value={query}
            onChange={handleSearchChange}
            placeholder="Buscar ítems..."
            className="search-input"
        />
      </div>
      
      {/* Contenedor principal para la lista virtualizada */}
      <div className="items-list-virtualized-container">
        <AutoSizer>
          {({ height, width }) => (
            <List
              className="items-list"
              height={height}
              itemCount={items.length}
              itemSize={80} // Altura de cada fila en píxeles
              width={width}
              itemData={{ items }}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </div>

      {/* Controles de paginación */}
      <div className="pagination-container">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
          className="pagination-button"
        >
          Anterior
        </button>
        <span className="pagination-info">Página {page} de {totalPages}</span>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
          className="pagination-button"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

export default Items;