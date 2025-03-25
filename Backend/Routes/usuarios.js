const express = require('express');
const jwt = require("jsonwebtoken");
const transporter = require("../config/email");
const router = express.Router();
const db = require("../config/db.js"); // Asegúrate de que la conexión esté bien estructurada
const { io } = require('../server.js');
const ping = require("ping");

const SECRET_KEY = process.env.JWT_KEY
// 🔒 Verificación de contraseña
router.post("/auth", (req, res) => {
    const { password } = req.body;
    if (password === "espepa") {
      return res.json({ autenticado: true });
    }
    res.json({ autenticado: false });
  });
  
  // 📌 Obtener todos los usuarios
  router.get("/", async (req, res) => {
    const [rows] = await db.query("SELECT id, nombre, email FROM usuarios");
    res.json(rows);
  });
  
  // 📌 Crear un usuario
  router.post("/", async (req, res) => {
    const { nombre, email, password } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error("Error al hashear la contraseña:", err);
        return;
      }
       db.query("INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)", [nombre, email, hash]);
    
    });
    const [id] = await db.query("SELECT id FROM usuarios WHERE email=?", [email]);
    
    global.io.emit("usuarioNuevo", { nombre, email, id });
    res.json({ mensaje: "Usuario creado" });
  });
  const passwordHash = "";
  // 📌 Editar usuario
  router.put("/:id", async (req, res) => {
    const { nombre, email, password } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error("Error al hashear la contraseña:", err);
        return;
      }
       db.query("UPDATE usuarios SET nombre=?, email=?, password=? WHERE id=?", [nombre, email, hash, req.params.id]);
    
    });
    res.json({ mensaje: "Usuario actualizado" });
  });
  
  // 📌 Eliminar usuario
  router.delete("/:id", async (req, res) => {
    await db.query("DELETE FROM usuarios WHERE id=?", [req.params.id]);
    res.json({ mensaje: "Usuario eliminado" });
  });

  router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    console.log(email);
  
    const [users] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
  
    if (!users.length) {
        return res.status(404).json({ message: "Usuario no encontrado" });
    }
   
    const user = users[0]; // 🔹 Accedemos al primer usuario encontrado
    
    // 🔹 Ahora el token tiene el ID correctamente
    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "15m" });
  
    const resetLink = `http://localhost:9000/#/reset-password/${token}`;
  
    const mailOptions = {
        from: "info@camcel.com.uy",
        to: email,
        subject: "Recuperación de contraseña",
        html: `<p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p>
               <a href="${resetLink}">${resetLink}</a>
               <p>El enlace expira en 15 minutos.</p>`,
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Error enviando correo:", error);
            return res.status(500).json({ message: "Error al enviar el correo", error });
        }
        console.log("Correo enviado:", info.response);
        res.json({ message: "Correo enviado" });
    });
  });
    
    
    // 📌 2️⃣ Verificar token y restablecer contraseña
    router.post("/reset-password", async (req, res) => {
      const { token, password } = req.body;
  
      if (!token || !password) {
          return res.status(400).json({ message: "Token y nueva contraseña son requeridos" });
      }
  
      try {
          // 🔹 Decodificar token
          const decoded = jwt.verify(token, SECRET_KEY);
          console.log("Token decodificado:", decoded);
          
          // 🔹 Verificar si el usuario existe antes de actualizar
          const [user] = await db.query("SELECT * FROM usuarios WHERE id = ?", [decoded.id]);
          if (user.length === 0) {
              return res.status(404).json({ message: "Usuario no encontrado" });
          }
          bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
              console.error("Error al hashear la contraseña:", err);
              return;
            }
              db.query("UPDATE usuarios SET password = ? WHERE id = ?", [hash, decoded.id]);
            
          });
          // 🔹 Actualizar la contraseña 
          
  
          res.json({ message: "Contraseña actualizada correctamente" });
      } catch (error) {
          console.error("Error en reset-password:", error);
          res.status(400).json({ message: "Token inválido o expirado" });
      }
  });

  module.exports = router;