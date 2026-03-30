import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined'
import { t } from '../../i18n/en'

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('nav.analytics')}</h1>

      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center">
            <BarChartOutlinedIcon style={{ fontSize: 40, color: '#d97706' }} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
            <ConstructionOutlinedIcon style={{ fontSize: 16, color: '#d97706' }} />
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-800 mb-2">Under Construction</h2>
        <p className="text-sm text-gray-500 max-w-sm">
          The analytics dashboard is being built and will be available in a future release.
        </p>
      </div>
    </div>
  )
}
