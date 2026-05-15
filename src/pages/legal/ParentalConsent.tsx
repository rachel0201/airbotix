import consentMd from '../../../docs/legal/parental-consent.md?raw'
import LegalLayout from './LegalLayout'

const ParentalConsent = () => (
  <LegalLayout
    eyebrow="LEGAL"
    title="Parental Consent"
    source={consentMd}
  />
)

export default ParentalConsent
