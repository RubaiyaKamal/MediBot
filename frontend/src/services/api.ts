import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medibot_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('medibot_token')
      window.location.reload()
    }
    return Promise.reject(err)
  }
)

export interface Clinic {
  id: number
  name: string
  slug: string
  address: string
  phone: string
  email: string
  opening_hours: Record<string, string> | null
  logo_url: string | null
}

export interface ChatResponse {
  reply: string
  session_id: string
  quick_replies: string[]
}

export interface Appointment {
  id: number
  clinic_id: number
  doctor_id: number | null
  patient_name: string
  patient_phone: string
  patient_email: string | null
  appointment_date: string
  appointment_time: string
  reason: string | null
  status: string
  language: string
  created_at: string
}

export interface Doctor {
  id: number
  clinic_id: number
  name: string
  specialty: string
  bio: string | null
  available_days: string[] | null
}

export interface FAQ {
  id: number
  clinic_id: number
  question_en: string
  question_ur: string | null
  answer_en: string
  answer_ur: string | null
  category: string | null
}

export const getClinics = () => api.get<Clinic[]>('/clinics')
export const getClinic = (slug: string) => api.get<Clinic>(`/clinics/${slug}`)

export const sendMessage = (clinicId: number, sessionId: string, message: string) =>
  api.post<ChatResponse>('/chat', { clinic_id: clinicId, session_id: sessionId, message })

export const adminLogin = (clinicSlug: string, password: string) =>
  api.post('/auth/login', { clinic_slug: clinicSlug, password })

export const getAppointments = (clinicId: number, status?: string) =>
  api.get<Appointment[]>('/appointments', { params: { clinic_id: clinicId, status } })

export const updateAppointment = (id: number, data: { status: string }) =>
  api.patch<Appointment>(`/appointments/${id}`, data)

export const getDoctors = (clinicId: number) =>
  api.get<Doctor[]>('/doctors', { params: { clinic_id: clinicId } })

export const createDoctor = (data: Omit<Doctor, 'id'>) => api.post<Doctor>('/doctors', data)
export const deleteDoctor = (id: number) => api.delete(`/doctors/${id}`)

export const getFAQs = (clinicId: number) =>
  api.get<FAQ[]>('/faqs', { params: { clinic_id: clinicId } })

export const createFAQ = (data: Omit<FAQ, 'id'>) => api.post<FAQ>('/faqs', data)
export const updateFAQ = (id: number, data: Partial<FAQ>) => api.patch<FAQ>(`/faqs/${id}`, data)
export const deleteFAQ = (id: number) => api.delete(`/faqs/${id}`)
