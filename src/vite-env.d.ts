/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string
  readonly VITE_FORMSPREE_ID?: string
  readonly VITE_CONTACT_EMAIL?: string
  // Add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Raw markdown imports (used for legal pages — single source of truth in docs/legal/)
declare module '*.md?raw' {
  const content: string
  export default content
}
