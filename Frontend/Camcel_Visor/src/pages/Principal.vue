<template>
  <q-layout padding>
    <q-toolbar class="bg-primary text-white">
      <div style="width: 20%;">

      </div>
      <div style="width: 50%;">
      <q-toolbar-title>Noticias en Pantalla</q-toolbar-title>
     
    </div>
    <div style="width: 30%;">
      <q-toolbar-title>Estado de los Servidores</q-toolbar-title>
    </div>
    </q-toolbar>

    <!-- Aquí utilizamos q-row y q-col para hacer la estructura lado a lado -->
    <q-page>
      <q-row class="q-pa-md" style="display: flex; height: 90vh;">
        <!-- Noticias -->
        <q-col style="width: 59%; height: 100%;">
          <div v-if="noticias.length">
            <q-card 
              v-for="noticia in noticias" 
              :key="noticia.id" 
              class="q-pa-md noticia-card"
            >
              <q-card-section>
                <q-row class="q-pa-md" style="display: flex; height: 100%;">
                  <q-col style="width: 85%; height: 100%; display: block;">
                    <div>
                      <div class="text-h6 truncate" style="text-align: left; width: 100%; height: auto;">{{ noticia.titulo }}</div>
                      <div class="text-body1">
                        <span v-if="!noticia.expandido" class="noticia-texto">{{ noticia.descripcion }}</span>
                        <span v-else>{{ noticia.descripcion }}</span>
                      </div>
                      <q-btn 
                      v-if="noticia.descripcion.length > 150" 
                      flat color="primary" size="sm"
                      @click="abrirNoticia(noticia)"
                    >
                      Ver más
                    </q-btn>
                    </div>
                  </q-col>
                  <q-col style="width: 5%; height: 100%; display: block;"></q-col>
                  <q-col style="width: 10%; height: 100%; display: block;">
                    <div class="text-h6 text-grey">{{ noticia.filial }}</div>
                    <div class="text-h8 text-grey">{{ formatearFecha(noticia.fecha) }}</div>
                  </q-col>
                </q-row>
              </q-card-section>
            </q-card>
          </div>
          <q-spinner color="primary" v-else />
        </q-col>
        
        <q-col style="width: 1%; height: 100%; display: block;"></q-col>

        

        <!-- Columna para el estado de los servidores -->
        <q-col style="width: 40%; height: 100%; display: block;">
          <div  v-if="servidores.length" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
            <q-card v-for="servidor in servidores" :key="servidor.id" class="q-pa-md" style="height: 25vh;">
              <q-card-section>
                <div class="text-h6">{{ servidor.nombre }}</div>
                <div class="text-body2">IP: {{ servidor.ip }}</div>
                <div :class="{'text-positive': servidor.estado === 'Activo', 'text-negative': servidor.estado === 'Caído'}">
                  Estado: {{ servidor.estado }}
                </div>
              </q-card-section>
            </q-card>
          </div>
          <q-spinner color="primary" v-else />
        </q-col>
      </q-row>
    </q-page>
     <!-- Dialogo para mostrar la noticia completa -->
     <q-dialog v-model="dialogoNoticia">
      <q-card style="width: 500px; max-width: 90vw; max-height: 90vh; overflow: auto;">
        <q-card-section>
          <div class="text-h5">{{ noticiaSeleccionada.titulo }}</div>
          <div class="text-body2 text-grey">{{ formatearFecha(noticiaSeleccionada.fecha) }} - {{ noticiaSeleccionada.filial }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none noticia-contenedor">
          <div class="text-body1">{{ noticiaSeleccionada.descripcion }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    
  </q-layout>
</template>

  
<script setup>
import { reactive, computed, ref, onMounted } from 'vue';
import { api } from 'src/boot/axios'
import { io } from 'socket.io-client';


const filiales = ["Melo", "Río Branco", "Santa Clara", "Cerro Largo"];

const dialogoVisible = reactive({ value: false });
const nuevaNoticia = reactive({
  titulo: "",
  descripcion: "",
  filial: "",
  fecha: ""
});


const servidores = ref([]);

// Cargar el estado de los servidores desde el backend
async function cargarEstados() {
  try {
    const response = await api.get('/api/servidores');
    servidores.value = response.data;
  } catch (error) {
    console.error('Error al cargar el estado de los servidores:', error);
  }
}

 
const noticias = ref([]); // Inicializa como una lista vacía
let socket = null;

// Establecer conexión con Socket.IO
onMounted(() => {
  cargarEstados();
  cargarNoticias();
  fetchMonitors()
  socket = io(import.meta.env.VITE_API); // Cambia la URL según tu configuración

  socket.on('connect', () => {
  console.log('Conectado a Socket.IO');
});

  socket.on('noticiaCreada', (data) => {
    

    // Verificar si `data` es un array o un solo objeto
    if (Array.isArray(data)) {
      // Si es un array, agregar cada noticia al inicio del array de noticias
      data.forEach((noticia) => {
        noticias.value.unshift(noticia);
      });
    } else if (data && typeof data === 'object') {
      // Si es un solo objeto, agregarlo directamente
      noticias.value.unshift(data);
    } else {
      console.error('El formato de data no es válido:', data);
    }

   
  });
  
  
  socket.on("servidorEliminado", (data) => {
    console.log("Evento servidorEliminado recibido:", data)
    eliminarServidorDeLista(data.id)
  })
  socket.on("noticiaEliminada", (data) => {
    console.log("Evento noticiaEliminada recibido:", data)
    eliminarNoticiaDeLista(data.id)
  })
  
  socket.on("noticiaActualizada", (nuevaNoticia) => {
  console.log("Noticia actualizada recibida:", nuevaNoticia);

  actualizarNoticia(nuevaNoticia)
});
  
  socket.on('servidorCreado', (data) => {
  // Verificar si `data` es un array o un solo objeto
  if (Array.isArray(data)) {
    // Si es un array, agregar cada servidor al inicio del array de servidores
    data.forEach((servidor) => {
      servidores.value.unshift(servidor);
    });
  } else if (data && typeof data === 'object') {
    // Si es un solo objeto, agregarlo directamente
    servidores.value.unshift(data);
  } else {
    console.error('El formato de data no es válido:', data);
  }

  console.log('Nuevo servidor agregado:', data);
});
socket.on('noticiaEditada', (data) => {
    

    // Verificar si `data` es un array o un solo objeto
    if (Array.isArray(data)) {
      // Si es un array, agregar cada noticia al inicio del array de noticias
      data.forEach((noticia) => {
        noticias.value.unshift(noticia);
      });
    } else if (data && typeof data === 'object') {
      // Si es un solo objeto, agregarlo directamente
      noticias.value.unshift(data);
    } else {
      console.error('El formato de data no es válido:', data);
    }
    
    actualizarNoticia(data)
    cargarNoticias();
  });
socket.on('servidorEditado', (data) => {
  // Verificar si `data` es un array o un solo objeto
  if (Array.isArray(data)) {
    // Si es un array, agregar cada servidor al inicio del array de servidores
    data.forEach((servidor) => {
      servidores.value.unshift(servidor);
    });
  } else if (data && typeof data === 'object') {
    // Si es un solo objeto, agregarlo directamente
    servidores.value.unshift(data);
  } else {
    console.error('El formato de data no es válido:', data);
  }

  console.log('Nuevo servidor agregado:', data);
  cargarEstados();
});
  
  // Escuchar el evento de estado cambiado
  socket.on('estadoServidorCambiado', (data) => {
    console.log('Estado cambiado recibido:', data);
    const servidor = servidores.value.find((s) => s.id === data.id);

    if (servidor) {
      servidor.estado = data.estado;
    }
  });


   
  },
);


// Método para eliminar el servidor de la lista
function eliminarServidorDeLista(id) {
  console.log("ID recibido para eliminar:", id)

  // Convertir el id a número para evitar problemas de comparación
  const idNumero = Number(id)

  // Verificar si el id es válido
  if (!isNaN(idNumero)) {
    // Filtrar la lista para eliminar el servidor con el id correspondiente
    servidores.value = servidores.value.filter(servidor => servidor.id !== idNumero)
    console.log(`Servidor con ID ${idNumero} eliminado de la lista`)
  } else {
    console.error("ID no válido recibido")
  }
}
// Método para eliminar el servidor de la lista
function eliminarNoticiaDeLista(id) {
  console.log("ID recibido para eliminar:", id)

  // Convertir el id a número para evitar problemas de comparación
  const idNumero = Number(id)

  // Verificar si el id es válido
  if (!isNaN(idNumero)) {
    // Filtrar la lista para eliminar el servidor con el id correspondiente
    noticias.value = noticias.value.filter(noticia => noticia.id !== idNumero)
    console.log(`Noticia con ID ${idNumero} eliminado de la lista`)
  } else {
    console.error("ID no válido recibido")
  }
}

async function cargarNoticias() {
  const response = await api.get(`/api/noticias`);
  noticias.value = response.data;
}


const monitors = ref([]);

const fetchMonitors = async () => {
  
};

const dialogoNoticia = ref(false);
const noticiaSeleccionada = reactive({});

const abrirNoticia = (noticia) => {
  Object.assign(noticiaSeleccionada, noticia);
  dialogoNoticia.value = true;
};

function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses comienzan desde 0
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

// Función para actualizar una noticia en la lista
const actualizarNoticia = (nuevaNoticia) => {
  const index = noticias.value.findIndex((n) => n.id === nuevaNoticia.id);
  
  if (index !== -1) {
    // Si la noticia ya existe, actualizarla creando un nuevo array (reactivo)
    noticias.value = noticias.value.map((noticia) =>
      noticia.id === nuevaNoticia.id ? nuevaNoticia : noticia
    );
  } else {
    // Si no existe, agregarla al inicio
    noticias.value = [nuevaNoticia, ...noticias.value];
  }
};





</script>
  
  <style>
  .noticia-contenedor {
    word-wrap: break-word;  /* Evita que las palabras largas causen scroll horizontal */
    white-space: normal;    /* Asegura que el texto respete los saltos de línea */
    max-width: 100%;        /* Evita que el contenido crezca más que el dialog */
  }
  
  .text-h6 {
    font-weight: bold;
    font-size: 30px;
  }
  /* Evita que el texto de la noticia se salga del card */
.noticia-card {
  height: 25vh;
  max-height: 200px;
  overflow: hidden;
}

/* Estilo para truncar el texto de la noticia */
.noticia-texto {
  font-size: 25px;
  word-wrap: break-word;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3; /* Máximo 3 líneas antes de truncar */
  -webkit-box-orient: vertical;

  /* Compatibilidad futura */
  line-clamp: 3;
  box-orient: vertical;
}

/* Si quieres que tenga scroll en lugar de truncarse */
.noticia-texto:hover {
  overflow-y: auto;
  max-height: 100px;
}
  </style>
  