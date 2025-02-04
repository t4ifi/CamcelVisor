const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    
    children: [
      { path: '', component: () => import('src/pages/Principal.vue') }
    ]
  },
  {
    path: '/subir',
    component: () => import('layouts/MainLayout.vue'),
    
    children: [
      { path: '', component: () => import('src/pages/Subir.vue') }
    ]
  },
  {
    path: '/editar',
    component: () => import('layouts/MainLayout.vue'),
    
    children: [
      { path: '', component: () => import('src/pages/EditarNotiServs.vue') }
    ]
  },{
    path: '/Login',
    component: () => import('src/pages/Login.vue'),
  },


  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
