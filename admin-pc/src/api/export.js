import request from './request'

export function exportOrderList(params) {
  return request({
    url: '/export/orders',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

export function exportQualificationList(params) {
  return request({
    url: '/export/qualifications',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

export function exportExecutorList(params) {
  return request({
    url: '/export/executors',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

export function exportProfitRecords(params) {
  return request({
    url: '/export/profit',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
