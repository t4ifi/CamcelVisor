import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from 'src/boot/axios'

export const useAuthStore = defineStore('auth', () => {
  const nombre = ref(localStorage.getItem('nombre') || '');
  const token = ref(localStorage.getItem('token') || '');

  const login = async (username, password) => { // Cambia "nombre" a "username"
    try {
      const response = await api.post('/api/login', { nombre: username, password });
      token.value = response.data.token;
      nombre.value = response.data.nombre;
      localStorage.setItem('token', token.value);
      localStorage.setItem('nombre', nombre.value);
    } catch (error) {
      console.log(api)
      console.error('Error en login:', error);
    }
  };

  const logout = () => {
    token.value = '';
    nombre.value = ''; // Corrige "user.value" a "nombre.value"
    localStorage.removeItem('token');
    localStorage.removeItem('nombre'); // Asegúrate de eliminar el nombre también
  };
   const requestPasswordReset = async (email)=>  {
    try {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@camcel\.com\.uy$/;
      const emailLower = email.toLowerCase(); // Normaliza el email a minúsculas
  
      if (!emailRegex.test(emailLower)) {
        $q.notify({ type: 'negative', message: 'El correo debe tener el dominio @camcel.com.uy, comuniquese con Computos si no tiene uno' });
        return;
      }
  
      console.log("Enviando solicitud a la API..."); // Log antes de la petición
      console.log("Email:", emailLower);
  
      const response = await api.post("/api/usuarios/forgot-password", { email: emailLower });
  
      console.log("Respuesta de la API:", response);
  
      return { success: true, message: "Correo enviado con instrucciones" };
    } catch (error) {
      console.error("Error en requestPasswordReset:", error);
      return { success: false, message: error.response?.data?.message || "Error al enviar correo" };
    }
  };
  

  const resetPassword = async (token, password) => {
    try {
      await api.post("/api/usuarios/reset-password", { token, password });
      return { success: true, message: "Contraseña actualizada con éxito" };
    } catch (error) {
        console.error("Error en restablecer contraseña:", error)
      return { success: false, message: error.response?.data?.message || "Error al cambiar contraseña" };
    }
  };

  return { nombre, token, login, logout, resetPassword, requestPasswordReset };
  
});