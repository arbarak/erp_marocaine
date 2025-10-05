import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import ICU from 'i18next-icu'

// Import translations
import common from './locales/fr/common.json'
import invoicing from './locales/fr/invoicing.json'
import inventory from './locales/fr/inventory.json'
import purchasing from './locales/fr/purchasing.json'
import sales from './locales/fr/sales.json'
import accounting from './locales/fr/accounting.json'
import reports from './locales/fr/reports.json'

const resources = {
  fr: {
    common,
    invoicing,
    inventory,
    purchasing,
    sales,
    accounting,
    reports,
  },
}

i18n
  .use(ICU)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr',
    fallbackLng: 'fr',
    supportedLngs: ['fr'],
    defaultNS: 'common',
    ns: ['common', 'invoicing', 'inventory', 'purchasing', 'sales', 'accounting', 'reports'],
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    
    react: {
      useSuspense: false,
    },
    
    // ICU configuration for number and currency formatting
    icu: {
      memoize: true,
      memoizeFallback: true,
    },
  })

export default i18n
