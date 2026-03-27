import { colors } from '../theme'

const links = [
  { label: 'Terms of Use' },
  { label: 'Privacy Policy' },
  { label: 'Accessibility' },
  { label: 'Contact Support' },
]

export default function PortalFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-12 pt-6 border-t border-gray-200 text-center">
      <div className="flex items-center justify-center gap-1 flex-wrap mb-2">
        {links.map((link, i) => (
          <span key={link.label} className="flex items-center">
            <a
              href="#"
              className="text-xs hover:underline transition-colors px-2"
              style={{ color: colors.link }}
            >
              {link.label}
            </a>
            {i < links.length - 1 && (
              <span className="text-gray-300 text-xs">|</span>
            )}
          </span>
        ))}
      </div>
      <p className="text-xs text-gray-400 pb-6">
        © {year} – ABC Insurance Inc. All rights reserved.
      </p>
    </footer>
  )
}
