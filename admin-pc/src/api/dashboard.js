import request from './request'

/**
 * 获取统计数据
 */
export function getDashboardStats() {
  return request({
    url: '/admin/dashboard/stats',
    method: 'get'
  })
}

/**
 * 获取订单趋势
 */
export function getOrderTrend(params) {
  return request({
    url: '/admin/dashboard/order-trend',
    method: 'get',
    params
  })
}

/**
 * 获取执行者统计
 */
export function getExecutorStats() {
  return request({
    url: '/admin/dashboard/executors',
    method: 'get'
  })
}

/**
 * 获取最近订单
 */
export function getRecentOrders(limit = 10) {
  return request({
    url: '/admin/dashboard/recent-orders',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取待处理事项
 */
export function getPendingTasks() {
  return request({
    url: '/admin/dashboard/pending-tasks',
    method: 'get'
  })
}
