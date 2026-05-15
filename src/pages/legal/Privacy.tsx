import privacyMd from '../../../docs/legal/privacy-policy.md?raw'
import LegalLayout from './LegalLayout'

const Privacy = () => (
  <LegalLayout
    eyebrow="LEGAL"
    title="Privacy Policy"
    source={privacyMd}
  />
)

export default Privacy
