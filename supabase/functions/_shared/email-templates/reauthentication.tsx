/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code for The Art of ISM</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>THE ART OF ISM</Text>
        <Hr style={divider} />
        <Heading style={h1}>Verification Code</Heading>
        <Text style={text}>Use the code below to confirm your identity:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          This code will expire shortly. If you didn't request this, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

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
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#D4AF37',
  margin: '0 0 30px',
  textAlign: 'center' as const,
  letterSpacing: '0.2em',
}
const footer = {
  fontSize: '12px',
  fontFamily: "'Inter', Arial, sans-serif",
  color: '#999999',
  margin: '30px 0 0',
  textAlign: 'center' as const,
}
