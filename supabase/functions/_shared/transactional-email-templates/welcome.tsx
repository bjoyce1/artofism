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
  Link,
  Section,
} from 'npm:@react-email/components@0.0.22'

interface WelcomeEmailProps {
  name?: string
}

export const WelcomeEmail = ({ name = 'Reader' }: WelcomeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to The Art of ISM — your journey begins now</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>THE ART OF ISM</Text>
        <Hr style={divider} />
        <Heading style={h1}>Welcome, {name}</Heading>
        <Text style={text}>
          Thank you for joining The Art of ISM. You now have access to a
          transformative reading experience crafted by Mr. CAP.
        </Text>
        <Text style={text}>
          Dive into the chapters, explore the Codes, and let each page
          shift your perspective.
        </Text>
        <Section style={ctaSection}>
          <Link href="https://artofism.lovable.app/library" style={button}>
            Start Reading
          </Link>
        </Section>
        <Text style={footer}>
          If you have any questions, simply reply to this email. We're here to help.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default WelcomeEmail

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
  margin: '0 0 20px',
  textAlign: 'center' as const,
}
const ctaSection = {
  textAlign: 'center' as const,
  margin: '30px 0',
}
const button = {
  backgroundColor: '#7A000C',
  color: '#F5E7C6',
  padding: '14px 32px',
  borderRadius: '6px',
  fontFamily: "'Inter', Arial, sans-serif",
  fontSize: '14px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
  display: 'inline-block',
}
const footer = {
  fontSize: '12px',
  fontFamily: "'Inter', Arial, sans-serif",
  color: '#999999',
  margin: '30px 0 0',
  textAlign: 'center' as const,
}
