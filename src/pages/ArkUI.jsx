import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Accordion } from '@ark-ui/react/accordion'
import { Avatar } from '@ark-ui/react/avatar'
import { Checkbox } from '@ark-ui/react/checkbox'
import { Collapsible } from '@ark-ui/react/collapsible'
import { Dialog } from '@ark-ui/react/dialog'
import { Drawer } from '@ark-ui/react/drawer'
import { Menu } from '@ark-ui/react/menu'
import { NumberInput } from '@ark-ui/react/number-input'
import { Pagination } from '@ark-ui/react/pagination'
import { PinInput } from '@ark-ui/react/pin-input'
import { Popover } from '@ark-ui/react/popover'
import { Progress } from '@ark-ui/react/progress'
import { RadioGroup } from '@ark-ui/react/radio-group'
import { RatingGroup } from '@ark-ui/react/rating-group'
import { SegmentGroup } from '@ark-ui/react/segment-group'
import { Select, createListCollection } from '@ark-ui/react/select'
import { Slider } from '@ark-ui/react/slider'
import { Steps } from '@ark-ui/react/steps'
import { Switch } from '@ark-ui/react/switch'
import { Tabs } from '@ark-ui/react/tabs'
import { TagsInput } from '@ark-ui/react/tags-input'
import { ToggleGroup } from '@ark-ui/react/toggle-group'
import { Tooltip } from '@ark-ui/react/tooltip'

/* ── helpers ── */
function Card({ title, description, children }) {
  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.06)]">
      <p className="text-[15px] font-bold text-[#1b1c1e]">{title}</p>
      {description && <p className="text-[12px] text-[#9ca7b4] mt-1 mb-4">{description}</p>}
      <div className="mt-4">{children}</div>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 py-3 border-b border-[#f0f2f4] last:border-0">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-[#b7bbc2] sm:w-28 sm:shrink-0 sm:pt-1">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

const btn = 'inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-150'
const primary = `${btn} bg-[#006296] text-white hover:bg-[#003a5a] active:bg-[#012639]`
const secondary = `${btn} border border-[#006296] text-[#006296] hover:bg-[#e6f3fa]`
const ghost = `${btn} text-[#006296] hover:bg-[#e6f3fa]`

/* ── select collection ── */
const fruitCollection = createListCollection({
  items: [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
    { label: 'Mango', value: 'mango' },
    { label: 'Orange', value: 'orange' },
  ],
})

const stepsItems = [
  { title: 'Account', description: 'Enter your details' },
  { title: 'Profile', description: 'Customize your profile' },
  { title: 'Review', description: 'Confirm & submit' },
]

export default function ArkUIPage() {
  const [step, setStep] = useState(0)

  return (
    <div className="min-h-screen bg-[#f4f6f8]">

      {/* Header */}
      <div className="bg-white border-b border-[#f0f2f4] px-4 sm:px-8 md:px-14 py-4 sm:py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="size-2 rounded-full bg-violet-500" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca7b4]">Ark UI</span>
            </div>
            <h1 className="text-[20px] sm:text-[24px] font-bold text-[#1b1c1e]">Component Showcase</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className={`${secondary} text-xs sm:text-sm px-2 sm:px-4`}>
              <span className="hidden sm:inline">DIT Guide</span>
              <span className="sm:hidden">DIT</span>
            </Link>
            <Link to="/mui" className={`${secondary} text-xs sm:text-sm px-2 sm:px-4`}>MUI</Link>
            <Link to="/members" className={`${secondary} text-xs sm:text-sm px-2 sm:px-4`}>Members</Link>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 md:px-14 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* Accordion */}
        <Card title="Accordion" description="Expandable content sections.">
          <Accordion.Root defaultValue={['item-1']} collapsible className="flex flex-col gap-2">
            {['What is Ark UI?', 'Is it accessible?', 'Does it support Tailwind?'].map((q, i) => (
              <Accordion.Item key={i} value={`item-${i + 1}`} className="border border-[#e8eaed] rounded-lg overflow-hidden">
                <Accordion.ItemTrigger className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-[#1b1c1e] bg-white hover:bg-[#f4f6f8] cursor-pointer transition-colors">
                  {q}
                  <Accordion.ItemIndicator className="text-[#9ca7b4] transition-transform duration-200 data-[state=open]:rotate-180">
                    ▾
                  </Accordion.ItemIndicator>
                </Accordion.ItemTrigger>
                <Accordion.ItemContent className="px-4 py-3 text-sm text-[#9ca7b4] bg-[#fafafa] border-t border-[#f0f2f4]">
                  {i === 0 && 'Ark UI is a headless component library built on top of Zag.js state machines.'}
                  {i === 1 && 'Yes — every component is built with WAI-ARIA patterns and full keyboard support.'}
                  {i === 2 && 'Absolutely. Since it\'s headless, you style everything with your own classes.'}
                </Accordion.ItemContent>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </Card>

        {/* Avatar */}
        <Card title="Avatar" description="User profile images with fallback initials.">
          <div className="flex flex-wrap gap-4 items-end">
            {[
              { src: 'https://i.pravatar.cc/150?img=1', name: 'Alice' },
              { src: 'https://i.pravatar.cc/150?img=2', name: 'Bob' },
              { src: null, name: 'Carol White' },
              { src: null, name: 'DL' },
            ].map(({ src, name }) => (
              <Avatar.Root key={name} className="relative flex items-center justify-center rounded-full bg-[#006296] text-white font-semibold overflow-hidden"
                style={{ width: 48, height: 48 }}>
                {src && <Avatar.Image src={src} alt={name} className="size-full object-cover" />}
                <Avatar.Fallback className="text-sm">
                  {name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </Avatar.Fallback>
              </Avatar.Root>
            ))}
            <Avatar.Root className="relative flex items-center justify-center rounded-full bg-violet-500 text-white font-semibold overflow-hidden" style={{ width: 64, height: 64 }}>
              <Avatar.Fallback className="text-lg">EQ</Avatar.Fallback>
            </Avatar.Root>
          </div>
        </Card>

        {/* Checkbox */}
        <Card title="Checkbox" description="Controlled and uncontrolled checkbox states.">
          <div className="flex flex-col gap-3">
            {[
              { label: 'Default unchecked', checked: false },
              { label: 'Default checked', checked: true },
              { label: 'Indeterminate', indeterminate: true },
            ].map(({ label, checked, indeterminate }) => (
              <Checkbox.Root key={label} defaultChecked={checked} className="flex items-center gap-3 cursor-pointer group">
                <Checkbox.Control className="size-5 rounded border-2 border-[#b7bbc2] flex items-center justify-center transition-colors
                  group-data-[state=checked]:bg-[#006296] group-data-[state=checked]:border-[#006296]
                  group-data-[state=indeterminate]:bg-[#006296] group-data-[state=indeterminate]:border-[#006296]">
                  <Checkbox.Indicator className="text-white text-xs leading-none">
                    {indeterminate ? '−' : '✓'}
                  </Checkbox.Indicator>
                </Checkbox.Control>
                <Checkbox.Label className="text-sm text-[#1b1c1e]">{label}</Checkbox.Label>
                <Checkbox.HiddenInput />
              </Checkbox.Root>
            ))}
            <Checkbox.Root disabled className="flex items-center gap-3 cursor-not-allowed opacity-40">
              <Checkbox.Control className="size-5 rounded border-2 border-[#b7bbc2] flex items-center justify-center" />
              <Checkbox.Label className="text-sm text-[#1b1c1e]">Disabled</Checkbox.Label>
              <Checkbox.HiddenInput />
            </Checkbox.Root>
          </div>
        </Card>

        {/* Switch */}
        <Card title="Switch" description="Toggle on/off controls.">
          <div className="flex flex-col gap-3">
            {[
              { label: 'Notifications', defaultChecked: true },
              { label: 'Dark mode', defaultChecked: false },
              { label: 'Auto-save', defaultChecked: true },
            ].map(({ label, defaultChecked }) => (
              <Switch.Root key={label} defaultChecked={defaultChecked} className="flex items-center gap-3 cursor-pointer group">
                <Switch.Control className="w-11 h-6 rounded-full bg-[#b7bbc2] transition-colors duration-200
                  group-data-[state=checked]:bg-[#006296] relative">
                  <Switch.Thumb className="size-5 rounded-full bg-white shadow absolute top-0.5 left-0.5 transition-all duration-200
                    group-data-[state=checked]:translate-x-5" />
                </Switch.Control>
                <Switch.Label className="text-sm text-[#1b1c1e]">{label}</Switch.Label>
                <Switch.HiddenInput />
              </Switch.Root>
            ))}
            <Switch.Root disabled className="flex items-center gap-3 cursor-not-allowed opacity-40">
              <Switch.Control className="w-11 h-6 rounded-full bg-[#b7bbc2] relative">
                <Switch.Thumb className="size-5 rounded-full bg-white shadow absolute top-0.5 left-0.5" />
              </Switch.Control>
              <Switch.Label className="text-sm text-[#1b1c1e]">Disabled</Switch.Label>
              <Switch.HiddenInput />
            </Switch.Root>
          </div>
        </Card>

        {/* Tabs */}
        <Card title="Tabs" description="Switchable content panels.">
          <Tabs.Root defaultValue="overview">
            <Tabs.List className="flex border-b border-[#e8eaed] gap-1 overflow-x-auto">
              {['overview', 'activity', 'settings', 'billing'].map(t => (
                <Tabs.Trigger key={t} value={t}
                  className="px-4 py-2 text-sm font-semibold capitalize text-[#9ca7b4] border-b-2 border-transparent whitespace-nowrap
                  data-[selected]:text-[#006296] data-[selected]:border-[#006296] transition-colors cursor-pointer hover:text-[#1b1c1e]">
                  {t}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            {['overview', 'activity', 'settings', 'billing'].map(t => (
              <Tabs.Content key={t} value={t} className="pt-4 text-sm text-[#9ca7b4]">
                {t.charAt(0).toUpperCase() + t.slice(1)} content goes here.
              </Tabs.Content>
            ))}
          </Tabs.Root>
        </Card>

        {/* Radio Group */}
        <Card title="Radio Group" description="Single-selection option group.">
          <RadioGroup.Root defaultValue="standard" className="flex flex-col gap-2">
            {[
              { value: 'standard', label: 'Standard', desc: 'Ships in 5–7 days' },
              { value: 'express', label: 'Express', desc: 'Ships in 2–3 days' },
              { value: 'overnight', label: 'Overnight', desc: 'Ships next day' },
            ].map(opt => (
              <RadioGroup.Item key={opt.value} value={opt.value}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[#e8eaed] cursor-pointer
                data-[state=checked]:border-[#006296] data-[state=checked]:bg-[#f0f8fd] transition-colors group">
                <RadioGroup.ItemControl className="size-4 rounded-full border-2 border-[#b7bbc2] flex items-center justify-center
                  group-data-[state=checked]:border-[#006296]">
                  <div className="size-2 rounded-full bg-[#006296] opacity-0 group-data-[state=checked]:opacity-100 transition-opacity" />
                </RadioGroup.ItemControl>
                <div>
                  <RadioGroup.ItemText className="text-sm font-semibold text-[#1b1c1e]">{opt.label}</RadioGroup.ItemText>
                  <p className="text-xs text-[#9ca7b4]">{opt.desc}</p>
                </div>
                <RadioGroup.ItemHiddenInput />
              </RadioGroup.Item>
            ))}
          </RadioGroup.Root>
        </Card>

        {/* Segment Group */}
        <Card title="Segment Group" description="Mutually exclusive button toggle group.">
          <div className="flex flex-col gap-4">
            <SegmentGroup.Root defaultValue="month" className="flex bg-[#f4f6f8] p-1 rounded-lg gap-1 w-fit">
              {['Day', 'Week', 'Month', 'Year'].map(v => (
                <SegmentGroup.Item key={v} value={v.toLowerCase()}
                  className="px-4 py-1.5 rounded-md text-sm font-semibold text-[#9ca7b4] cursor-pointer transition-all
                  data-[state=checked]:bg-white data-[state=checked]:text-[#1b1c1e] data-[state=checked]:shadow-sm">
                  <SegmentGroup.ItemText>{v}</SegmentGroup.ItemText>
                  <SegmentGroup.ItemHiddenInput />
                </SegmentGroup.Item>
              ))}
            </SegmentGroup.Root>
          </div>
        </Card>

        {/* Toggle Group */}
        <Card title="Toggle Group" description="Multi-select formatting controls.">
          <div className="flex flex-col gap-3">
            <ToggleGroup.Root multiple className="flex gap-1">
              {[
                { value: 'bold', label: 'B', style: 'font-bold' },
                { value: 'italic', label: 'I', style: 'italic' },
                { value: 'underline', label: 'U', style: 'underline' },
              ].map(({ value, label, style }) => (
                <ToggleGroup.Item key={value} value={value}
                  className={`size-9 rounded-lg border border-[#e8eaed] text-sm text-[#9ca7b4] cursor-pointer transition-all
                  data-[state=on]:bg-[#006296] data-[state=on]:text-white data-[state=on]:border-[#006296] ${style}`}>
                  {label}
                </ToggleGroup.Item>
              ))}
            </ToggleGroup.Root>
          </div>
        </Card>

        {/* Slider */}
        <Card title="Slider" description="Range input with draggable thumb.">
          <div className="flex flex-col gap-6 py-2">
            <Slider.Root defaultValue={[40]} min={0} max={100} className="relative flex items-center w-full h-5">
              <Slider.Track className="relative w-full h-1.5 bg-[#e8eaed] rounded-full">
                <Slider.Range className="absolute h-full bg-[#006296] rounded-full" />
              </Slider.Track>
              <Slider.Thumb index={0} className="size-5 rounded-full bg-white border-2 border-[#006296] shadow cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-[#84c6ea]" />
            </Slider.Root>
            <Slider.Root defaultValue={[20, 70]} min={0} max={100} className="relative flex items-center w-full h-5">
              <Slider.Track className="relative w-full h-1.5 bg-[#e8eaed] rounded-full">
                <Slider.Range className="absolute h-full bg-[#006296] rounded-full" />
              </Slider.Track>
              <Slider.Thumb index={0} className="size-5 rounded-full bg-white border-2 border-[#006296] shadow cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-[#84c6ea]" />
              <Slider.Thumb index={1} className="size-5 rounded-full bg-white border-2 border-[#006296] shadow cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-[#84c6ea]" />
            </Slider.Root>
          </div>
        </Card>

        {/* Rating Group */}
        <Card title="Rating Group" description="Star rating selector.">
          <div className="flex flex-col gap-3">
            <RatingGroup.Root count={5} defaultValue={3} className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <RatingGroup.Item key={i} index={i + 1}
                  className="text-2xl cursor-pointer text-[#e8eaed] data-[highlighted]:text-yellow-400 transition-colors">
                  ★
                </RatingGroup.Item>
              ))}
              <RatingGroup.HiddenInput />
            </RatingGroup.Root>
            <RatingGroup.Root count={5} defaultValue={4} allowHalf className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <RatingGroup.Item key={i} index={i + 1}
                  className="text-2xl cursor-pointer text-[#e8eaed] data-[highlighted]:text-yellow-400 transition-colors">
                  ★
                </RatingGroup.Item>
              ))}
              <RatingGroup.HiddenInput />
            </RatingGroup.Root>
          </div>
        </Card>

        {/* Progress */}
        <Card title="Progress" description="Linear and circular progress bars.">
          <div className="flex flex-col gap-5">
            {[30, 60, 90].map(v => (
              <Progress.Root key={v} value={v} max={100} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs text-[#9ca7b4]">
                  <Progress.Label>{v}% complete</Progress.Label>
                  <Progress.ValueText />
                </div>
                <Progress.Track className="h-2 bg-[#e8eaed] rounded-full overflow-hidden">
                  <Progress.Range className="h-full bg-[#006296] rounded-full transition-all" />
                </Progress.Track>
              </Progress.Root>
            ))}
            <div className="flex gap-6 mt-2">
              {[25, 60, 85].map(v => (
                <Progress.Root key={v} value={v} max={100} className="flex flex-col items-center gap-2"
                  style={{ '--size': '64px', '--thickness': '6px' }}>
                  <Progress.Circle>
                    <Progress.CircleTrack className="stroke-[#e8eaed]" />
                    <Progress.CircleRange className="stroke-[#006296]" />
                  </Progress.Circle>
                  <Progress.ValueText className="text-xs text-[#9ca7b4]" />
                </Progress.Root>
              ))}
            </div>
          </div>
        </Card>

        {/* Number Input */}
        <Card title="Number Input" description="Accessible numeric input with increment/decrement.">
          <div className="flex flex-col gap-3">
            {[
              { label: 'Quantity', min: 0, max: 99, defaultValue: '1' },
              { label: 'Price', min: 0, step: 0.01, defaultValue: '9.99' },
            ].map(({ label, ...props }) => (
              <NumberInput.Root key={label} {...props} className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#9ca7b4] uppercase tracking-widest">{label}</label>
                <NumberInput.Control className="flex border border-[#e8eaed] rounded-lg overflow-hidden w-36">
                  <NumberInput.DecrementTrigger className="px-3 py-2 text-[#9ca7b4] hover:bg-[#f4f6f8] hover:text-[#1b1c1e] transition-colors cursor-pointer text-lg leading-none">−</NumberInput.DecrementTrigger>
                  <NumberInput.Input className="flex-1 text-center text-sm text-[#1b1c1e] outline-none py-2 min-w-0" />
                  <NumberInput.IncrementTrigger className="px-3 py-2 text-[#9ca7b4] hover:bg-[#f4f6f8] hover:text-[#1b1c1e] transition-colors cursor-pointer text-lg leading-none">+</NumberInput.IncrementTrigger>
                </NumberInput.Control>
              </NumberInput.Root>
            ))}
          </div>
        </Card>

        {/* Pin Input */}
        <Card title="Pin Input" description="OTP / verification code input.">
          <div className="flex flex-col gap-4">
            <PinInput.Root>
              <PinInput.Label className="text-xs font-semibold text-[#9ca7b4] uppercase tracking-widest block mb-2">Verification Code</PinInput.Label>
              <PinInput.Control className="flex gap-2">
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <PinInput.Input key={i} index={i}
                    className="size-10 text-center border-2 border-[#e8eaed] rounded-lg text-sm font-semibold text-[#1b1c1e]
                    focus:outline-none focus:border-[#006296] focus:ring-2 focus:ring-[#84c6ea] transition-colors" />
                ))}
              </PinInput.Control>
              <PinInput.HiddenInput />
            </PinInput.Root>
          </div>
        </Card>

        {/* Tags Input */}
        <Card title="Tags Input" description="Add and remove tags inline.">
          <TagsInput.Root defaultValue={['React', 'Tailwind', 'Ark UI']}>
            <TagsInput.Label className="text-xs font-semibold text-[#9ca7b4] uppercase tracking-widest block mb-2">Skills</TagsInput.Label>
            <TagsInput.Control className="flex flex-wrap gap-2 p-2 border border-[#e8eaed] rounded-lg min-h-[44px]">
              <TagsInput.Context>
                {({ value }) => value.map((v, i) => (
                  <TagsInput.Item key={i} index={i} value={v} className="flex items-center gap-1 bg-[#e6f3fa] text-[#006296] px-2 py-0.5 rounded-full text-xs font-semibold">
                    <TagsInput.ItemText>{v}</TagsInput.ItemText>
                    <TagsInput.ItemDeleteTrigger className="text-[#006296] hover:text-[#003a5a] cursor-pointer ml-0.5">×</TagsInput.ItemDeleteTrigger>
                    <TagsInput.ItemInput className="hidden" />
                  </TagsInput.Item>
                ))}
              </TagsInput.Context>
              <TagsInput.Input
                placeholder="Add tag…"
                className="flex-1 min-w-[80px] text-sm text-[#1b1c1e] outline-none placeholder:text-[#b7bbc2] bg-transparent" />
            </TagsInput.Control>
            <TagsInput.HiddenInput />
          </TagsInput.Root>
        </Card>

        {/* Select */}
        <Card title="Select" description="Accessible dropdown selection.">
          <Select.Root collection={fruitCollection} className="flex flex-col gap-1 w-56">
            <Select.Label className="text-xs font-semibold text-[#9ca7b4] uppercase tracking-widest">Favourite Fruit</Select.Label>
            <Select.Control>
              <Select.Trigger className="flex items-center justify-between w-full px-3 py-2 border border-[#e8eaed] rounded-lg text-sm text-[#1b1c1e] bg-white cursor-pointer hover:border-[#006296] transition-colors">
                <Select.ValueText placeholder="Select a fruit…" />
                <Select.Indicator className="text-[#9ca7b4]">▾</Select.Indicator>
              </Select.Trigger>
            </Select.Control>
            <Select.Positioner>
              <Select.Content className="bg-white border border-[#e8eaed] rounded-lg shadow-lg py-1 z-50 min-w-[160px]">
                {fruitCollection.items.map(item => (
                  <Select.Item key={item.value} item={item}
                    className="flex items-center justify-between px-3 py-2 text-sm text-[#1b1c1e] cursor-pointer hover:bg-[#f4f6f8] data-[highlighted]:bg-[#f4f6f8]">
                    <Select.ItemText>{item.label}</Select.ItemText>
                    <Select.ItemIndicator className="text-[#006296] text-xs">✓</Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
            <Select.HiddenSelect />
          </Select.Root>
        </Card>

        {/* Collapsible */}
        <Card title="Collapsible" description="Show/hide a block of content.">
          <Collapsible.Root>
            <Collapsible.Trigger className={`${secondary} w-full justify-between`}>
              <span>Show advanced options</span>
              <span className="text-xs">▾</span>
            </Collapsible.Trigger>
            <Collapsible.Content className="mt-3 p-4 bg-[#f4f6f8] rounded-lg text-sm text-[#9ca7b4]">
              Advanced options would appear here. This content is hidden by default and revealed on trigger click.
            </Collapsible.Content>
          </Collapsible.Root>
        </Card>

        {/* Tooltip */}
        <Card title="Tooltip" description="Contextual hints on hover/focus.">
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Hover me', tip: 'This is a helpful tooltip!' },
              { label: 'Save', tip: 'Save your changes (Ctrl+S)' },
              { label: 'Delete', tip: 'Permanently delete this item' },
            ].map(({ label, tip }) => (
              <Tooltip.Root key={label} openDelay={200} closeDelay={100}>
                <Tooltip.Trigger className={primary}>{label}</Tooltip.Trigger>
                <Tooltip.Positioner>
                  <Tooltip.Content className="bg-[#1b1c1e] text-white text-xs px-2.5 py-1.5 rounded-md shadow-lg max-w-xs z-50">
                    {tip}
                  </Tooltip.Content>
                </Tooltip.Positioner>
              </Tooltip.Root>
            ))}
          </div>
        </Card>

        {/* Popover */}
        <Card title="Popover" description="Floating panel anchored to a trigger.">
          <Popover.Root>
            <Popover.Trigger className={secondary}>Open Popover</Popover.Trigger>
            <Popover.Positioner>
              <Popover.Content className="bg-white border border-[#e8eaed] rounded-xl shadow-xl p-4 w-64 z-50">
                <Popover.Title className="text-sm font-bold text-[#1b1c1e] mb-1">Popover Title</Popover.Title>
                <Popover.Description className="text-xs text-[#9ca7b4] mb-3">
                  This is a popover. It can contain any content — forms, menus, details.
                </Popover.Description>
                <Popover.CloseTrigger className={`${primary} text-xs py-1.5 px-3`}>Dismiss</Popover.CloseTrigger>
              </Popover.Content>
            </Popover.Positioner>
          </Popover.Root>
        </Card>

        {/* Menu */}
        <Card title="Menu" description="Contextual dropdown action list.">
          <Menu.Root>
            <Menu.Trigger className={secondary}>Options ▾</Menu.Trigger>
            <Menu.Positioner>
              <Menu.Content className="bg-white border border-[#e8eaed] rounded-xl shadow-xl py-1.5 min-w-[180px] z-50">
                {[
                  { value: 'edit', label: '✏️  Edit' },
                  { value: 'duplicate', label: '⧉  Duplicate' },
                  { value: 'share', label: '↗  Share' },
                  { value: 'archive', label: '📦  Archive' },
                ].map(item => (
                  <Menu.Item key={item.value} value={item.value}
                    className="px-4 py-2 text-sm text-[#1b1c1e] cursor-pointer hover:bg-[#f4f6f8] data-[highlighted]:bg-[#f4f6f8]">
                    {item.label}
                  </Menu.Item>
                ))}
                <div className="border-t border-[#f0f2f4] mt-1 pt-1">
                  <Menu.Item value="delete" className="px-4 py-2 text-sm text-red-500 cursor-pointer hover:bg-red-50 data-[highlighted]:bg-red-50">
                    🗑  Delete
                  </Menu.Item>
                </div>
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        </Card>

        {/* Pagination */}
        <Card title="Pagination" description="Navigate between pages of content.">
          <Pagination.Root count={100} pageSize={10} defaultPage={3}>
            <Pagination.Context>
              {({ pages }) => (
                <div className="flex items-center gap-1 flex-wrap">
                  <Pagination.PrevTrigger className="px-3 py-1.5 rounded-lg border border-[#e8eaed] text-sm text-[#9ca7b4] hover:bg-[#f4f6f8] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    ‹
                  </Pagination.PrevTrigger>
                  {pages.map((page, i) =>
                    page.type === 'page' ? (
                      <Pagination.Item key={i} {...page}
                        className="size-9 rounded-lg border border-[#e8eaed] text-sm text-[#9ca7b4] hover:bg-[#f4f6f8] cursor-pointer
                        data-[selected]:bg-[#006296] data-[selected]:text-white data-[selected]:border-[#006296] transition-colors flex items-center justify-center">
                        {page.value}
                      </Pagination.Item>
                    ) : (
                      <Pagination.Ellipsis key={i} index={i} className="size-9 flex items-center justify-center text-[#9ca7b4] text-sm">
                        …
                      </Pagination.Ellipsis>
                    )
                  )}
                  <Pagination.NextTrigger className="px-3 py-1.5 rounded-lg border border-[#e8eaed] text-sm text-[#9ca7b4] hover:bg-[#f4f6f8] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    ›
                  </Pagination.NextTrigger>
                </div>
              )}
            </Pagination.Context>
          </Pagination.Root>
        </Card>

        {/* Steps */}
        <Card title="Steps" description="Multi-step wizard / onboarding flow." className="lg:col-span-2">
          <Steps.Root count={stepsItems.length} step={step} onStepChange={({ step }) => setStep(step)} className="w-full">
            <Steps.List className="flex items-start gap-0 mb-6 overflow-x-auto pb-2">
              {stepsItems.map((item, i) => (
                <Steps.Item key={i} index={i} className="flex items-center flex-1 min-w-0">
                  <div className="flex flex-col items-center gap-1 min-w-fit">
                    <Steps.Trigger className="flex flex-col items-center gap-1 cursor-pointer group" asChild>
                      <button>
                        <Steps.Indicator className="size-9 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-colors
                          group-data-[complete]:bg-[#006296] group-data-[complete]:border-[#006296] group-data-[complete]:text-white
                          group-data-[current]:border-[#006296] group-data-[current]:text-[#006296]
                          border-[#b7bbc2] text-[#9ca7b4]">
                          <span className="group-data-[complete]:hidden">{i + 1}</span>
                          <span className="hidden group-data-[complete]:inline">✓</span>
                        </Steps.Indicator>
                        <span className="text-xs font-semibold text-[#1b1c1e] whitespace-nowrap">{item.title}</span>
                        <span className="text-[10px] text-[#9ca7b4] whitespace-nowrap hidden sm:block">{item.description}</span>
                      </button>
                    </Steps.Trigger>
                  </div>
                  {i < stepsItems.length - 1 && (
                    <Steps.Separator className="flex-1 h-0.5 bg-[#e8eaed] mx-2 mt-[-18px] data-[complete]:bg-[#006296] transition-colors" />
                  )}
                </Steps.Item>
              ))}
            </Steps.List>

            {stepsItems.map((item, i) => (
              <Steps.Content key={i} index={i} className="p-4 bg-[#f4f6f8] rounded-lg text-sm text-[#9ca7b4]">
                Step {i + 1}: {item.description}
              </Steps.Content>
            ))}

            <Steps.CompletedContent className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-semibold">
              ✓ All steps completed!
            </Steps.CompletedContent>

            <div className="flex gap-3 mt-4">
              <Steps.PrevTrigger className={`${secondary} disabled:opacity-40 disabled:cursor-not-allowed`}>Back</Steps.PrevTrigger>
              <Steps.NextTrigger className={`${primary} disabled:opacity-40 disabled:cursor-not-allowed`}>
                {step >= stepsItems.length - 1 ? 'Finish' : 'Next'}
              </Steps.NextTrigger>
            </div>
          </Steps.Root>
        </Card>

        {/* Dialog */}
        <Card title="Dialog & Drawer" description="Overlay panels — click to open.">
          <Row label="Dialog">
            <Dialog.Root>
              <Dialog.Trigger className={primary}>Open Dialog</Dialog.Trigger>
              <Dialog.Backdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
              <Dialog.Positioner className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <Dialog.Content className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
                  <Dialog.Title className="text-lg font-bold text-[#1b1c1e] mb-1">Confirm Action</Dialog.Title>
                  <Dialog.Description className="text-sm text-[#9ca7b4] mb-5">
                    Are you sure you want to proceed? This action cannot be undone.
                  </Dialog.Description>
                  <div className="flex gap-3 justify-end">
                    <Dialog.CloseTrigger className={ghost}>Cancel</Dialog.CloseTrigger>
                    <Dialog.CloseTrigger className={primary}>Confirm</Dialog.CloseTrigger>
                  </div>
                </Dialog.Content>
              </Dialog.Positioner>
            </Dialog.Root>
          </Row>
          <Row label="Drawer">
            <Drawer.Root>
              <Drawer.Trigger className={secondary}>Open Drawer</Drawer.Trigger>
              <Drawer.Backdrop className="fixed inset-0 bg-black/50 z-40" />
              <Drawer.Positioner className="fixed inset-y-0 right-0 z-50">
                <Drawer.Content className="bg-white h-full w-[80vw] sm:w-80 p-6 shadow-2xl flex flex-col">
                  <Drawer.Title className="text-lg font-bold text-[#1b1c1e] mb-1">Side Drawer</Drawer.Title>
                  <p className="text-sm text-[#9ca7b4] mb-5">
                    This drawer slides in from the right. Use it for navigation, filters, or detail views.
                  </p>
                  <div className="mt-auto">
                    <Drawer.CloseTrigger className={`${primary} w-full justify-center`}>Close</Drawer.CloseTrigger>
                  </div>
                </Drawer.Content>
              </Drawer.Positioner>
            </Drawer.Root>
          </Row>
        </Card>

      </div>
    </div>
  )
}
