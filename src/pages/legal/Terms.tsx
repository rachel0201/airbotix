import termsMd from '../../../docs/legal/terms-of-service.md?raw'
import LegalLayout from './LegalLayout'

const Terms = () => (
  <LegalLayout
    eyebrow="LEGAL"
    title="Terms of Service"
    source={termsMd}
  />
)

export default Terms
