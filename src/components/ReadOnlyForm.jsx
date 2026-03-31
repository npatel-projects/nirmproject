/**
 * ReadOnlyForm — shared read-only display primitives for submitted form data.
 *
 * Exports:
 *   ReadOnlyField    — displays a single field value, formatted by type
 *   ReadOnlySections — renders a full template with conditional visibility
 */

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatCurrency(val) {
  if (val == null) return '—'
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(val)
}

// ─── Single field ─────────────────────────────────────────────────────────────
export function ReadOnlyField({ field, value }) {
  let display = value || '—'

  if (field.type === 'select' || field.type === 'radio') {
    const options = field.options ?? []
    const opt = options.find((o) => (typeof o === 'string' ? o === value : o.value === value))
    display = (typeof opt === 'string' ? opt : opt?.label) ?? value ?? '—'
  } else if (field.type === 'number') {
    display = value ? formatCurrency(value) : '—'
  } else if (field.type === 'date') {
    display = formatDate(value)
  } else if (field.type === 'checkbox') {
    display = value === true || value === 'true' ? 'Yes' : 'No'
  }

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1">{field.label}</p>
      <p className="text-sm text-gray-900">{display}</p>
    </div>
  )
}

// ─── Section list ─────────────────────────────────────────────────────────────
export function ReadOnlySections({ sections, values }) {
  return sections.map((section) => {
    const visible = section.fields.filter((f) => {
      if (!f.show_if) return true
      return values[f.show_if.field] === f.show_if.value
    })
    if (visible.length === 0) return null

    return (
      <div key={section.id} className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">{section.title}</h3>
        {section.description && (
          <p className="text-xs text-gray-400 mb-4">{section.description}</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          {visible.map((field) => {
            const wide = field.type === 'textarea' || field.type === 'radio' || field.type === 'checkbox'
            return (
              <div key={field.id} className={wide ? 'col-span-full' : ''}>
                <ReadOnlyField field={field} value={values[field.id]} />
              </div>
            )
          })}
        </div>
      </div>
    )
  })
}
