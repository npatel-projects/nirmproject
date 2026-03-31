/**
 * DynamicForm — shared form primitives driven by JSON form templates.
 *
 * Exports:
 *   FormField      — renders a single field based on its type
 *   DynamicSections — renders a full list of sections with conditional visibility
 *
 * Supported field types: text, email, phone, number, date, textarea, select, radio, checkbox
 */

import { Select, createListCollection } from '@ark-ui/react/select'
import { RadioGroup } from '@ark-ui/react/radio-group'
import CheckIcon from '@mui/icons-material/Check'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

function normalizeOptions(options = []) {
  return options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
}

// ─── Single field ─────────────────────────────────────────────────────────────
export function FormField({ field, value, onChange, error }) {
  const inputBase = `w-full px-3 py-2 text-sm border rounded focus:outline-none transition-colors ${
    error ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-blue-400'
  }`
  const borderClass = error ? 'border-red-400' : 'border-gray-300'

  const Label = () => (
    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={field.id}>
      {field.label}
      {field.required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )

  // ── Select ────────────────────────────────────────────────────────────────
  if (field.type === 'select') {
    const options = normalizeOptions(field.options ?? [])
    const collection = createListCollection({ items: options })
    return (
      <div>
        <Label />
        <Select.Root
          collection={collection}
          value={value ? [value] : []}
          onValueChange={({ value: v }) => onChange(field.id, v[0] ?? '')}
        >
          <Select.Control>
            <Select.Trigger
              className={`flex items-center justify-between gap-2 w-full px-3 py-2 text-sm border ${borderClass} rounded bg-white cursor-pointer hover:border-gray-400 focus:outline-none focus:border-blue-400 transition-colors`}
            >
              <Select.ValueText
                placeholder="Select…"
                className="text-gray-700 truncate data-[placeholder]:text-gray-400"
              />
              <Select.Indicator className="shrink-0">
                <KeyboardArrowDownIcon fontSize="small" className="text-gray-400" />
              </Select.Indicator>
            </Select.Trigger>
          </Select.Control>
          <Select.Positioner>
            <Select.Content className="bg-white border border-gray-200 rounded shadow-lg z-50 py-1 max-h-60 overflow-y-auto min-w-[var(--reference-width)]">
              {options.map((item) => (
                <Select.Item
                  key={item.value}
                  item={item}
                  className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 data-[highlighted]:bg-gray-50 outline-none"
                >
                  <Select.ItemText>{item.label}</Select.ItemText>
                  <Select.ItemIndicator>
                    <CheckIcon style={{ fontSize: 14, color: '#2563eb' }} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    )
  }

  // ── Radio ─────────────────────────────────────────────────────────────────
  if (field.type === 'radio') {
    const options = normalizeOptions(field.options ?? [])
    return (
      <div>
        <Label />
        <RadioGroup.Root
          value={value ?? ''}
          onValueChange={({ value: v }) => onChange(field.id, v)}
          className="flex flex-wrap gap-3 mt-1"
        >
          {options.map((o) => (
            <RadioGroup.Item key={o.value} value={o.value} className="flex items-center gap-2 cursor-pointer group">
              <RadioGroup.ItemControl className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center group-data-[state=checked]:border-blue-600 transition-colors">
                <div className="w-2 h-2 rounded-full bg-blue-600 hidden group-data-[state=checked]:block" />
              </RadioGroup.ItemControl>
              <RadioGroup.ItemText className="text-sm text-gray-700">{o.label}</RadioGroup.ItemText>
              <RadioGroup.ItemHiddenInput />
            </RadioGroup.Item>
          ))}
        </RadioGroup.Root>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    )
  }

  // ── Checkbox ──────────────────────────────────────────────────────────────
  if (field.type === 'checkbox') {
    return (
      <div className="flex items-start gap-3">
        <input
          id={field.id}
          type="checkbox"
          checked={value === true}
          onChange={(e) => onChange(field.id, e.target.checked)}
          className="mt-0.5 accent-blue-600 shrink-0"
        />
        <label htmlFor={field.id} className="text-sm text-gray-700 cursor-pointer leading-snug">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    )
  }

  // ── Textarea ──────────────────────────────────────────────────────────────
  if (field.type === 'textarea') {
    return (
      <div>
        <Label />
        <textarea
          id={field.id}
          rows={3}
          value={value ?? ''}
          placeholder={field.placeholder ?? ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          className={`${inputBase} resize-none`}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    )
  }

  // ── Number (currency) ─────────────────────────────────────────────────────
  if (field.type === 'number') {
    return (
      <div>
        <Label />
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
          <input
            id={field.id}
            type="number"
            min="0"
            step="0.01"
            value={value ?? ''}
            placeholder={field.placeholder ?? '0.00'}
            onChange={(e) => onChange(field.id, e.target.value)}
            className={`${inputBase} pl-7`}
          />
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    )
  }

  // ── Text / email / phone / date ───────────────────────────────────────────
  return (
    <div>
      <Label />
      <input
        id={field.id}
        type={field.type === 'phone' ? 'tel' : field.type}
        value={value ?? ''}
        placeholder={field.placeholder ?? ''}
        max={field.type === 'date' ? new Date().toISOString().split('T')[0] : undefined}
        onChange={(e) => onChange(field.id, e.target.value)}
        className={inputBase}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

// ─── Section list ─────────────────────────────────────────────────────────────
export function DynamicSections({ sections, values, onChange, errors }) {
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
                <FormField
                  field={field}
                  value={values[field.id] ?? ''}
                  onChange={onChange}
                  error={errors?.[field.id]}
                />
              </div>
            )
          })}
        </div>
      </div>
    )
  })
}
