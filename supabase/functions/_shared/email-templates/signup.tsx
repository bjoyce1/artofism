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
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email for The Art of ISM</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>THE ART OF ISM</Text>
        <Hr style={divider} />
        <Heading style={h1}>Confirm Your Email</Heading>
        <Text style={text}>
          Welcome to The Art of ISM. Confirm your email address to begin your journey.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Verify Email
        </Button>
        <Text style={footer}>
          If you didn't create an account, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

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
