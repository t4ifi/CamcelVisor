const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/Subir.vue') }
    ]
  },
  {
    path: '/visor',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/Principal.vue') }
    ]
  },
  {
    path: '/editar',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/EditarNotiServs.vue') }
    ]
  },
  {
    path: '/usuarios',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/Usuarios.vue') }
    ]
  },
  {
    path: '/login',
    component: () => import('src/pages/Login.vue')
  },
  {
    path: '/reset_pwd',
    component: () => import('src/pages/OlvidasteTuPwd.vue')
  },
  {
    path: '/reset-password/:token',
    component: () => import('src/pages/RestablecerPwd.vue')
  },
  {
    path: '/calendario',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/Calendario.vue') }
    ]
  },
  // Ruta para manejar cualquier otra dirección no definida
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes;
