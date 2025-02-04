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
const password = 'admin'
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
  password: "", // Contraseña de MySQL
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
      password: "",
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
        ip VARCHAR(255) NOT NULL
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
// Ruta para crear una noticia
app.post('/api/SubirNoticias', (req, res) => {
  const { titulo, descripcion, filial } = req.body;

  // Validar los datos
  if (!titulo || !descripcion || !filial) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  // Crear la consulta para insertar la noticia
  const query = 'INSERT INTO noticias (titulo, descripcion, filial) VALUES (?, ?, ?)';
  db.query(query, [titulo, descripcion, filial], (err, result) => {
    if (err) {
      console.error('Error al insertar la noticia:', err);
      return res.status(500).json({ error: 'Error al cargar la noticia' });
    }
    io.emit('noticiaCreada', { id: result.insertId, titulo, descripcion, filial })

    res.status(200).json({ message: 'Noticia cargada exitosamente', id: result.insertId });
  }); 
});
});
});
});
// Ruta para crear una noticia
app.post('/api/SubirServ', (req, res) => {
  const { nombre, ip } = req.body;

  // Validar los datos
  if (!nombre || !ip ) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  // Crear la consulta para insertar el servidor
  const query = 'INSERT INTO Servidores (nombre, ip) VALUES (?, ?)';
  db.query(query, [nombre, ip], (err, result) => {
    if (err) {
      console.error('Error al insertar el servidor:', err);
      return res.status(500).json({ error: 'Error al cargar el servidor' });
    }
    io.emit('servidorCreado', { id: result.insertId, nombre, ip })

    res.status(200).json({ message: 'Servidor cargada exitosamente', id: result.insertId });
  }); 
});



app.use("/api/noticias", noticiasRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/servidores", servidoresRoutes);

setInterval(async () => {
  try {
    // Obtener todos los servidores desde la base de datos
    db.query('SELECT id, nombre, ip, estado FROM servidores', async (err, results) => {
      if (err) {
        console.error('Error al obtener servidores:', err);
        return;
      }

      const resultados = await Promise.all(
        results.map(async (servidor) => {
          // Realizar el ping al servidor
          const isAlive = await new Promise((resolve) => {
            ping.sys.probe(servidor.ip, (isAlive) => resolve(isAlive));
          });

          const nuevoEstado = isAlive ? 'Activo' : 'Caído';

          // Si el estado ha cambiado, actualizar la base de datos
          if (servidor.estado !== nuevoEstado) {
            console.log('Cambio')
            db.query('UPDATE servidores SET estado = ? WHERE id = ?', [nuevoEstado, servidor.id], (err) => {
              if (err) {
                console.error('Error al actualizar el estado del servidor:', err);
              } else {
                // Emitir el evento a través de WebSocket
                io.emit('estadoServidorCambiado', {
                  id: servidor.id,
                  estado: nuevoEstado
                });
              }
            });
          }

          return {
            ...servidor,
            estado: nuevoEstado,
          };
        })
      );

      // Puedes hacer algo con los resultados aquí, si es necesario
      // Ejemplo: Responder a los usuarios con los resultados de la comprobación
    });
  } catch (error) {
    console.error('Error en la comprobación de estado de los servidores:', error);
  }
}, 30000); // 60000 ms = 1 minuto


// Endpoint para obtener los servidores







module.exports = { io, db };

// Iniciar servidor
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
