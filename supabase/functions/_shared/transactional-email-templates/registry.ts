/// <reference types="npm:@types/react@18.3.1" />

import type { ComponentType } from 'npm:react@18.3.1'
import { WelcomeEmail } from './welcome.tsx'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: any) => string)
  displayName?: string
  previewData?: Record<string, any>
  to?: string
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  welcome: {
    component: WelcomeEmail,
    subject: 'Welcome to The Art of ISM',
    displayName: 'Welcome Email',
    previewData: {
      name: 'Reader',
    },
  },
}
