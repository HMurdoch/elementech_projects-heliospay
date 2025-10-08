import axios from 'axios'

export const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE}/api`,
    timeout: 15000
})

// Generic helpers -------------------------------------------------

export async function get<T>(url: string, params?: any): Promise<T> {
    const { data } = await api.get<T>(url, { params })
    return data
}

export async function post<T>(url: string, payload?: any): Promise<T> {
    const { data } = await api.post<T>(url, payload)
    return data
}

export async function put<T>(url: string, payload?: any): Promise<T> {
    const { data } = await api.put<T>(url, payload)
    return data
}

export async function del<T>(url: string): Promise<T> {
    const { data } = await api.delete<T>(url)
    return data
}