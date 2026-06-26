import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  adminLogin, getAppointments, updateAppointment,
  getDoctors, createDoctor, deleteDoctor,
  getFAQs, createFAQ, updateFAQ, deleteFAQ,
  type Appointment, type Doctor, type FAQ,
} from '../services/api'

type Tab = 'appointments' | 'doctors' | 'faqs'

export default function AdminPage() {
  const { t } = useTranslation()
  const [token, setToken] = useState(localStorage.getItem('medibot_token'))
  const [clinicId, setClinicId] = useState<number | null>(
    Number(localStorage.getItem('medibot_clinic_id')) || null
  )
  const [tab, setTab] = useState<Tab>('appointments')

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
      localStorage.setItem('medibot_clinic_id', String(res.data.clinic_id))
      setToken(res.data.access_token)
      setClinicId(res.data.clinic_id)
      setLoginError('')
    } catch {
      setLoginError('Invalid credentials')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('medibot_token')
    localStorage.removeItem('medibot_clinic_id')
    setToken(null)
    setClinicId(null)
  }

  useEffect(() => {
    if (!token || !clinicId) return
    if (tab === 'appointments') getAppointments(clinicId).then((r) => setAppointments(r.data))
    if (tab === 'doctors') getDoctors(clinicId).then((r) => setDoctors(r.data))
    if (tab === 'faqs') getFAQs(clinicId).then((r) => setFAQs(r.data))
  }, [tab, token, clinicId])

  if (!token || !clinicId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-6">{t('admin.login')}</h2>
          <input
            type="text"
            placeholder={t('admin.clinicSlug')}
            value={loginSlug}
            onChange={(e) => setLoginSlug(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder={t('admin.password')}
            value={loginPass}
            onChange={(e) => setLoginPass(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {loginError && <p className="text-red-500 text-xs mb-3">{loginError}</p>}
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium transition-colors"
          >
            {t('admin.signIn')}
          </button>
        </div>
      </div>
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'appointments', label: t('admin.appointments') },
    { key: 'doctors', label: t('admin.doctors') },
    { key: 'faqs', label: t('admin.faqs') },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
        <h1 className="font-bold text-lg">MediBot Admin</h1>
        <button onClick={handleLogout} className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full">
          {t('admin.logout')}
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-1 bg-white rounded-xl shadow p-1 mb-6 w-fit">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === key ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Appointments Tab */}
        {tab === 'appointments' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  {['Patient', 'Phone', 'Date', 'Time', 'Reason', 'Status', 'Action'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{a.patient_name}</td>
                    <td className="px-4 py-3">{a.patient_phone}</td>
                    <td className="px-4 py-3">{a.appointment_date}</td>
                    <td className="px-4 py-3">{a.appointment_time}</td>
                    <td className="px-4 py-3 text-gray-500">{a.reason || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        a.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        a.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {t(`admin.status.${a.status}` as any)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {a.status === 'pending' && (
                        <button
                          onClick={() =>
                            updateAppointment(a.id, { status: 'confirmed' }).then(() =>
                              setAppointments((prev) => prev.map((x) => x.id === a.id ? { ...x, status: 'confirmed' } : x))
                            )
                          }
                          className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                        >
                          Confirm
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No appointments yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Doctors Tab */}
        {tab === 'doctors' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="font-medium text-gray-700 mb-3">Add Doctor</h3>
              <DoctorForm clinicId={clinicId} onCreated={(d) => setDoctors((prev) => [...prev, d])} />
            </div>
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    {['Name', 'Specialty', 'Available Days', ''].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {doctors.map((d) => (
                    <tr key={d.id}>
                      <td className="px-4 py-3 font-medium">Dr. {d.name}</td>
                      <td className="px-4 py-3 text-gray-500">{d.specialty}</td>
                      <td className="px-4 py-3 text-gray-500">{d.available_days?.join(', ') || '—'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            deleteDoctor(d.id).then(() =>
                              setDoctors((prev) => prev.filter((x) => x.id !== d.id))
                            )
                          }
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {doctors.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No doctors yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FAQs Tab */}
        {tab === 'faqs' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="font-medium text-gray-700 mb-3">Add FAQ</h3>
              <FAQForm clinicId={clinicId} onCreated={(f) => setFAQs((prev) => [...prev, f])} />
            </div>
            <div className="bg-white rounded-xl shadow divide-y divide-gray-100">
              {faqs.map((f) => (
                <div key={f.id} className="px-4 py-3 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-800">{f.question_en}</p>
                    {f.question_ur && <p className="text-xs text-gray-500 font-urdu mt-0.5" dir="rtl">{f.question_ur}</p>}
                    <p className="text-sm text-gray-600 mt-1">{f.answer_en}</p>
                    {f.answer_ur && <p className="text-xs text-gray-500 font-urdu mt-0.5" dir="rtl">{f.answer_ur}</p>}
                  </div>
                  <button
                    onClick={() =>
                      deleteFAQ(f.id).then(() => setFAQs((prev) => prev.filter((x) => x.id !== f.id)))
                    }
                    className="text-xs text-red-500 hover:text-red-700 flex-shrink-0"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {faqs.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-400">No FAQs yet</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DoctorForm({ clinicId, onCreated }: { clinicId: number; onCreated: (d: Doctor) => void }) {
  const [name, setName] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [days, setDays] = useState('')

  const submit = async () => {
    if (!name || !specialty) return
    const res = await createDoctor({
      clinic_id: clinicId, name, specialty, bio: null,
      available_days: days ? days.split(',').map((s) => s.trim()) : null,
    })
    onCreated(res.data)
    setName(''); setSpecialty(''); setDays('')
  }

  return (
    <div className="flex flex-wrap gap-2">
      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <input placeholder="Specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <input placeholder="Days (Mon,Tue,Wed)" value={days} onChange={(e) => setDays(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <button onClick={submit}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
        Add
      </button>
    </div>
  )
}

function FAQForm({ clinicId, onCreated }: { clinicId: number; onCreated: (f: FAQ) => void }) {
  const [qEn, setQEn] = useState('')
  const [aEn, setAEn] = useState('')
  const [qUr, setQUr] = useState('')
  const [aUr, setAUr] = useState('')

  const submit = async () => {
    if (!qEn || !aEn) return
    const res = await createFAQ({
      clinic_id: clinicId, question_en: qEn, answer_en: aEn,
      question_ur: qUr || null, answer_ur: aUr || null, category: null,
    })
    onCreated(res.data)
    setQEn(''); setAEn(''); setQUr(''); setAUr('')
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input placeholder="Question (English)" value={qEn} onChange={(e) => setQEn(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input placeholder="سوال (اردو)" value={qUr} onChange={(e) => setQUr(e.target.value)} dir="rtl"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-urdu focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="flex gap-2">
        <textarea placeholder="Answer (English)" value={aEn} onChange={(e) => setAEn(e.target.value)} rows={2}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        <textarea placeholder="جواب (اردو)" value={aUr} onChange={(e) => setAUr(e.target.value)} rows={2} dir="rtl"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-urdu focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      </div>
      <button onClick={submit}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
        Add FAQ
      </button>
    </div>
  )
}
