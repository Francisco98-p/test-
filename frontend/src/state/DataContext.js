import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async ({ signal = null } = {}) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('http://localhost:3001/api/items?limit=500', {
        signal
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      
      // Handle the format returned by your improved backend
      if (json.items && Array.isArray(json.items)) {
        // New backend format: { items: [], pagination: {} }
        setItems(json.items);
      } else if (Array.isArray(json)) {
        // Fallback for array format
        setItems(json);
      } else if (json.data) {
        // Alternative object format
        setItems(json.data);
      } else {
        setItems([]);
      }

    } catch (err) {
      if (err.name === 'AbortError') {
        // Request was cancelled, don't set error
        return;
      }
      console.error('Failed to fetch items:', err);
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <DataContext.Provider value={{
      items,
      loading,
      error,
      fetchItems
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};