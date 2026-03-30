import request from './request'

// 获取基础配置
export function getBaseConfig() {
  return request({
    url: '/admin/settings/base',
    method: 'get'
  })
}

// 更新基础配置
export function updateBaseConfig(data) {
  return request({
    url: '/admin/settings/base',
    method: 'put',
    data
  })
}

// 获取权限配置
export function getPermissionConfig() {
  return request({
    url: '/admin/settings/permissions',
    method: 'get'
  })
}

// 更新权限配置
export function updatePermissionConfig(data) {
  return request({
    url: '/admin/settings/permissions',
    method: 'put',
    data
  })
}

// 获取操作日志
export function getOperationLogs(params) {
  return request({
    url: '/admin/settings/logs',
    method: 'get',
    params
  })
}

// 获取系统信息
export function getSystemInfo() {
  return request({
    url: '/admin/settings/system-info',
    method: 'get'
  })
}
