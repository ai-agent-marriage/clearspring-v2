import router from './router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

router.beforeEach((to, from, next) => {
  NProgress.start()
  
  const token = localStorage.getItem('admin_token')
  
  if (to.path === '/login') {
    next()
  } else {
    if (token) {
      next()
    } else {
      next('/login')
    }
  }
  
  NProgress.done()
})

router.afterEach(() => {
  NProgress.done()
})
