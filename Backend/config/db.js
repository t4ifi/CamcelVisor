

const mysql = require('mysql2');
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "noticias_db",
}).promise();

db.connect((err) => {
  if (err) {
    console.error("Error al conectar con MySQL:", err.message);
    return;
  }
  console.log("Conexión a MySQL establecida");
});

module.exports = db;