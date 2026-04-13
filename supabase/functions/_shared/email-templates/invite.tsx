/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ siteName, siteUrl, confirmationUrl }: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to The Art of ISM</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>THE ART OF ISM</Text>
        <Hr style={divider} />
        <Heading style={h1}>You've Been Invited</Heading>
        <Text style={text}>
          You've been invited to join{' '}
          <Link href={siteUrl} style={link}><strong>The Art of ISM</strong></Link>
          . Click below to accept and create your account.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Accept Invitation
        </Button>
        <Text style={footer}>
          If you weren't expecting this invitation, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Playfair Display', Georgia, serif" }
const container = { padding: '40px 30px', maxWidth: '480px', margin: '0 auto' }
const brand = { fontSize: '11px', fontFamily: "'Inter', Arial, sans-serif", letterSpacing: '0.4em', textTransform: 'uppercase' as const, color: '#D4AF37', textAlign: 'center' as const, margin: '0 0 16px' }
const divider = { borderColor: '#D4AF37', margin: '0 0 30px', opacity: 0.4 }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#050505', margin: '0 0 20px', textAlign: 'center' as const }
const text = { fontSize: '15px', fontFamily: "'Lora', Georgia, serif", color: '#333333', lineHeight: '1.6', margin: '0 0 20px', textAlign: 'center' as const }
const link = { color: '#D4AF37', textDecoration: 'underline' }
const button = { backgroundColor: '#7A000C', color: '#F5E7C6', fontSize: '14px', fontFamily: "'Inter', Arial, sans-serif", fontWeight: 'bold' as const, borderRadius: '6px', padding: '14px 32px', textDecoration: 'none', display: 'block' as const, textAlign: 'center' as const }
const footer = { fontSize: '12px', fontFamily: "'Inter', Arial, sans-serif", color: '#999999', margin: '30px 0 0', textAlign: 'center' as const }
