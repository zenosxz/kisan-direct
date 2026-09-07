const API = import.meta.env.VITE_API_URL || ''

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || data.message || 'Request failed')
  }
  return data
}

export const api = {
  getUserByPhone: (phone) => request(`/api/users/by-phone/${encodeURIComponent(phone)}`),
  upsertUser: (body) =>
    request('/api/users', { method: 'POST', body: JSON.stringify(body) }),
  listings: (params = '') => request(`/api/listings${params}`),
  createListing: (body) =>
    request('/api/listings', { method: 'POST', body: JSON.stringify(body) }),
  farmerStats: (farmerId) => request(`/api/listings/farmer/${farmerId}/stats`),
  mandi: (crop, state) =>
    request(`/api/mandi?crop=${encodeURIComponent(crop)}&state=${encodeURIComponent(state || '')}`),
  createRazorpayOrder: (body) =>
    request('/api/orders/razorpay', { method: 'POST', body: JSON.stringify(body) }),
  confirmOrder: (body) =>
    request('/api/orders/confirm', { method: 'POST', body: JSON.stringify(body) }),
  updateOrderStatus: (id, status) =>
    request(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  adminSummary: () => request('/api/admin/summary'),
}
