// src/boot/axios.js
import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

// Crear una instancia de axios con baseURL
const api = axios.create({ baseURL: import.meta.env.VITE_API || 'http://localhost:3000' })

export default defineBoot(({ app }) => {
  // Registrar api como propiedad global
  console.log('Booting axios and registering global $api')
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api  // Aquí se registra como $api
})

export { api }
