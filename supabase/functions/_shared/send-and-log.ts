import { createClient } from 'npm:@supabase/supabase-js@2'
import { sendTemplateEmail, type SendTemplateEmailResult } from './transactional-email-templates/send-email.ts'

type Admin = ReturnType<typeof createClient>

async function logRow(admin: Admin, row: Record<string, unknown>) {
  const { error } = await admin.from('email_send_log').insert(row)
  if (error) console.error('email_send_log insert failed', { code: error.code, message: error.message })
}

/** Sends a registered template and records the outcome in email_send_log. */
export async function sendTemplateEmailLogged(
  admin: Admin,
  templateName: string,
  to: string,
  options: { templateData?: Record<string, any>; idempotencyKey?: string },
): Promise<SendTemplateEmailResult> {
  const base = { message_id: null, template_name: templateName, recipient_email: to }
  try {
    const result = await sendTemplateEmail(templateName, to, options)
    await logRow(admin, { ...base, status: result.sent ? 'sent' : 'suppressed' })
    return result
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    await logRow(admin, { ...base, status: 'failed', error_message: msg.slice(0, 1000) })
    throw error
  }
}
