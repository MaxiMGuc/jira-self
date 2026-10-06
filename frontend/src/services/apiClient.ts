import axios from 'axios'

/**
 * Isolated HTTP client configuration.
 *
 * Resource-specific endpoints are intentionally not defined here.
 * Add feature services when the backend API contract exists.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})
