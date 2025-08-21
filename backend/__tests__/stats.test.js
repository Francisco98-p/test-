const request = require('supertest');
const { app, server } = require('../src/index');
const { cleanup } = require('../src/routes/stats'); // Importa la función de limpieza

// Limpiar después de que todos los tests hayan terminado
afterAll(async () => {
  await cleanup(); // Cierra el watcher
  server.close(); // Cierra el servidor
});

describe('Stats API', () => {
  describe('GET /api/stats (ruta principal)', () => {
    test('debería devolver estadísticas generales', async () => {
      const response = await request(app).get('/api/stats').expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('totalValue');
      expect(response.body).toHaveProperty('averagePrice');
      expect(response.body).toHaveProperty('lastUpdated');
    });

    test('debería incluir información de categorías como un objeto', async () => {
      const response = await request(app).get('/api/stats').expect(200);

      // CORRECCIÓN: 'categories' debe ser un objeto, no un array
      if (response.body.categories) {
        expect(typeof response.body.categories).toBe('object');
        expect(Array.isArray(response.body.categories)).toBe(false); // Asegurarse de que NO es un array

        // Opcional: Validar que si hay categorías, tengan valores numéricos
        const categoryKeys = Object.keys(response.body.categories);
        if (categoryKeys.length > 0) {
          const firstCategoryName = categoryKeys[0];
          expect(typeof response.body.categories[firstCategoryName]).toBe('number');
        }
      }
    });

    test('debería devolver números válidos', async () => {
      const response = await request(app).get('/api/stats');
      expect(typeof response.body.total).toBe('number');
      expect(typeof response.body.totalValue).toBe('number');
      expect(typeof response.body.averagePrice).toBe('number');
    });

    test('debería incluir timestamp válido', async () => {
      const response = await request(app).get('/api/stats');
      const date = new Date(response.body.lastUpdated);
      expect(date.getTime()).toBeGreaterThan(0);
    });
  });
});