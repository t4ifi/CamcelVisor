const db = require("../config/db.js"); // Asegúrate de que la conexión esté bien estructurada
const { body, validationResult } = require("express-validator");
require('dotenv').config();
const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const { io } = require('../server.js');
const { server } = require('../server.js');
const { app } = require('../server.js');

const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET || 'secreto123';


const SECRET_KEY = "tu_secreto_super_seguro"; // Usa variables de entorno en producción

// Registro de usuario
router.post("/r", async (req, res) => {
  const { nombre, email, password } = req.body;
  try {
    const hashedPassword = await global.bcrypt.hash(password, 10);
    const query = "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)";
    await db.query(query, [nombre, email, hashedPassword]);
    res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

// Login de usuario
router.post("/", async (req, res) => {
  const { nombre, password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM usuarios WHERE nombre = ?", [nombre]);
    if (rows.length === 0) return res.status(401).json({ error: "Credenciales incorrectas" });

    const usuario = rows[0];
    const match = await global.bcrypt.compare(password, usuario.password);
    if (!match) return res.status(400).json({ error: "Credenciales incorrectas" });

    // Genera el token JWT
    const token = jwt.sign({ id: usuario.id, nombre: usuario.nombre }, SECRET_KEY, { expiresIn: "1h" });

    // Devuelve el token y los datos del usuario
    res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre} });
  } catch (error) {
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

// Ruta para comparar el token
router.post("/compare", (req, res) => {
  const { token } = req.body;

  if (!token) return res.status(400).json({ error: "No se proporcionó el token" });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Token no válido o expirado" });

    // Devuelve la información del usuario decodificada
    res.json({ mensaje: "Token válido", usuario: decoded });
  });
});

module.exports = router;
