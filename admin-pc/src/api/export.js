import request from './request'

// 导出订单数据
export function exportOrders(params) {
  return request({
    url: '/admin/export/orders',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 导出执行者数据
export function exportExecutors(params) {
  return request({
    url: '/admin/export/executors',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 导出收入数据
export function exportRevenue(params) {
  return request({
    url: '/admin/export/revenue',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 获取导出历史
export function getExportHistory(params) {
  return request({
    url: '/admin/export/history',
    method: 'get',
    params
  })
}
