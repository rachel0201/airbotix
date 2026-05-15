import complianceMd from '../../../docs/legal/compliance-statement.md?raw'
import LegalLayout from './LegalLayout'

const Compliance = () => (
  <LegalLayout
    eyebrow="COMPLIANCE"
    title="Compliance Statement"
    source={complianceMd}
  />
)

export default Compliance
