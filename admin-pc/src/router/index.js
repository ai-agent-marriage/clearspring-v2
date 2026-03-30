import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true, title: '控制台' }
  },
  {
    path: '/order-list',
    name: 'OrderList',
    component: () => import('@/views/OrderList.vue'),
    meta: { requiresAuth: true, title: '订单管理' }
  },
  {
    path: '/qualification-audit',
    name: 'QualificationAudit',
    component: () => import('@/views/QualificationAudit.vue'),
    meta: { requiresAuth: true, title: '资质审核' }
  },
  {
    path: '/appeal-arbitration',
    name: 'AppealArbitration',
    component: () => import('@/views/AppealArbitration.vue'),
    meta: { requiresAuth: true, title: '申诉仲裁' }
  },
  {
    path: '/profit-sharing',
    name: 'ProfitSharing',
    component: () => import('@/views/ProfitSharing.vue'),
    meta: { requiresAuth: true, title: '分账配置' }
  },
  {
    path: '/executor-manage',
    name: 'ExecutorManage',
    component: () => import('@/views/ExecutorManage.vue'),
    meta: { requiresAuth: true, title: '执行者管理' }
  },
  {
    path: '/data-export',
    name: 'DataExport',
    component: () => import('@/views/DataExport.vue'),
    meta: { requiresAuth: true, title: '数据导出' }
  },
  {
    path: '/system-settings',
    name: 'SystemSettings',
    component: () => import('@/views/SystemSettings.vue'),
    meta: { requiresAuth: true, title: '系统设置' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
