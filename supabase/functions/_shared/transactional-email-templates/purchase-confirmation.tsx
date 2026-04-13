/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Hr,
  Section,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface PurchaseConfirmationProps {
  name?: string
  amount?: string
  currency?: string
  orderId?: string
}

const PurchaseConfirmationEmail = ({
  name = 'Reader',
  amount = '9.99',
  currency = 'USD',
  orderId,
}: PurchaseConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your purchase of The Art of ISM is confirmed</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>THE ART OF ISM</Text>
        <Hr style={divider} />
        <Heading style={h1}>Purchase Confirmed</Heading>
        <Text style={text}>
          {name ? `Thank you, ${name}.` : 'Thank you.'} Your full access to
          The Art of ISM has been unlocked.
        </Text>
        <Section style={receiptBox}>
          <Text style={receiptLabel}>Product</Text>
          <Text style={receiptValue}>The Art of ISM — Full Access</Text>
          <Text style={receiptLabel}>Amount Paid</Text>
          <Text style={receiptValue}>{currency} {amount}</Text>
          {orderId && (
            <>
              <Text style={receiptLabel}>Order ID</Text>
              <Text style={receiptValue}>{orderId}</Text>
            </>
          )}
        </Section>
        <Button style={button} href="https://artofism.lovable.app/library">
          Start Reading
        </Button>
        <Text style={footer}>
          If you have any questions about your purchase, simply reply to this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PurchaseConfirmationEmail,
  subject: 'Your Art of ISM purchase is confirmed',
  displayName: 'Purchase Confirmation',
  previewData: {
    name: 'Reader',
    amount: '9.99',
    currency: 'USD',
    orderId: 'PAYPAL-12345',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Playfair Display', Georgia, serif" }
const container = { padding: '40px 30px', maxWidth: '480px', margin: '0 auto' }
const brand = { fontSize: '11px', fontFamily: "'Inter', Arial, sans-serif", letterSpacing: '0.4em', textTransform: 'uppercase' as const, color: '#D4AF37', textAlign: 'center' as const, margin: '0 0 16px' }
const divider = { borderColor: '#D4AF37', margin: '0 0 30px', opacity: 0.4 }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#050505', margin: '0 0 20px', textAlign: 'center' as const }
const text = { fontSize: '15px', fontFamily: "'Lora', Georgia, serif", color: '#333333', lineHeight: '1.6', margin: '0 0 20px', textAlign: 'center' as const }
const receiptBox = { backgroundColor: '#FDFAF3', border: '1px solid #D4AF37', borderRadius: '6px', padding: '20px', margin: '0 0 24px' }
const receiptLabel = { fontSize: '11px', fontFamily: "'Inter', Arial, sans-serif", color: '#999999', textTransform: 'uppercase' as const, letterSpacing: '0.1em', margin: '0 0 2px' }
const receiptValue = { fontSize: '15px', fontFamily: "'Lora', Georgia, serif", color: '#050505', margin: '0 0 14px', fontWeight: 'bold' as const }
const button = { backgroundColor: '#7A000C', color: '#F5E7C6', fontSize: '14px', fontFamily: "'Inter', Arial, sans-serif", fontWeight: 'bold' as const, borderRadius: '6px', padding: '14px 32px', textDecoration: 'none', display: 'block' as const, textAlign: 'center' as const }
const footer = { fontSize: '12px', fontFamily: "'Inter', Arial, sans-serif", color: '#999999', margin: '30px 0 0', textAlign: 'center' as const }
