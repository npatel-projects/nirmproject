import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import AddIcon from '@mui/icons-material/Add'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'

// ─── Design tokens from DIT Style Guide ───────────────────────────────────────
const dt = {
  primary:    '#006296',
  primaryDk:  '#003a5a',
  neutral05:  '#f1f2f2',
  neutral15:  '#dbdee1',
  neutral30:  '#b7bbc2',
  neutral50:  '#878f9a',
  neutral65:  '#60666e',
  white:      '#ffffff',
}

// ─── Kebab icon button ─────────────────────────────────────────────────────────
function KebabButton({ active = false }) {
  return (
    <button
      className="flex items-center justify-center rounded-full w-8 h-8 shrink-0 transition-colors"
      style={{
        backgroundColor: active ? dt.neutral15 : 'transparent',
        border: active ? `1px solid ${dt.neutral50}` : '1px solid transparent',
      }}
    >
      <MoreVertIcon style={{ fontSize: '1.1rem', color: active ? dt.primaryDk : dt.neutral65 }} />
    </button>
  )
}

// ─── Illustration card ─────────────────────────────────────────────────────────
function IllustrationCard({ label, name, variant = 'default', active = false, kebabActive = false }) {
  const isSelected = variant === 'selected'
  return (
    <div
      className="flex items-start rounded-lg border px-4 pb-3 pt-4 w-full"
      style={{
        backgroundColor: isSelected ? dt.white : dt.neutral05,
        borderColor: isSelected ? dt.neutral15 : active ? dt.neutral30 : dt.neutral15,
      }}
    >
      <div className="flex flex-col gap-0.5 flex-1 min-w-0 pt-0.5">
        <span
          className="text-[11px] leading-[15px]"
          style={{ color: isSelected ? dt.neutral65 : dt.primaryDk, fontWeight: 400 }}
        >
          {label}
        </span>
        <span
          className="text-base font-semibold leading-6"
          style={{ color: isSelected ? dt.primary : dt.primaryDk }}
        >
          {name}
        </span>
      </div>
      <KebabButton active={kebabActive} />
    </div>
  )
}

// ─── Sub-item card (indented with bracket) ─────────────────────────────────────
function SubItemCard({ appName, subtitle, status }) {
  return (
    <div className="flex items-start w-full">
      {/* bracket connector */}
      <div className="flex items-start pl-2 w-4 self-stretch shrink-0">
        <div
          className="flex-1 h-6 min-h-0 min-w-0"
          style={{
            borderLeft: `1.5px solid ${dt.neutral30}`,
            borderBottom: `1.5px solid ${dt.neutral30}`,
            borderBottomLeftRadius: '4px',
          }}
        />
      </div>

      {/* card */}
      <div
        className="flex items-center flex-1 min-w-0 rounded-lg border px-3 py-1 h-14"
        style={{ backgroundColor: dt.neutral05, borderColor: dt.neutral15 }}
      >
        <div className="flex flex-col gap-1 flex-1 min-w-0 pb-1 pr-1">
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-sm font-semibold leading-[22px]" style={{ color: dt.primary }}>
              {appName}
            </span>
            <span className="text-xs font-normal leading-4" style={{ color: dt.neutral65 }}>
              {subtitle}
            </span>
          </div>
          {status && (
            <span
              className="inline-flex items-center px-1 py-0 h-4 rounded text-[11px] font-bold uppercase leading-4"
              style={{ backgroundColor: dt.neutral65, color: dt.neutral05 }}
            >
              {status}
            </span>
          )}
        </div>
        {/* empty kebab placeholder to match layout */}
        <div className="w-8 h-8 shrink-0" />
      </div>
    </div>
  )
}

// ─── Action button ─────────────────────────────────────────────────────────────
function ActionButton({ children, variant = 'primary', icon }) {
  const isPrimary = variant === 'primary'
  return (
    <button
      className="flex items-center gap-1.5 px-2.5 py-2.5 rounded-lg text-[11px] font-semibold leading-[15px] transition-colors"
      style={{
        backgroundColor: isPrimary ? dt.primary : dt.neutral15,
        border: isPrimary ? 'none' : `1px solid ${dt.neutral50}`,
        color: isPrimary ? dt.white : dt.primaryDk,
        minWidth: '121px',
        justifyContent: 'space-between',
      }}
    >
      <span>{children}</span>
      {icon && <span className="flex items-center">{icon}</span>}
    </button>
  )
}

// ─── Main test page ────────────────────────────────────────────────────────────
export default function TestPage() {
  const navigate = useNavigate()
  const [activeKebab, setActiveKebab] = useState(null)

  return (
    <div className="w-full flex justify-start">
      <div
        className="flex flex-col gap-[60px] p-4 rounded-lg border"
        style={{
          backgroundColor: dt.neutral05,
          borderColor: dt.neutral15,
          width: '282px',
          minHeight: '500px',
        }}
      >
        {/* Back link */}
        <button
          className="flex items-center gap-1 text-sm leading-[22px] h-6"
          style={{ color: dt.primary }}
          onClick={() => navigate(-1)}
        >
          <ArrowBackIcon style={{ fontSize: '1rem' }} />
          Back to the homepage
        </button>

        {/* Side menu body */}
        <div className="flex flex-col gap-3">

          {/* Portfolio header */}
          <div className="flex items-center w-full">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <LayersOutlinedIcon style={{ fontSize: '1rem', color: dt.primaryDk, flexShrink: 0 }} />
              <span className="text-sm font-semibold leading-[22px]" style={{ color: dt.primaryDk }}>
                Portfolio
              </span>
            </div>
            <button
              className="flex items-center justify-center rounded-full w-8 h-8 shrink-0 hover:bg-[#dbdee1] transition-colors"
            >
              <MoreVertIcon style={{ fontSize: '1.1rem', color: dt.neutral65 }} />
            </button>
          </div>

          {/* Illustration cards */}
          <div className="flex flex-col gap-2 w-full">
            <IllustrationCard
              label="Illustration 1"
              name="Product Name"
              variant="selected"
            />
            <IllustrationCard
              label="Illustration 2"
              name="Product Name"
              variant="default"
              active
              kebabActive
            />
            <IllustrationCard
              label="Illustration 3"
              name="Product Name"
              variant="default"
            />

            {/* Sub-item with bracket */}
            <SubItemCard
              appName="eApp"
              subtitle="- Simplified issue"
              status="In progress"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 items-start">
            <ActionButton
              variant="primary"
              icon={<AddIcon style={{ fontSize: '0.85rem' }} />}
            >
              Add illustration
            </ActionButton>
            <ActionButton
              variant="secondary"
              icon={<CompareArrowsIcon style={{ fontSize: '0.85rem' }} />}
            >
              Compare
            </ActionButton>
          </div>

        </div>
      </div>
    </div>
  )
}
