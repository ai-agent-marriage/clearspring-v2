import request from './request'

export function getDashboardStats() {
  return request({
    url: '/dashboard/stats',
    method: 'get'
  })
}

export function getDashboardOverview() {
  return request({
    url: '/dashboard/overview',
    method: 'get'
  })
}

export function getDashboardCharts() {
  return request({
    url: '/dashboard/charts',
    method: 'get'
  })
}
