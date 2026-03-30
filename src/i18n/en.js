/**
 * English UI strings — single source of truth for all labels, headings,
 * descriptions, and static text shown in the portal.
 *
 * Usage:
 *   import { t } from '../i18n/en'
 *   t('contacts.title')          → "Contacts"
 *   t('contacts.phone')          → "Phone"
 */

const strings = {
  // ─── Common ──────────────────────────────────────────────────────────────
  'common.loading':           'Loading…',
  'common.error':             'An error occurred. Please try again.',
  'common.noData':            'No data found.',
  'common.back':              'Back',
  'common.save':              'Save',
  'common.cancel':            'Cancel',
  'common.submit':            'Submit',
  'common.edit':              'Edit',
  'common.delete':            'Delete',
  'common.view':              'View',
  'common.download':          'Download',
  'common.print':             'Print',
  'common.search':            'Search',
  'common.filter':            'Filter',
  'common.status':            'Status',
  'common.date':              'Date',
  'common.name':              'Name',
  'common.email':             'Email',
  'common.phone':             'Phone',
  'common.fax':               'Fax',
  'common.tollFree':          'Toll Free',
  'common.extension':         'ext.',
  'common.website':           'Website',
  'common.address':           'Address',
  'common.yes':               'Yes',
  'common.no':                'No',
  'common.na':                '—',
  'common.required':          'Required',
  'common.optional':          'Optional',

  // ─── Navigation ───────────────────────────────────────────────────────────
  'nav.contracts':            'Group Policy Contracts',
  'nav.contracts.sub.contracts': 'Contracts',
  'nav.contracts.sub.plans':  'Plans',
  'nav.members':              'Members',
  'nav.myBenefits':           'My Benefits',
  'nav.claims':               'Claims',
  'nav.requests':             'Change Requests',
  'nav.myCard':               'My Card',
  'nav.analytics':            'Analytics',
  'analytics.title':          'Analytics',
  'analytics.underConstruction': 'Under Construction',
  'analytics.comingSoon':     'The analytics dashboard is being built and will be available in a future release.',
  'nav.contacts':             'Contacts',

  // ─── Auth ────────────────────────────────────────────────────────────────
  'auth.signIn':              'Sign In',
  'auth.signingIn':           'Signing in…',
  'auth.email':               'Email',
  'auth.password':            'Password',
  'auth.invalidCredentials':  'Invalid email or password.',
  'auth.portalName':          'Group Benefits Portal',
  'auth.copyright':           '© {year} ABC Insurance. All rights reserved.',

  // ─── Contacts page ────────────────────────────────────────────────────────
  'contacts.title':           'Contacts',
  'contacts.intro':           'Below is the list of contacts and services available to you.',
  'contacts.websiteNote':     'You will find all claim forms and additional resources on our website:',
  'contacts.sponsorSection':  'Plan Administrator Contacts',
  'contacts.memberSection':   'Member Services Contacts',
  'contacts.emergencySection':'Emergency & After-Hours',
  'contacts.role.supportRep': 'ABC Insurance Support Representative',
  'contacts.role.claimsTeam': 'Claims Department',
  'contacts.role.memberSvc':  'Member Services',
  'contacts.role.planAdmin':  'Plan Administrator',
  'contacts.role.dental':     'Dental Inquiries',
  'contacts.role.drug':       'Prescription Drug (PBM)',
  'contacts.role.disability': 'Disability Management',
  'contacts.role.travel':     'Emergency Travel Assistance',
  'contacts.hours':           'Hours of Operation',
  'contacts.hours.value':     'Monday – Friday, 8:00 AM – 5:00 PM ET',
  'contacts.emergency.note':  'For emergency travel assistance, contact Global Excel Management.',

  // ─── Contracts page ───────────────────────────────────────────────────────
  'contracts.title':          'Group Policy Contracts',
  'contracts.subtitle':       '{count} active {contract}',
  'contracts.noContracts':    'No active contracts found.',
  'contracts.meta.effective': 'Effective',
  'contracts.meta.renewal':   'Renewal',
  'contracts.detail.title':   'Policy Information',
  'contracts.detail.plans':   'Plans',
  'contracts.detail.number':  'Group Policy Number',
  'contracts.detail.effective':'Contract Effective Date',
  'contracts.detail.renewal': 'Renewal Date',
  'contracts.detail.funding': 'Funding Type',
  'contracts.detail.status':  'Status',
  'contracts.detail.country': 'Country',
  'contracts.detail.termination': 'Termination Date',
  'contracts.back':           'Back to Group Policy Contracts',

  // ─── Members page ─────────────────────────────────────────────────────────
  'members.title':            'Members',
  'members.back':             'Back to Members',
  'members.addMember':        'Add Member',
  'members.search':           'Search members…',
  'members.noMembers':        'No members found.',
  'members.col.name':         'Name',
  'members.col.memberNumber': 'Member #',
  'members.col.plan':         'Plan',
  'members.col.status':       'Status',
  'members.col.effective':    'Effective Date',

  // ─── Claims page ─────────────────────────────────────────────────────────
  'claims.title':             'Claims',
  'claims.create':            'Create Claim',
  'claims.back':              'Back to Claims',
  'claims.tab.inProgress':    'In Progress',
  'claims.tab.completed':     'Completed',
  'claims.tab.estimates':     'Estimates',
  'claims.noClaims':          'No claims found.',
  'claims.col.claimNumber':   'Claim #',
  'claims.col.type':          'Type',
  'claims.col.date':          'Date',
  'claims.col.amount':        'Amount Claimed',
  'claims.col.status':        'Status',

  // ─── Change Requests page ─────────────────────────────────────────────────
  'requests.title':           'Change Request',
  'requests.new':             'New Request',
  'requests.back':            'Back to Requests',
  'requests.tab.inProgress':  'In Progress',
  'requests.tab.completed':   'Completed',
  'requests.noRequests':      'No requests found.',
  'requests.col.number':      'Request #',
  'requests.col.type':        'Type',
  'requests.col.member':      'Member',
  'requests.col.submitted':   'Submitted',
  'requests.col.status':      'Status',
  'requests.type.BENEFICIARY_CHANGE': 'Beneficiary Change',
  'requests.type.ADD_DEPENDENT':      'Add Dependent',
  'requests.type.REMOVE_DEPENDENT':   'Remove Dependent',
  'requests.type.LIFE_EVENT':         'Life Event',
  'requests.type.COVERAGE_CHANGE':    'Coverage Change',

  // ─── My Card page ─────────────────────────────────────────────────────────
  'myCard.title':             'My Benefits Card',
  'myCard.subtitle':          'Present these cards to your provider or pharmacist at time of service.',
  'myCard.mockNotice':        'Card data shown is for testing purposes only. Real carrier and PBM numbers will be populated once the third-party integration is complete.',
  'myCard.print':             'Print Card',
  'myCard.tab.dental':        'Dental',
  'myCard.tab.drug':          'Prescription Drug',
  'myCard.field.bin':         'BIN',
  'myCard.field.pcn':         'PCN',
  'myCard.field.group':       'Group',
  'myCard.field.id':          'ID',
  'myCard.field.member':      'Member',
  'myCard.field.groupNumber': 'Group #',
  'myCard.field.memberNumber':'Member #',
  'myCard.field.plan':        'Plan',
  'myCard.field.certificate': 'Certificate',
  'myCard.howTo.dental.title':'How to use your Dental card',
  'myCard.howTo.drug.title':  'How to use your Drug card',

  // ─── Enrollment ───────────────────────────────────────────────────────────
  'enrollment.back':          'Back to Employee',
  'enrollment.title':         'Enrollment',
  'enrollment.submit':        'Submit Enrollment',
  'enrollment.submitting':    'Submitting…',

  // ─── Plans ───────────────────────────────────────────────────────────────
  'plans.title':              'Plans',
  'plans.back':               'Back to Plans',
  'plans.viewMembers':        'View Members',
  'plans.noPlans':            'No plans found.',

  // ─── Messages ─────────────────────────────────────────────────────────────
  'messages.title':           'My Messages',
  'messages.subtitle':        'System-generated messages and notices related to your insurance policy.',
  'messages.back':            'Back to Message List',
  'messages.detailHeading':   'Details of the Message',
  'messages.noMessages':      'No messages found.',
  'messages.searchPolicy':    'Search by policy',
  'messages.viewArchived':    'View Archived Messages',

  // ─── Footer ───────────────────────────────────────────────────────────────
  'footer.copyright':         '© {year} ABC Insurance. All rights reserved.',
  'footer.privacy':           'Privacy Policy',
  'footer.terms':             'Terms of Use',
  'footer.accessibility':     'Accessibility',
}

/**
 * Translate a key, with optional variable interpolation.
 * t('auth.copyright', { year: 2026 }) → "© 2026 ABC Insurance. All rights reserved."
 */
export function t(key, vars = {}) {
  let str = strings[key] ?? key
  Object.entries(vars).forEach(([k, v]) => {
    str = str.replace(`{${k}}`, v)
  })
  return str
}

export default strings
