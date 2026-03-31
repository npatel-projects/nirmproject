import { Select } from '@ark-ui/react/select'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'

/**
 * Reusable Ark UI Select wrapper for filter dropdowns.
 * Props:
 *   collection  — createListCollection({ items: [{ label, value }] })
 *   value       — currently selected value string
 *   onChange    — (value: string) => void
 *   placeholder — label shown when no value selected
 */
export default function FilterSelect({ collection, value, onChange, placeholder }) {
  const selectedLabel = collection.items.find((i) => i.value === value)?.label ?? placeholder

  return (
    <Select.Root
      collection={collection}
      value={[value]}
      onValueChange={({ value: vals }) => { if (vals[0] !== undefined) onChange(vals[0]) }}
    >
      <Select.Control>
        <Select.Trigger className="flex items-center justify-between gap-2 px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-pointer hover:border-gray-400 focus:outline-none min-w-40">
          <Select.ValueText className="text-gray-700 truncate">{selectedLabel}</Select.ValueText>
          <ArrowDropDownIcon fontSize="small" className="text-gray-400 shrink-0" />
        </Select.Trigger>
      </Select.Control>
      <Select.Positioner>
        <Select.Content className="bg-white border border-gray-200 rounded shadow-lg z-50 py-1 min-w-40">
          {collection.items.map((item) => (
            <Select.Item
              key={item.value}
              item={item}
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 data-[highlighted]:bg-gray-50 outline-none"
            >
              <Select.ItemText>{item.label}</Select.ItemText>
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Positioner>
    </Select.Root>
  )
}
