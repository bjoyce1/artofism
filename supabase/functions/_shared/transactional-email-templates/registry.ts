/// <reference types="npm:@types/react@18.3.1" />

import type { ComponentType } from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: any) => string)
  displayName?: string
  previewData?: Record<string, any>
  to?: string
}

import { WelcomeEmail } from './welcome.tsx'
import { template as purchaseConfirmation } from './purchase-confirmation.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  welcome: {
    component: WelcomeEmail,
    subject: 'Welcome to The Art of ISM',
    displayName: 'Welcome Email',
    previewData: {
      name: 'Reader',
    },
  },
  'purchase-confirmation': purchaseConfirmation,
}
