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

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email change for The Art of ISM</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>THE ART OF ISM</Text>
        <Hr style={divider} />
        <Heading style={h1}>Confirm Email Change</Heading>
        <Text style={text}>
          You requested to change your email from{' '}
          <Link href={`mailto:${email}`} style={link}>{email}</Link>{' '}
          to{' '}
          <Link href={`mailto:${newEmail}`} style={link}>{newEmail}</Link>.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Confirm Email Change
        </Button>
        <Text style={footer}>
          If you didn't request this change, please secure your account immediately.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Playfair Display', Georgia, serif" }
const container = { padding: '40px 30px', maxWidth: '480px', margin: '0 auto' }
const brand = {
  fontSize: '11px',
  fontFamily: "'Inter', Arial, sans-serif",
  letterSpacing: '0.4em',
  textTransform: 'uppercase' as const,
  color: '#D4AF37',
  textAlign: 'center' as const,
  margin: '0 0 16px',
}
const divider = { borderColor: '#D4AF37', margin: '0 0 30px', opacity: 0.4 }
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#050505',
  margin: '0 0 20px',
  textAlign: 'center' as const,
}
const text = {
  fontSize: '15px',
  fontFamily: "'Lora', Georgia, serif",
  color: '#333333',
  lineHeight: '1.6',
  margin: '0 0 28px',
  textAlign: 'center' as const,
}
const link = { color: '#D4AF37', textDecoration: 'underline' }
const button = {
  backgroundColor: '#D4AF37',
  color: '#050505',
  fontSize: '14px',
  fontFamily: "'Inter', Arial, sans-serif",
  fontWeight: '600' as const,
  borderRadius: '0.5rem',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'block' as const,
  textAlign: 'center' as const,
}
const footer = {
  fontSize: '12px',
  fontFamily: "'Inter', Arial, sans-serif",
  color: '#999999',
  margin: '30px 0 0',
  textAlign: 'center' as const,
}
