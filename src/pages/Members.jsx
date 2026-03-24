import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Field } from '@ark-ui/react/field'

function formatDate(str) {
  if (!str) return '—'
  return new Date(str + 'T00:00:00').toLocaleDateString('en-CA', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

const inputClass = `w-full px-3 py-2.5 border border-[#e8eaed] rounded-lg text-sm text-[#1b1c1e]
  focus:outline-none focus:border-[#006296] focus:ring-2 focus:ring-[#84c6ea]
  transition-colors placeholder:text-[#b7bbc2]`

const labelClass = 'block text-xs font-semibold uppercase tracking-widest text-[#9ca7b4] mb-1.5'

const empty = { first_name: '', last_name: '', date_of_birth: '' }

export default function MembersPage() {
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null) // { type: 'success' | 'error', message }

  async function fetchMembers() {
    setLoading(true)
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setAlert({ type: 'error', message: error.message })
    else setMembers(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchMembers() }, [])

  function validate() {
    const e = {}
    if (!form.first_name.trim()) e.first_name = 'First name is required'
    if (!form.last_name.trim()) e.last_name = 'Last name is required'
    if (!form.date_of_birth) e.date_of_birth = 'Date of birth is required'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }

    setSaving(true)
    setAlert(null)
    const { error } = await supabase.from('members').insert([{
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      date_of_birth: form.date_of_birth,
    }])

    if (error) {
      setAlert({ type: 'error', message: error.message })
    } else {
      setAlert({ type: 'success', message: `${form.first_name} ${form.last_name} added successfully.` })
      setForm(empty)
      setErrors({})
      await fetchMembers()
    }
    setSaving(false)
  }

  async function deleteMember(id, name) {
    if (!confirm(`Delete ${name}?`)) return
    const { error } = await supabase.from('members').delete().eq('id', id)
    if (error) setAlert({ type: 'error', message: error.message })
    else await fetchMembers()
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8]">

      {/* Header */}
      <div className="bg-white border-b border-[#f0f2f4] px-4 sm:px-8 md:px-14 py-4 sm:py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="size-2 rounded-full bg-green-500" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca7b4]">
                Supabase · Members
              </span>
            </div>
            <h1 className="text-[20px] sm:text-[24px] font-bold text-[#1b1c1e]">Member Registry</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Link to="/" className="px-3 py-1.5 text-xs border border-[#e8eaed] rounded-lg text-[#9ca7b4] hover:bg-[#f4f6f8] transition-colors">DIT</Link>
            <Link to="/mui" className="px-3 py-1.5 text-xs border border-[#e8eaed] rounded-lg text-[#9ca7b4] hover:bg-[#f4f6f8] transition-colors">MUI</Link>
            <Link to="/ark" className="px-3 py-1.5 text-xs border border-[#e8eaed] rounded-lg text-[#9ca7b4] hover:bg-[#f4f6f8] transition-colors">Ark UI</Link>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 md:px-14 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
        <p className="lg:col-span-3 text-sm text-[#1b1c1e]">Hello World</p>

        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-[0px_2px_8px_0px_rgba(0,0,0,0.06)] p-6">
            <h2 className="text-[15px] font-bold text-[#1b1c1e] mb-1">Add Member</h2>
            <p className="text-xs text-[#9ca7b4] mb-6">Fill in the details and click Save.</p>

            {/* Alert */}
            {alert && (
              <div className={`flex items-start gap-2 p-3 rounded-lg text-sm mb-5
                ${alert.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                <span>{alert.type === 'success' ? '✓' : '⚠️'}</span>
                <p className="flex-1">{alert.message}</p>
                <button onClick={() => setAlert(null)} className="opacity-50 hover:opacity-100">✕</button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

              {/* First Name */}
              <Field.Root invalid={!!errors.first_name}>
                <Field.Label className={labelClass}>First Name</Field.Label>
                <Field.Input
                  className={`${inputClass} ${errors.first_name ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                  placeholder="e.g. John"
                  value={form.first_name}
                  onChange={e => { setForm(f => ({ ...f, first_name: e.target.value })); setErrors(er => ({ ...er, first_name: '' })) }}
                />
                {errors.first_name && <Field.ErrorText className="text-xs text-red-500 mt-1">{errors.first_name}</Field.ErrorText>}
              </Field.Root>

              {/* Last Name */}
              <Field.Root invalid={!!errors.last_name}>
                <Field.Label className={labelClass}>Last Name</Field.Label>
                <Field.Input
                  className={`${inputClass} ${errors.last_name ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                  placeholder="e.g. Smith"
                  value={form.last_name}
                  onChange={e => { setForm(f => ({ ...f, last_name: e.target.value })); setErrors(er => ({ ...er, last_name: '' })) }}
                />
                {errors.last_name && <Field.ErrorText className="text-xs text-red-500 mt-1">{errors.last_name}</Field.ErrorText>}
              </Field.Root>

              {/* Date of Birth */}
              <Field.Root invalid={!!errors.date_of_birth}>
                <Field.Label className={labelClass}>Date of Birth</Field.Label>
                <Field.Input
                  type="date"
                  className={`${inputClass} ${errors.date_of_birth ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                  value={form.date_of_birth}
                  onChange={e => { setForm(f => ({ ...f, date_of_birth: e.target.value })); setErrors(er => ({ ...er, date_of_birth: '' })) }}
                />
                {errors.date_of_birth && <Field.ErrorText className="text-xs text-red-500 mt-1">{errors.date_of_birth}</Field.ErrorText>}
              </Field.Root>

              <button
                type="submit"
                disabled={saving}
                className="mt-2 w-full py-3 rounded-lg bg-[#006296] text-white text-sm font-semibold
                  hover:bg-[#003a5a] active:bg-[#012639] disabled:opacity-60 disabled:cursor-not-allowed
                  transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Saving…
                  </>
                ) : 'Save Member'}
              </button>
            </form>
          </div>
        </div>

        {/* Members Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-[0px_2px_8px_0px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f2f4]">
              <h2 className="text-[15px] font-bold text-[#1b1c1e]">
                Members
                {!loading && (
                  <span className="ml-2 text-xs font-normal text-[#9ca7b4]">({members.length})</span>
                )}
              </h2>
              <button onClick={fetchMembers} className="text-xs text-[#9ca7b4] hover:text-[#1b1c1e] px-2 py-1 rounded hover:bg-[#f4f6f8] transition-colors">
                ↺ Refresh
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="size-8 rounded-full border-4 border-[#006296] border-t-transparent animate-spin" />
              </div>
            ) : members.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-16 text-[#9ca7b4]">
                <span className="text-4xl">👥</span>
                <p className="text-sm font-semibold">No members yet</p>
                <p className="text-xs">Add the first one using the form.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#fafafa] border-b border-[#f0f2f4]">
                      <th className="text-left px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-[#9ca7b4]">First Name</th>
                      <th className="text-left px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-[#9ca7b4]">Last Name</th>
                      <th className="text-left px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-[#9ca7b4]">Date of Birth</th>
                      <th className="text-left px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-[#9ca7b4]">Added</th>
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f2f4]">
                    {members.map(m => (
                      <tr key={m.id} className="hover:bg-[#fafafa] transition-colors">
                        <td className="px-6 py-4 font-semibold text-[#1b1c1e]">{m.first_name}</td>
                        <td className="px-6 py-4 text-[#1b1c1e]">{m.last_name}</td>
                        <td className="px-6 py-4 text-[#9ca7b4]">{formatDate(m.date_of_birth)}</td>
                        <td className="px-6 py-4 text-[#9ca7b4]">{formatDate(m.created_at?.split('T')[0])}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => deleteMember(m.id, `${m.first_name} ${m.last_name}`)}
                            className="text-[#b7bbc2] hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                            title="Delete"
                          >
                            🗑
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
