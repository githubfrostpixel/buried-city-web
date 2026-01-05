import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enTranslations from '../core/data/strings/en.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
      // Custom format function to support %s and %d placeholders
      format: (value, format) => {
        if (format === 'percent_s' || format === 'percent_d') {
          return value
        }
        return value
      }
    },
    // Support nested keys
    keySeparator: '.',
    // Support array access
    nsSeparator: false,
    returnObjects: true,
    returnEmptyString: true
  })

export default i18n

