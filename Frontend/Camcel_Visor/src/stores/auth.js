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

  return { nombre, token, login, logout };
});