import { Button as MuiButton } from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Link } from 'react-router-dom'
import Button from '../components/Button'

const PlusIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
    <path d="M10 4a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V5a1 1 0 011-1z" />
  </svg>
)

const ArrowIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
  </svg>
)

const DownloadIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" />
  </svg>
)

function Card({ title, description, children }) {
  return (
    <div className="bg-white rounded-[8px] p-4 sm:p-6 md:p-8 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.06)]">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-[15px] font-bold text-[#1b1c1e]">{title}</h2>
        {description && <p className="text-[12px] text-[#9ca7b4] mt-1">{description}</p>}
      </div>
      {children}
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 py-3 border-b border-[#f0f2f4] last:border-0">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-[#b7bbc2] sm:w-24 sm:shrink-0">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-3">
        {children}
      </div>
    </div>
  )
}

export default function DitButtons() {
  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      {/* Header */}
      <div className="bg-white border-b border-[#f0f2f4] px-4 sm:px-8 md:px-14 py-4 sm:py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="size-[8px] rounded-full bg-[#006296]" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca7b4]">
                DIT Style Guide
              </span>
            </div>
            <h1 className="text-[20px] sm:text-[24px] font-bold text-[#1b1c1e]">Button System</h1>
          </div>
          <div className="flex items-center gap-2">
            <MuiButton component={Link} to="/mui" variant="outlined" size="small">
              <span className="hidden sm:inline">Material UI</span>
              <span className="sm:hidden">MUI</span>
            </MuiButton>
            <MuiButton component={Link} to="/ark" variant="outlined" size="small">
              <span className="hidden sm:inline">Ark UI</span>
              <span className="sm:hidden">Ark</span>
            </MuiButton>
            <MuiButton component={Link} to="/storage" variant="outlined" size="small">
              <span className="hidden sm:inline">Storage</span>
              <span className="sm:hidden">📁</span>
            </MuiButton>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 md:px-14 py-6 sm:py-10 flex flex-col gap-4 sm:gap-6">

        <Card title="Variants" description="Three visual styles to communicate hierarchy and intent.">
          <Row label="Primary"><Button variant="primary" size="md">Action</Button></Row>
          <Row label="Secondary"><Button variant="secondary" size="md">Action</Button></Row>
          <Row label="Ghost"><Button variant="ghost" size="md">Action</Button></Row>
        </Card>

        <Card title="Sizes" description="Three sizes — use larger sizes for primary actions, smaller for dense UI.">
          <Row label="Large">
            <Button variant="primary" size="lg">Large Button</Button>
            <Button variant="secondary" size="lg">Large Button</Button>
            <Button variant="ghost" size="lg">Large Button</Button>
          </Row>
          <Row label="Medium">
            <Button variant="primary" size="md">Medium Button</Button>
            <Button variant="secondary" size="md">Medium Button</Button>
            <Button variant="ghost" size="md">Medium Button</Button>
          </Row>
          <Row label="Small">
            <Button variant="primary" size="sm">Small Button</Button>
            <Button variant="secondary" size="sm">Small Button</Button>
            <Button variant="ghost" size="sm">Small Button</Button>
          </Row>
        </Card>

        <Card title="Shapes" description="Control the border radius to match the context or layout.">
          <Row label="Pill">
            <Button variant="primary" shape="pill">Pill Shape</Button>
            <Button variant="secondary" shape="pill">Pill Shape</Button>
            <Button variant="ghost" shape="pill">Pill Shape</Button>
          </Row>
          <Row label="Rounded">
            <Button variant="primary" shape="rounded">Rounded</Button>
            <Button variant="secondary" shape="rounded">Rounded</Button>
            <Button variant="ghost" shape="rounded">Rounded</Button>
          </Row>
          <Row label="Square">
            <Button variant="primary" shape="square">Square</Button>
            <Button variant="secondary" shape="square">Square</Button>
            <Button variant="ghost" shape="square">Square</Button>
          </Row>
        </Card>

        <Card title="With Icons" description="Supports leading, trailing, or both icons.">
          <Row label="Icon Start">
            <Button variant="primary" iconStart={<PlusIcon />}>Add Item</Button>
            <Button variant="secondary" iconStart={<PlusIcon />}>Add Item</Button>
            <Button variant="ghost" iconStart={<PlusIcon />}>Add Item</Button>
          </Row>
          <Row label="Icon End">
            <Button variant="primary" iconEnd={<ArrowIcon />}>Continue</Button>
            <Button variant="secondary" iconEnd={<ArrowIcon />}>Continue</Button>
            <Button variant="ghost" iconEnd={<ArrowIcon />}>Continue</Button>
          </Row>
          <Row label="Both">
            <Button variant="primary" iconStart={<DownloadIcon />} iconEnd={<ArrowIcon />}>Download</Button>
            <Button variant="secondary" iconStart={<DownloadIcon />} iconEnd={<ArrowIcon />}>Download</Button>
          </Row>
        </Card>

        <Card title="States" description="Interactive and non-interactive states.">
          <Row label="Default">
            <Button variant="primary">Default</Button>
            <Button variant="secondary">Default</Button>
            <Button variant="ghost">Default</Button>
          </Row>
          <Row label="Disabled">
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="secondary" disabled>Disabled</Button>
            <Button variant="ghost" disabled>Disabled</Button>
          </Row>
        </Card>

      </div>
    </div>
  )
}
