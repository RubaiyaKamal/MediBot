import { useState, useEffect } from 'react'
import {
  adminLogin, getAppointments, updateAppointment,
  getDoctors, createDoctor, deleteDoctor,
  getFAQs, createFAQ, deleteFAQ,
  type Appointment, type Doctor, type FAQ,
} from '../services/api'

const PRIMARY = '#1B5E47'
const DARK = '#111827'
const HOSPITAL_ID = 1
const AVATAR_COLORS = ['#1B5E47', '#1d4ed8', '#7c3aed', '#b45309', '#be185d']

type NavItem = 'appointments' | 'doctors' | 'faqs' | 'clinics' | 'analytics'

const NAV_ITEMS: { key: NavItem; icon: string; label: string }[] = [
  { key: 'appointments', icon: '📅', label: 'Appointments' },
  { key: 'doctors', icon: '👨‍⚕️', label: 'Doctors' },
  { key: 'faqs', icon: '❓', label: 'FAQs' },
  { key: 'clinics', icon: '🏥', label: 'Hospital' },
  { key: 'analytics', icon: '📊', label: 'Analytics' },
]

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

function statusBadge(status: string) {
  if (status === 'confirmed') return 'bg-green-100 text-green-700'
  if (status === 'cancelled') return 'bg-red-100 text-red-700'
  return 'bg-amber-100 text-amber-700'
}

export default function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem('medibot_token'))
  const [activeNav, setActiveNav] = useState<NavItem>('appointments')
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null)

  const [loginSlug, setLoginSlug] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginError, setLoginError] = useState('')

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [faqs, setFAQs] = useState<FAQ[]>([])

  const handleLogin = async () => {
    try {
      const res = await adminLogin(loginSlug, loginPass)
      localStorage.setItem('medibot_token', res.data.access_token)
      setToken(res.data.access_token)
      setLoginError('')
    } catch {
      setLoginError('Invalid credentials')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('medibot_token')
    setToken(null)
  }

  useEffect(() => {
    if (!token) return
    getAppointments(HOSPITAL_ID).then((r) => setAppointments(r.data))
    getDoctors(HOSPITAL_ID).then((r) => setDoctors(r.data))
    getFAQs(HOSPITAL_ID).then((r) => setFAQs(r.data))
  }, [token])

  const doctorMap = Object.fromEntries(doctors.map((d) => [d.id, d]))

  const confirmAppt = (status: string) => {
    if (!selectedAppt) return
    updateAppointment(selectedAppt.id, { status }).then(() => {
      setAppointments((prev) =>
        prev.map((a) => (a.id === selectedAppt.id ? { ...a, status } : a))
      )
      setSelectedAppt((prev) => (prev ? { ...prev, status } : null))
    })
  }

  /* ── Login screen ── */
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f0f2f5' }}>
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: PRIMARY }}
            >
              M
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">MediBot Admin Panel</h2>
              <p className="text-xs text-gray-400">MediCare Hospital Karachi</p>
            </div>
          </div>
          <input
            type="text"
            placeholder="Hospital Slug"
            value={loginSlug}
            onChange={(e) => setLoginSlug(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
          />
          <input
            type="password"
            placeholder="Password"
            value={loginPass}
            onChange={(e) => setLoginPass(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
          />
          {loginError && <p className="text-red-500 text-xs mb-3">{loginError}</p>}
          <button
            onClick={handleLogin}
            className="w-full text-white rounded-lg py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: PRIMARY }}
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  const total = appointments.length
  const pending = appointments.filter((a) => a.status === 'pending').length
  const confirmed = appointments.filter((a) => a.status === 'confirmed').length

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f0f2f5' }}>
      {/* ── Sidebar ── */}
      <aside className="w-44 flex flex-col flex-shrink-0" style={{ backgroundColor: DARK }}>
        <div className="px-4 py-4 border-b border-white/10">
          <p className="text-white font-bold text-sm">MediBot</p>
          <p className="text-gray-500 text-xs mt-0.5">Admin Panel</p>
        </div>
        <nav className="flex-1 py-2">
          {NAV_ITEMS.map(({ key, icon, label }) => {
            const active = activeNav === key
            return (
              <button
                key={key}
                onClick={() => setActiveNav(key)}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-left transition-colors"
                style={{
                  backgroundColor: active ? 'rgba(27,94,71,0.25)' : 'transparent',
                  color: active ? '#6ee7b7' : '#6b7280',
                  borderLeft: active ? `3px solid ${PRIMARY}` : '3px solid transparent',
                }}
              >
                <span className="text-base">{icon}</span>
                <span className="font-medium">{label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className="text-white px-6 py-4 flex items-center justify-between flex-shrink-0"
          style={{ backgroundColor: DARK }}
        >
          <div>
            <h1 className="font-bold text-base">MediBot Admin Panel</h1>
            <p className="text-gray-400 text-xs mt-0.5">MediCare Hospital Karachi</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors"
          >
            🔴 Logout
          </button>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm" style={{ borderTop: `4px solid ${PRIMARY}` }}>
              <p className="text-xs font-semibold" style={{ color: PRIMARY }}>Total appointments</p>
              <p className="text-4xl font-bold mt-2" style={{ color: PRIMARY }}>{total}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-amber-400">
              <p className="text-xs font-semibold text-amber-600">Pending</p>
              <p className="text-4xl font-bold mt-2 text-amber-500">{pending}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-blue-400">
              <p className="text-xs font-semibold text-blue-600">Confirmed</p>
              <p className="text-4xl font-bold mt-2 text-blue-500">{confirmed}</p>
            </div>
          </div>

          {/* Appointments table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4">
              <h2 className="font-bold text-gray-900 text-base">Appointments</h2>
              <button
                className="text-xs text-white px-3 py-1.5 rounded-lg font-semibold"
                style={{ backgroundColor: PRIMARY }}
              >
                + Add appointment
              </button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: DARK }}>
                  {['Patient', 'Doctor', 'Date & Time', 'Status', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((a) => {
                  const doc = a.doctor_id ? doctorMap[a.doctor_id] : null
                  const isSelected = selectedAppt?.id === a.id
                  return (
                    <tr
                      key={a.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      style={isSelected ? { backgroundColor: '#f0fdf4', borderLeft: `3px solid ${PRIMARY}` } : {}}
                      onClick={() => setSelectedAppt(isSelected ? null : a)}
                    >
                      <td className="px-5 py-3 font-semibold text-gray-900">{a.patient_name}</td>
                      <td className="px-5 py-3 text-sm font-medium" style={{ color: PRIMARY }}>
                        {doc ? `Dr. ${doc.name}` : '—'}
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">
                        {a.appointment_date} · {a.appointment_time}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge(a.status)}`}>
                          {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-300 text-xs select-none">✏️ 🗑️</td>
                    </tr>
                  )
                })}
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">
                      No appointments yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Manage Doctors */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-base">Manage doctors</h2>
              <span className="text-xs text-white px-3 py-1.5 rounded-lg font-semibold bg-blue-600 cursor-default">
                + Add doctor
              </span>
            </div>
            {doctors.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-4">
                {doctors.map((d, i) => (
                  <div key={d.id} className="rounded-xl p-4 border border-gray-100 bg-slate-50">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                      >
                        {initials(d.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">Dr. {d.name}</p>
                        <p className="text-xs text-gray-500">{d.specialty}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">
                      {d.available_days?.join(' · ') || 'No days set'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-8 h-4 rounded-full flex items-center px-0.5"
                          style={{ backgroundColor: PRIMARY }}
                        >
                          <div className="w-3 h-3 bg-white rounded-full ml-auto shadow-sm"></div>
                        </div>
                        <span className="text-xs font-semibold" style={{ color: PRIMARY }}>Active</span>
                      </div>
                      <button
                        onClick={() =>
                          deleteDoctor(d.id).then(() =>
                            setDoctors((prev) => prev.filter((x) => x.id !== d.id))
                          )
                        }
                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="pt-4 border-t border-gray-100">
              <DoctorForm onCreated={(d) => setDoctors((prev) => [...prev, d])} />
            </div>
          </div>

          {/* Manage FAQs */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-base">Manage FAQs</h2>
              <span className="text-xs text-white px-3 py-1.5 rounded-lg font-semibold bg-amber-500 cursor-default">
                + Add FAQ
              </span>
            </div>
            <div className="divide-y divide-gray-100 rounded-lg overflow-hidden border border-gray-100 mb-4">
              {faqs.map((f, i) => (
                <div
                  key={f.id}
                  className={`flex items-center justify-between px-4 py-3 ${i === 0 ? 'bg-amber-50' : 'bg-white hover:bg-gray-50'} transition-colors`}
                >
                  <p className="text-sm text-gray-800 flex-1 truncate">Q: {f.question_en}</p>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <button
                      onClick={() =>
                        deleteFAQ(f.id).then(() =>
                          setFAQs((prev) => prev.filter((x) => x.id !== f.id))
                        )
                      }
                      className="text-xs text-red-400 hover:text-red-600 font-bold transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              {faqs.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-400 text-sm">No FAQs yet</div>
              )}
            </div>
            <FAQForm onCreated={(f) => setFAQs((prev) => [...prev, f])} />
          </div>

          {/* Appointment Confirmation Panel */}
          {selectedAppt && (
            <div className="rounded-xl p-5 text-white shadow-lg" style={{ backgroundColor: DARK }}>
              <h3 className="font-bold text-base mb-1">
                Confirm appointment — {selectedAppt.patient_name}
              </h3>
              <p className="text-gray-400 text-xs mb-5">
                Doctor:{' '}
                {selectedAppt.doctor_id && doctorMap[selectedAppt.doctor_id]
                  ? `Dr. ${doctorMap[selectedAppt.doctor_id].name}`
                  : 'TBD'}{' '}
                | {selectedAppt.appointment_date} · {selectedAppt.appointment_time} |{' '}
                {selectedAppt.reason || 'General Consultation'}
              </p>
              <div className="flex items-center gap-3 flex-wrap mb-4">
                <p className="text-xs text-gray-400">Change status to:</p>
                <button
                  onClick={() => confirmAppt('confirmed')}
                  className="text-xs px-4 py-1.5 rounded-full border font-semibold transition-colors"
                  style={{ borderColor: '#6ee7b7', color: '#6ee7b7', backgroundColor: 'rgba(27,94,71,0.3)' }}
                >
                  ✓ Confirmed
                </button>
                <button
                  onClick={() => confirmAppt('cancelled')}
                  className="text-xs px-4 py-1.5 rounded-full border border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition-colors font-semibold"
                >
                  ✕ Cancel
                </button>
                <button
                  onClick={() => confirmAppt('pending')}
                  className="text-xs px-4 py-1.5 rounded-full border border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-white transition-colors font-semibold"
                >
                  ↺ Reschedule
                </button>
              </div>
              <label className="flex items-center gap-2 text-gray-500 text-xs cursor-pointer">
                <input type="checkbox" className="rounded" defaultChecked />
                Confirmation email will be sent automatically to patient
              </label>
            </div>
          )}
        </main>

        {/* Footer */}
        <div
          className="text-white text-xs text-center py-2 font-medium flex-shrink-0"
          style={{ backgroundColor: DARK }}
        >
          Admin Panel — MediCare Hospital Karachi
        </div>
      </div>
    </div>
  )
}

function DoctorForm({ onCreated }: { onCreated: (d: Doctor) => void }) {
  const [name, setName] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [days, setDays] = useState('')

  const submit = async () => {
    if (!name || !specialty) return
    const res = await createDoctor({
      clinic_id: HOSPITAL_ID,
      name,
      specialty,
      bio: null,
      available_days: days ? days.split(',').map((s) => s.trim()) : null,
    })
    onCreated(res.data)
    setName('')
    setSpecialty('')
    setDays('')
  }

  return (
    <div className="flex flex-wrap gap-2">
      <input
        placeholder="Doctor name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-green-700 bg-gray-50"
      />
      <input
        placeholder="Specialty"
        value={specialty}
        onChange={(e) => setSpecialty(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-green-700 bg-gray-50"
      />
      <input
        placeholder="Days (Mon,Tue,Wed)"
        value={days}
        onChange={(e) => setDays(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-green-700 bg-gray-50"
      />
      <button
        onClick={submit}
        className="text-white px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
        style={{ backgroundColor: PRIMARY }}
      >
        Add Doctor
      </button>
    </div>
  )
}

function FAQForm({ onCreated }: { onCreated: (f: FAQ) => void }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  const submit = async () => {
    if (!question || !answer) return
    const res = await createFAQ({
      clinic_id: HOSPITAL_ID,
      question_en: question,
      answer_en: answer,
      question_ur: null,
      answer_ur: null,
      category: null,
    })
    onCreated(res.data)
    setQuestion('')
    setAnswer('')
  }

  return (
    <div className="space-y-2">
      <input
        placeholder="Question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 bg-gray-50"
      />
      <textarea
        placeholder="Answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={2}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 resize-none bg-gray-50"
      />
      <button
        onClick={submit}
        className="text-white px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#b45309' }}
      >
        Add FAQ
      </button>
    </div>
  )
}
