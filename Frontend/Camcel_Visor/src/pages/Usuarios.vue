<template>
    <q-page class="q-pa-md">
      <q-card class="q-pa-md">
        <q-card-section>
          <h4 class="text-center">Manejo de Usuarios</h4>
        </q-card-section>
  
        <!-- Formulario de autenticación -->
        <q-card-section v-if="!autenticado">
          <q-input v-model="password" type="password" label="Ingrese la contraseña" filled />
          <q-btn label="Ingresar" color="primary" class="q-mt-md full-width" @click="verificarPassword" />
        </q-card-section>
  
        <!-- Sección de usuarios -->
        <q-card-section v-else>
          <q-btn label="Agregar Usuario" color="positive" class="q-mb-md" @click="abrirModal()" />
          <q-list bordered separator>
            <q-item v-for="usuario in usuarios" :key="usuario.id">
              <q-item-section>{{ usuario.nombre }} ({{ usuario.email }})</q-item-section>
              <q-item-section side>
                <q-btn icon="edit" color="warning" @click="abrirModal(usuario)" />
                <q-btn icon="delete" color="negative" class="q-ml-sm" @click="eliminarUsuario(usuario.id)" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
  
      <!-- Modal de creación/edición -->
      <q-dialog v-model="modalAbierto">
        <q-card class="q-pa-md">
          <q-card-section>
            <h5>{{ editando ? 'Editar Usuario' : 'Crear Usuario' }}</h5>
          </q-card-section>
          <q-card-section>
            <q-input v-model="usuarioForm.nombre" label="Nombre" filled />
            <q-input v-model="usuarioForm.email" type="email" label="Email" filled class="q-mt-md" />
            <q-input v-model="usuarioForm.password" type="password" label="Contraseña" filled class="q-mt-md" />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn label="Cancelar" color="grey" @click="cerrarModal" />
            <q-btn :label="editando ? 'Actualizar' : 'Guardar'" color="primary" @click="guardarUsuario" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-page>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import { useQuasar } from "quasar";
  import { api } from 'src/boot/axios'
  import { io } from 'socket.io-client';

  let socket = null;
  socket = io(import.meta.env.VITE_API);

  socket.on('connect', () => {
  console.log('Conectado a Socket.IO');
});
  
  const $q = useQuasar();
  const password = ref("");
  const autenticado = ref(false);
  const usuarios = ref([]);
  const modalAbierto = ref(false);
  const editando = ref(false);
  const usuarioForm = ref({ id: null, nombre: "", email: "", password: "" });
  
  const verificarPassword = async () => {
    try {
      const { data } = await api.post("/api/usuarios/auth", { password: password.value });
      if (data.autenticado) {
        autenticado.value = true;
        obtenerUsuarios();
      } else {
        $q.notify({ type: "negative", message: "Contraseña incorrecta" });
      }
    } catch (error) {
      console.error("Error en la autenticación:", error);
    }
  };

  socket.on('usuarioNuevo', (data) => {
    console.log(usuarios.value)
    usuarios.value = usuarios.value + data
    console.log(data)
    console.log(usuarios.value)
  })
  
  const obtenerUsuarios = async () => {
    try {
      const { data } = await api.get("/api/usuarios");
      usuarios.value = data;
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
    }
  };
  
  const abrirModal = (usuario = null) => {
    editando.value = !!usuario;
    usuarioForm.value = usuario ? { ...usuario } : { id: null, nombre: "", email: "", password: "" };
    modalAbierto.value = true;
  };
  
  const cerrarModal = () => {
    modalAbierto.value = false;
  };
  
  const guardarUsuario = async () => {
    try {
      if (editando.value) {
        await api.put(`/api/usuarios/${usuarioForm.value.id}`, usuarioForm.value);
      } else {
        await api.post("/api/usuarios", usuarioForm.value);
      }
      cerrarModal();
      obtenerUsuarios();
    } catch (error) {
      console.error("Error guardando usuario:", error);
    }
  };
  
  const eliminarUsuario = async (id) => {
    try {
      await api.delete(`/api/usuarios/${id}`);
      obtenerUsuarios();
    } catch (error) {
      console.error("Error eliminando usuario:", error);
    }
  };
  
  onMounted(() => {
    // Si ya estaba autenticado antes, cargar usuarios
    if (autenticado.value) obtenerUsuarios();
  });
  </script>
  