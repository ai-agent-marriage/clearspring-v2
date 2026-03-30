import request from './request'

/**
 * 订单数据导出
 */
export function exportOrderList(params) {
  return request({
    url: '/admin/export/orders',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

/**
 * 执行者数据导出
 */
export function exportExecutorList(params) {
  return request({
    url: '/admin/export/executors',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

/**
 * 收入数据导出
 */
export function exportRevenue(params) {
  return request({
    url: '/admin/export/revenue',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

/**
 * 资质数据导出
 */
export function exportQualificationList(params) {
  return request({
    url: '/admin/export/qualifications',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

/**
 * 获取导出历史
 */
export function getExportHistory() {
  return request({
    url: '/admin/export/history',
    method: 'get'
  })
}
