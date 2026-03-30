import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/components/Layout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '控制台' }
      },
      {
        path: 'orders',
        name: 'OrderList',
        component: () => import('@/views/OrderList.vue'),
        meta: { title: '订单管理' }
      },
      {
        path: 'qualifications',
        name: 'QualificationAudit',
        component: () => import('@/views/QualificationAudit.vue'),
        meta: { title: '资质审核' }
      },
      {
        path: 'appeals',
        name: 'AppealArbitration',
        component: () => import('@/views/AppealArbitration.vue'),
        meta: { title: '申诉仲裁' }
      },
      {
        path: 'profit-sharing',
        name: 'ProfitSharing',
        component: () => import('@/views/ProfitSharing.vue'),
        meta: { title: '分账配置' }
      },
      {
        path: 'executors',
        name: 'ExecutorManage',
        component: () => import('@/views/ExecutorManage.vue'),
        meta: { title: '执行者管理' }
      },
      {
        path: 'export',
        name: 'DataExport',
        component: () => import('@/views/DataExport.vue'),
        meta: { title: '数据导出' }
      },
      {
        path: 'settings',
        name: 'SystemSettings',
        component: () => import('@/views/SystemSettings.vue'),
        meta: { title: '系统设置' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
