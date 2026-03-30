import request from './request'

export function getProfitList(params) {
  return request({
    url: '/profit/list',
    method: 'get',
    params
  })
}

export function getProfitDetail(id) {
  return request({
    url: `/profit/${id}`,
    method: 'get'
  })
}

export function getProfitSummary(params) {
  return request({
    url: '/profit/summary',
    method: 'get',
    params
  })
}

export function distributeProfit(id, data) {
  return request({
    url: `/profit/${id}/distribute`,
    method: 'post',
    data
  })
}

export function getProfitRecords(executorId, params) {
  return request({
    url: `/profit/executor/${executorId}/records`,
    method: 'get',
    params
  })
}
