const request = require('supertest');
const { app, server } = require('../src/index');
const { cleanup: itemsCleanup } = require('../src/routes/items');
const { cleanup: statsCleanup } = require('../src/routes/stats');

describe('Items API', () => {
  afterAll(async () => {
    // Cierra el servidor y limpia los recursos de los routers
    await server.close();
    await itemsCleanup();
    await statsCleanup();
  });

  // Test suite for GET /api/items
  describe('GET /api/items', () => {
    test('debería devolver un objeto con una lista de ítems', async () => {
      const response = await request(app).get('/api/items');
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('items');
      expect(Array.isArray(response.body.items)).toBe(true);
    });
  });

  // Test suite for GET /api/items/:id
  describe('GET /api/items/:id', () => {
    let createdItem;

    beforeAll(async () => {
      // Crea un ítem de prueba antes de la suite de tests
      const newItem = {
        name: 'Item para testear GET',
        category: 'Test', // Añadido
        price: 150.50,
      };
      const response = await request(app).post('/api/items').send(newItem);
      createdItem = response.body;
    });

    test('debería devolver un ítem específico', async () => {
      if (!createdItem) {
        console.warn('No se pudo crear el ítem para esta prueba, omitiendo.');
        return;
      }
      const response = await request(app).get(`/api/items/${createdItem.id}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(createdItem.id);
      expect(response.body.name).toBe(createdItem.name);
    });

    test('debería devolver 404 si el ítem no existe', async () => {
      const response = await request(app).get('/api/items/999999999999');
      expect(response.statusCode).toBe(404);
      // CORRECCIÓN: el mensaje esperado debe coincidir con el del código de la API
      expect(response.body).toHaveProperty('error', 'Item no encontrado');
    });
  });

  // Test suite for POST, PUT, DELETE
  describe('CRUD operations', () => {
    let itemId;

    test('POST /api/items debería crear un nuevo ítem', async () => {
      const newItem = {
        name: 'Test Item From Jest',
        price: 100,
        category: 'Electronics', // CORRECCIÓN: Añadir la categoría
      };
      const response = await request(app).post('/api/items').send(newItem);
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Item From Jest');
      expect(response.body.price).toBe(100);
      expect(response.body.category).toBe('Electronics');
      itemId = response.body.id;
    });

    test('PUT /api/items/:id debería actualizar un ítem existente', async () => {
      const updateData = { name: 'Updated Item', price: 300, category: 'Furniture' };
      const response = await request(app).put(`/api/items/${itemId}`).send(updateData);
      expect(response.statusCode).toBe(200);
      expect(response.body.name).toBe('Updated Item');
      expect(response.body.price).toBe(300);
    });

    test('DELETE /api/items/:id debería eliminar un ítem existente', async () => {
      const response = await request(app).delete(`/api/items/${itemId}`);
      expect(response.statusCode).toBe(204);
      // Opcional: verificar que el ítem ya no existe
      const getResponse = await request(app).get(`/api/items/${itemId}`);
      expect(getResponse.statusCode).toBe(404);
    });
  });
});

