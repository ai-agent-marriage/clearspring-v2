import request from './request'

export function getExecutorList(params) {
  return request({
    url: '/executor/list',
    method: 'get',
    params
  })
}

export function getExecutorDetail(id) {
  return request({
    url: `/executor/${id}`,
    method: 'get'
  })
}

export function createExecutor(data) {
  return request({
    url: '/executor',
    method: 'post',
    data
  })
}

export function updateExecutor(id, data) {
  return request({
    url: `/executor/${id}`,
    method: 'put',
    data
  })
}

export function deleteExecutor(id) {
  return request({
    url: `/executor/${id}`,
    method: 'delete'
  })
}

export function toggleExecutorStatus(id) {
  return request({
    url: `/executor/${id}/toggle`,
    method: 'post'
  })
}
