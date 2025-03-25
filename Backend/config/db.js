const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.sqlHOST || "127.0.0.1",
  user: process.env.sqlUSER || "root",
  password: process.env.sqlPASSWORD || "", 
  database: process.env.sqlBDD || "noticias_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initDatabase() {
  try {
    // Verificar la conexión
    const connection = await pool.getConnection();
    console.log("✅ Conexión a MySQL establecida");
    connection.release();

    // Consulta para crear la tabla de noticias
    const createTableNoticias = `
      CREATE TABLE IF NOT EXISTS noticias (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT NOT NULL,
        filial VARCHAR(100) NOT NULL,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await pool.query(createTableNoticias);
    console.log("✅ Tabla 'noticias' verificada o creada");

    // Consulta para crear la tabla de usuarios
    const createTableUsuarios = `
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `;
    await pool.query(createTableUsuarios);
    console.log("✅ Tabla 'usuarios' verificada o creada");

    // Consulta para crear la tabla de servidores
    const createTableServidores = `
      CREATE TABLE IF NOT EXISTS servidores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        ip VARCHAR(255) NOT NULL,
        estado VARCHAR(20)
      )
    `;
    await pool.query(createTableServidores);
    console.log("✅ Tabla 'servidores' verificada o creada");
  } catch (error) {
    console.error("❌ Error en la inicialización de la base de datos:", error.message);
  }
}

initDatabase();

module.exports = pool;
