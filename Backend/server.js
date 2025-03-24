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
const password = 'jasuarez'
bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error("Error al hashear la contraseña:", err);
    return;
  }
  console.log("Contraseña hasheada:", hash);
});
console.log("admin")


app.use(cors(corsOptions));
app.use(bodyParser.json());

// Rutas de ejemplo
app.get("/", (req, res) => {
  res.send("CORS configurado correctamente");
});

const users = [
  { id: 1, username: 'admin', password: bcrypt.hashSync('123456', 10) }
];
const secretKey = process.env.JWT_SECRET || 'secreto123';

// Conexión inicial a MySQL (sin especificar base de datos)
const db = mysql.createConnection({
  host: "127.0.0.1", // Cambia según tu configuración
  user: "root", // Usuario de MySQL

  database: "noticias_db", // Nombre de la base de datos
});

// Nombre de la base de datos que deseas crear
const databaseName = "noticias_db";

// Crear base de datos si no existe
const crearDatabase = `CREATE DATABASE IF NOT EXISTS ${databaseName}`;

db.connect((err) => {
  if (err) {
    console.error("Error al conectar con MySQL:", err.message);
    return;
  }
  console.log("Conexión a MySQL establecida");

  // Verificar o crear la base de datos
  db.query(crearDatabase, (err, result) => {
    if (err) {
      console.error("Error al crear la base de datos:", err.message);
      return;
    }
    console.log(`Base de datos '${databaseName}' verificada o creada`);

    // Conectar a la base de datos específica
    const dbWithDatabase = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "espepa",
      database: `noticias_db`,
    });

    dbWithDatabase.connect((err) => {
      if (err) {
        console.error("Error al conectar a la base de datos:", err.message);
        return;
      }
      console.log(`Conectado a la base de datos '${databaseName}'`);

      // Crear tabla de noticias si no existe
      const tablaNoticias = `
        CREATE TABLE IF NOT EXISTS noticias (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT NOT NULL,
        filial VARCHAR(100) NOT NULL,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;
      const tableUsuarios = `
        CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
        );
       `;
      const tablaServidores = `
        CREATE TABLE IF NOT EXISTS servidores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        ip VARCHAR(255) NOT NULL,
        estado VARCHAR(20)
        )
      `;
      dbWithDatabase.query(tablaNoticias, (err, result) => {
        if (err) {
          console.error("Error al crear la tabla:", err.message);
        } else {
          console.log("Tabla 'noticias' verificada o creada");
        }
      });
      dbWithDatabase.query(tableUsuarios, (err, result) => {
        if (err) {
          console.error("Error al crear la tabla:", err.message);
        } else {
          console.log("Tabla 'Usuarios' verificada o creada");
        }
      });
      dbWithDatabase.query(tablaServidores, (err, result) => {
        if (err) {
          console.error("Error al crear la tabla:", err.message);
        } else {
          console.log("Tabla 'Servidores' verificada o creada");
        }
      });

});
});
});



app.use("/api/noticias", noticiasRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/servidores", servidoresRoutes);

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







module.exports = { io, db };

// Iniciar servidor
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
