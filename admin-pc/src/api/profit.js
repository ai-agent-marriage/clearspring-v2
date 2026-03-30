import request from './request'

/**
 * 获取分账配置
 */
export function getProfitSharingConfig() {
  return request({
    url: '/admin/profit-sharing',
    method: 'get'
  })
}

/**
 * 更新分账配置
 */
export function updateProfitSharingConfig(config) {
  return request({
    url: '/admin/profit-sharing',
    method: 'put',
    data: config
  })
}

/**
 * 获取分账记录
 */
export function getProfitRecords(params) {
  return request({
    url: '/admin/profit-sharing/records',
    method: 'get',
    params
  })
}

/**
 * 导出分账数据
 */
export function exportProfitRecords(params) {
  return request({
    url: '/admin/profit-sharing/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
