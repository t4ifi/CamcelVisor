require('dotenv').config();
const express = require("express");
const { body, validationResult } = require("express-validator");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const mysql = require("mysql2");
const ping = require('ping');
const noticiasRoutes = require('./Routes/noticias');
const servidoresRoutes = require('./Routes/servidores');
const loginRoutes = require('./Routes/login.js')
const usuarios = require('./Routes/usuarios.js')
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;
const db2 = require("./config/db.js");

// Crear servidor HTTP y Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Ajustar en producción
  },
});

// Evento de conexión de socket
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});
io.on('connect_error', (err) => {
  console.error('Error de conexión:', err);
});
global.io = io; // Definir `io` globalmente
global.bcrypt = bcrypt; // Definir `bcript` globalmente
// Middleware
app.use(express.json());

// Configuración de CORS
const corsOptions = {
  origin: "*", // Cambia a tu frontend o dominio permitido
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Métodos permitidos
  allowedHeaders: ["Content-Type", "Authorization"], // Headers permitidos
};



app.use(cors(corsOptions));
app.use(bodyParser.json());

// Rutas de ejemplo
app.get("/", (req, res) => {
  res.send("CORS configurado correctamente");
});

const users = [
  { id: 1, username: 'jasuarez', password: bcrypt.hashSync('jasuarez', 10) }
];





app.use("/api/noticias", noticiasRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/servidores", servidoresRoutes);
app.use("/api/usuarios", usuarios)

async function verificarServidores() {
  try {
    // Obtener servidores de la base de datos
    const [servidores] = await db2.query('SELECT id, nombre, ip, estado FROM servidores');

    if (!servidores.length) {
      console.log('⚠️ No hay servidores registrados.');
      return;
    }

    for (const servidor of servidores) {
      try {
        // Hacer ping y verificar estado
        const isAlive = await ping.promise.probe(servidor.ip);
        const nuevoEstado = isAlive.alive ? 'Activo' : 'Caído';

        if (servidor.estado !== nuevoEstado) {
          console.log(`🔄 Servidor ${servidor.nombre} cambiado: ${servidor.estado} ➝ ${nuevoEstado}`);

          // Actualizar estado en la base de datos
          await db2.query('UPDATE servidores SET estado = ? WHERE id = ?', [nuevoEstado, servidor.id]);

          // Emitir evento WebSocket
          global.io.emit('estadoServidorCambiado', {
            id: servidor.id,
            estado: nuevoEstado
          });
        }
      } catch (error) {
        console.error(`❌ Error al verificar servidor ${servidor.nombre}:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Error al obtener servidores:', error);
  }
}

// Ejecutar cada 3 segundos
setInterval(verificarServidores, 30000);

// Endpoint para obtener los servidores







module.exports = { io, };

// Iniciar servidor
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
