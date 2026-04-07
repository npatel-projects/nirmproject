import { usePersona } from '../../context/PersonaContext'
import { t } from '../../i18n/en'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined'
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'

// ─── Mock contact data ────────────────────────────────────────────────────────
// Replace with DB or CMS data when available

const SPONSOR_CONTACTS = [
  {
    role:      t('contacts.role.supportRep'),
    name:      'Véronique Tarte',
    phone:     '819-478-1315',
    extension: '2432',
    tollFree:  '1-800-567-9988',
    fax:       '819-474-1990',
    email:     'veronique.tarte@abcinsurance.com',
  },
  {
    role:      t('contacts.role.claimsTeam'),
    name:      'Claims Department',
    phone:     '1-800-555-0101',
    fax:       '819-474-1991',
    email:     'claims@abcinsurance.com',
    hours:     'Monday – Friday, 8:00 AM – 5:00 PM ET',
  },
  {
    role:      t('contacts.role.disability'),
    name:      'Disability Management Team',
    phone:     '1-800-555-0102',
    email:     'disability@abcinsurance.com',
    hours:     'Monday – Friday, 8:00 AM – 5:00 PM ET',
  },
]

const MEMBER_CONTACTS = [
  {
    role:      t('contacts.role.memberSvc'),
    name:      'Member Services',
    phone:     '1-800-555-0100',
    email:     'members@abcinsurance.com',
    hours:     'Monday – Friday, 8:00 AM – 8:00 PM ET',
  },
  {
    role:      t('contacts.role.dental'),
    name:      'Dental Inquiries',
    phone:     '1-800-555-0103',
    email:     'dental@abcinsurance.com',
    hours:     'Monday – Friday, 8:00 AM – 5:00 PM ET',
  },
  {
    role:      t('contacts.role.drug'),
    name:      'Express Scripts Canada',
    phone:     '1-800-555-0199',
    website:   'www.expressscripts.ca',
    hours:     '24/7',
  },
  {
    role:      t('contacts.role.travel'),
    name:      'Global Excel Management',
    phone:     '1-800-511-4610',
    altPhone:  '1-519-514-0351',
    altPhoneLabel: 'From anywhere else (call collect)',
    website:   'www.globalexcel.com',
    hours:     '24/7',
    emergency: true,
  },
]

const WEBSITE_URL = 'http://abcinsurance.com/'

// ─── Contact info row ─────────────────────────────────────────────────────────
function ContactRow({ icon: Icon, label, value, href }) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <Icon style={{ fontSize: '1rem', color: '#9ca3af', marginTop: 2, flexShrink: 0 }} />
      <div className="flex items-baseline gap-2 flex-wrap text-sm">
        <span className="text-gray-500 shrink-0">{label}</span>
        {href ? (
          <a href={href} className="text-interactive hover:underline">{value}</a>
        ) : (
          <span className="text-gray-800">{value}</span>
        )}
      </div>
    </div>
  )
}

// ─── Single contact card ──────────────────────────────────────────────────────
function ContactCard({ contact }) {
  return (
    <div className={`bg-white border rounded-xl p-5 ${contact.emergency ? 'border-amber-200' : 'border-gray-200'}`}>
      {contact.emergency && (
        <div className="flex items-center gap-1.5 mb-3">
          <WarningAmberOutlinedIcon style={{ fontSize: '0.9rem', color: '#d97706' }} />
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Emergency / 24-7</span>
        </div>
      )}
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{contact.role}</p>
      <p className="text-sm font-semibold text-gray-900 mb-3">{contact.name}</p>

      <div className="space-y-0.5">
        {contact.phone && (
          <ContactRow
            icon={PhoneOutlinedIcon}
            label={t('common.phone')}
            value={contact.extension ? `${contact.phone}  ${t('common.extension')} ${contact.extension}` : contact.phone}
            href={`tel:${contact.phone}`}
          />
        )}
        {contact.altPhone && (
          <ContactRow
            icon={PhoneOutlinedIcon}
            label={contact.altPhoneLabel ?? t('common.phone')}
            value={contact.altPhone}
            href={`tel:${contact.altPhone}`}
          />
        )}
        {contact.tollFree && (
          <ContactRow
            icon={PhoneIphoneOutlinedIcon}
            label={t('common.tollFree')}
            value={contact.tollFree}
            href={`tel:${contact.tollFree}`}
          />
        )}
        {contact.fax && (
          <ContactRow
            icon={PrintOutlinedIcon}
            label={t('common.fax')}
            value={contact.fax}
          />
        )}
        {contact.email && (
          <ContactRow
            icon={EmailOutlinedIcon}
            label={t('common.email')}
            value={contact.email}
            href={`mailto:${contact.email}`}
          />
        )}
        {contact.website && (
          <ContactRow
            icon={LanguageOutlinedIcon}
            label={t('common.website')}
            value={contact.website}
            href={`https://${contact.website}`}
          />
        )}
        {contact.address && (
          <ContactRow
            icon={LocationOnOutlinedIcon}
            label={t('common.address')}
            value={contact.address}
          />
        )}
        {contact.hours && (
          <ContactRow
            icon={AccessTimeOutlinedIcon}
            label={t('contacts.hours')}
            value={contact.hours}
          />
        )}
      </div>
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────
function Section({ title, contacts }) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {contacts.map((c, i) => <ContactCard key={i} contact={c} />)}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ContactsPage() {
  const { personaKey } = usePersona()
  const isMember = personaKey === 'MEMBER'

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('contacts.title')}</h1>
      <p className="text-sm text-gray-500 mb-1">{t('contacts.intro')}</p>
      <p className="text-sm text-gray-500 mb-6">
        {t('contacts.websiteNote')}{' '}
        <a href={WEBSITE_URL} className="text-interactive hover:underline">{WEBSITE_URL}</a>
      </p>

      {/* Sponsor admins see all sections; members see member section first */}
      {!isMember && (
        <Section title={t('contacts.sponsorSection')} contacts={SPONSOR_CONTACTS} />
      )}

      <Section title={t('contacts.memberSection')} contacts={MEMBER_CONTACTS} />

      {isMember && (
        <Section title={t('contacts.sponsorSection')} contacts={SPONSOR_CONTACTS} />
      )}
    </div>
  )
}
