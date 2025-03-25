<template>
    <q-layout>
      <q-page-container>
        <q-page class="flex flex-center bg-grey-3">
          <q-card class="q-pa-md" style="max-width: 400px; width: 100%;">
            <q-card-section>
              <div class="text-h6 text-center">Restablecer contraseña</div>
              <q-input v-model="password" label="Nueva contraseña" type="password" outlined class="q-mt-md" />
              <q-input v-model="confirmPassword" label="Confirmar contraseña" type="password" outlined class="q-mt-md" />
              <q-btn label="Guardar" color="primary" class="full-width q-mt-md" @click="reset" />
              <q-card-section v-if="message" class="text-center text-negative q-mt-sm">
                
              </q-card-section>
            </q-card-section>
          </q-card>
        </q-page>
      </q-page-container>
    </q-layout>
      
    </template>
    
    <script setup>
    import { ref } from "vue";
    import { useRoute, useRouter } from "vue-router";
    import { useAuthStore } from "stores/auth";
    import { useQuasar } from 'quasar';
  
    const $q = useQuasar();
    const authStore = useAuthStore();
    const route = useRoute();
    const router = useRouter();
    const password = ref("");
    const confirmPassword = ref("");
    const message = ref("");
    
    const reset = async () => {
      if (password.value !== confirmPassword.value) {
        message.value = "Las contraseñas no coinciden";
        return;
      }
    
      const res = await authStore.resetPassword(route.params.token, password.value);
      message.value = res.message;
      $q.notify({ type: 'positive', message: message})
      if (res.success) {
        setTimeout(() => router.push("/login"), 2000);
      }
    };
    </script>
    