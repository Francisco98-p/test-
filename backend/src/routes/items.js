const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const router = express.Router();
const dataPath = path.join(__dirname, "../../data/items.json");
const dataDir = path.join(__dirname, "../../data");

/**
 * Helper: leer archivo asincrónicamente
 */
async function getItems() {
  try {
    const data = await fs.readFile(dataPath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

/**
 * Helper: guardar archivo asincrónicamente
 * Agregada validación para crear el directorio si no existe.
 */
async function saveItems(items) {
  // Asegurarse de que el directorio 'data' exista antes de escribir el archivo
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (err) {
    console.error("Error al crear el directorio 'data':", err);
    throw err;
  }
  await fs.writeFile(dataPath, JSON.stringify(items, null, 2));
}

// GET /api/items → devuelve todos los ítems
router.get("/", async (req, res) => {
  try {
    const items = await getItems();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: "Error al leer items" });
  }
});

// GET /api/items/:id → devuelve un ítem por ID
router.get("/:id", async (req, res) => {
  try {
    const items = await getItems();
    const item = items.find(i => i.id === parseInt(req.params.id));
    if (!item) return res.status(404).json({ error: "Item no encontrado" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Error al leer item" });
  }
});

// POST /api/items → agrega un nuevo ítem
router.post("/", async (req, res) => {
  try {
    const items = await getItems();
    const { name, category, price } = req.body;

    if (!name || !category || typeof price !== 'number') {
      return res.status(400).json({ error: "Faltan o son inválidos los campos requeridos (name, category, price)" });
    }

    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    
    const newItem = {
      id: newId,
      name,
      category,
      price
    };

    items.push(newItem);
    await saveItems(items);

    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: "Error al guardar item" });
  }
});

// PUT /api/items/:id → actualiza un ítem existente
router.put("/:id", async (req, res) => {
  try {
    const items = await getItems();
    const itemIndex = items.findIndex(i => i.id === parseInt(req.params.id));

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Item no encontrado" });
    }
    
    const updatedItem = { ...items[itemIndex], ...req.body, id: parseInt(req.params.id) };
    items[itemIndex] = updatedItem;

    await saveItems(items);
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar item" });
  }
});

// DELETE /api/items/:id → elimina un ítem
router.delete("/:id", async (req, res) => {
  try {
    let items = await getItems();
    const initialLength = items.length;
    items = items.filter(i => i.id !== parseInt(req.params.id));

    if (items.length === initialLength) {
      return res.status(404).json({ error: "Item no encontrado" });
    }
    
    await saveItems(items);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar item" });
  }
});

/**
 * Función de limpieza para las pruebas de Jest.
 */
function cleanup() {
  return Promise.resolve();
}

module.exports = { router, cleanup };

