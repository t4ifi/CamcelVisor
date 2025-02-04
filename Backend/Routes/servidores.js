const express = require('express');
const router = express.Router();
const db = require("../config/db.js"); // Asegúrate de que la conexión esté bien estructurada
const { io } = require('../server.js');
const ping = require("ping");

// Ruta para registrar un servidor
router.post("/", async (req, res) => {
  const { nombre, ip } = req.body;

  if (!nombre || !ip) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  const query = "INSERT INTO servidores (nombre, ip) VALUES (?, ?)";
  try {
    const [result] = await db.execute(query, [nombre, ip]);
    io.emit("servidorCreado", { id: result.insertId, nombre, ip });

    res.status(200).json({ message: "Servidor registrado exitosamente", id: result.insertId });
  } catch (err) {
    console.error("Error al insertar el servidor:", err);
    res.status(500).json({ error: "Error al cargar el servidor" });
  }
});

// Ruta para obtener servidores
router.get("/", async (req, res) => {
  try {
    const [results] = await db.query("SELECT id, nombre, ip, estado FROM servidores");
    res.json(results);
  } catch (err) {
    console.error("Error al obtener servidores:", err);
    res.status(500).json({ error: "Error al obtener los servidores" });
  }
});

// 📌 Editar un servidor
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, ip } = req.body;

  try {
    const [result] = await db.execute(
      "UPDATE servidores SET nombre = ?, ip = ? WHERE id = ?",
      [nombre, ip, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Servidor no encontrado" });
    }

    const servidorActualizado = { id, nombre, ip };
    io.emit("servidorActualizado", servidorActualizado); // Notificar cambios
    res.json(servidorActualizado);
  } catch (err) {
    console.error("Error al actualizar el servidor:", err);
    res.status(500).json({ error: "Error al actualizar el servidor" });
  }
});

// 📌 Eliminar un servidor por ID
router.delete("/:id", async (req, res) => {
  const servidorId = req.params.id;
  console.log(`Intentando eliminar el servidor con ID: ${servidorId}`);  // 🔍 Log para depuración

  const sql = "DELETE FROM servidores WHERE id = ?";
  try {
    const [result] = await db.execute(sql, [servidorId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Servidor no encontrado" });
    }

    // Emite el evento a través de WebSocket si todo va bien
    global.io.emit("servidorEliminado", { id: servidorId });
    console.log(`evento envia: ${servidorId}`);

    res.json({ message: "Servidor eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar el servidor:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


module.exports = router;
