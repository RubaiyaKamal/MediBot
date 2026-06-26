import { useTranslation } from 'react-i18next'
import type { Clinic } from '../services/api'

interface Props {
  clinics: Clinic[]
  selectedId: number | null
  onChange: (id: number) => void
  loading: boolean
}

export default function ClinicSelector({ clinics, selectedId, onChange, loading }: Props) {
  const { t } = useTranslation()
  return (
    <select
      value={selectedId ?? ''}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      disabled={loading}
    >
      <option value="" disabled>
        {loading ? t('loadingClinics') : t('selectClinic')}
      </option>
      {clinics.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  )
}
