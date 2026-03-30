import request from './request'

/**
 * 获取订单列表
 */
export function getOrderList(params) {
  return request({
    url: '/admin/orders',
    method: 'get',
    params
  })
}

/**
 * 获取订单详情
 */
export function getOrderDetail(id) {
  return request({
    url: `/admin/orders/${id}`,
    method: 'get'
  })
}

/**
 * 更新订单状态
 */
export function updateOrderStatus(id, status, remark = '') {
  return request({
    url: `/admin/orders/${id}/status`,
    method: 'put',
    data: {
      status,
      remark
    }
  })
}

/**
 * 删除订单
 */
export function deleteOrder(id) {
  return request({
    url: `/admin/orders/${id}`,
    method: 'delete'
  })
}

/**
 * 导出订单
 */
export function exportOrders(params) {
  return request({
    url: '/admin/orders/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
