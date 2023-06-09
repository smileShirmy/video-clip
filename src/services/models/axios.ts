import axios from 'axios'

const instance = axios.create({
  baseURL: '',
  timeout: 5 * 1000
})

instance.interceptors.response.use((res) => {
  if (res.status.toString().charAt(0) === '2') {
    return res.data
  }
  return Promise.reject(res)
})

export function get<T = any>(url: string, params = {}): Promise<T> {
  return instance({
    method: 'get',
    url,
    params
  })
}
