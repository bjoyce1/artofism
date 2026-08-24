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

import type { TemplateEntry } from './registry.ts'

interface AnnouncementEmailProps {
  title?: string
  body?: string
  linkLabel?: string
  linkUrl?: string
}

const AnnouncementEmail = ({
  title = 'An update from The Art of ISM',
  body = '',
  linkLabel,
  linkUrl,
}: AnnouncementEmailProps) => {
  const paragraphs = String(body || '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>THE ART OF ISM</Text>
          <Hr style={divider} />
          <Heading style={h1}>{title}</Heading>
          {paragraphs.length > 0 ? (
            paragraphs.map((p, i) => (
              <Text key={i} style={text}>
                {p}
              </Text>
            ))
          ) : (
            <Text style={text}>Open the site to see what's new.</Text>
          )}
          {linkUrl ? (
            <Section style={ctaSection}>
              <Link href={linkUrl} style={button}>
                {linkLabel || 'Open'}
              </Link>
            </Section>
          ) : null}
          <Text style={footer}>
            You asked for this update from inside The Art of ISM. Reply to this
            email if you need anything.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: AnnouncementEmail,
  subject: (data: { title?: string }) =>
    data?.title ? `${data.title} — The Art of ISM` : 'An update from The Art of ISM',
  displayName: 'Announcement',
  previewData: {
    title: 'Chapter narration is live',
    body:
      'Every chapter now has full narration by Mr. CAP.\n\nOpen your library to listen while you read.',
    linkLabel: 'Open the library',
    linkUrl: 'https://theartofism.com/library',
  },
} satisfies TemplateEntry

export default AnnouncementEmail

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
const ctaSection = { textAlign: 'center' as const, margin: '30px 0' }
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
