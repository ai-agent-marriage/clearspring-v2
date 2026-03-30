import request from './request'

export function getLogList(params) {
  return request({
    url: '/log/list',
    method: 'get',
    params
  })
}

export function getLogDetail(id) {
  return request({
    url: `/log/${id}`,
    method: 'get'
  })
}

export function getOperationLogs(params) {
  return request({
    url: '/log/operations',
    method: 'get',
    params
  })
}

export function getLoginLogs(params) {
  return request({
    url: '/log/logins',
    method: 'get',
    params
  })
}

export function getErrorLogs(params) {
  return request({
    url: '/log/errors',
    method: 'get',
    params
  })
}

export function exportLogs(params) {
  return request({
    url: '/log/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
