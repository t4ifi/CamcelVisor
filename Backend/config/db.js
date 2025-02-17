const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "espepa",
  database: "noticias_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Conexión a MySQL establecida");
    connection.release();
  } catch (error) {
    console.error("❌ Error al conectar con MySQL:", error.message);
  }
}

testConnection();

module.exports = pool;
