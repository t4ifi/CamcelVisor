import { route } from "quasar/wrappers";
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import routes from "./routes";
import { useAuthStore } from "../stores/auth.js"; // Store de autenticación

export default route(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === "history"
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Middleware de autenticación
  Router.beforeEach((to, from, next) => {
    const authStore = useAuthStore(); // Obtener el store de autenticación
    const isAuth = !!authStore.token; // Verificar si hay un token válido

    // Verificar si la ruta requiere autenticación
    if (to.meta.requiresAuth && !isAuth) {
      return next({ name: "login" });
    }

    next();
  });

  return Router;
});
