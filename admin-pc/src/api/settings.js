import request from './request'

/**
 * 获取系统设置
 */
export function getSystemSettings() {
  return request({
    url: '/admin/settings',
    method: 'get'
  })
}

/**
 * 更新系统设置
 */
export function updateSystemSettings(settings) {
  return request({
    url: '/admin/settings',
    method: 'put',
    data: settings
  })
}

/**
 * 获取操作日志
 */
export function getOperationLogs(params) {
  return request({
    url: '/admin/logs',
    method: 'get',
    params
  })
}

/**
 * 获取管理员列表
 */
export function getAdminList() {
  return request({
    url: '/admin/admins',
    method: 'get'
  })
}
