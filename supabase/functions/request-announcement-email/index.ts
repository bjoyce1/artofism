import { createClient } from 'npm:@supabase/supabase-js@2'

// A signed-in reader taps "Email me the details" on an in-app announcement.
// This function verifies their session, loads the announcement server-side
// (so the client can't dictate content), and sends the announcement email to
// THAT reader's own address only. It never accepts a recipient from the client
// and never loops over multiple recipients — one action, one recipient.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !anonKey || !serviceKey) {
    console.error('Missing Supabase environment configuration')
    return json({ error: 'Server configuration error' }, 500)
  }

  const authHeader = req.headers.get('Authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) {
    return json({ error: 'Sign in to email yourself this update' }, 401)
  }

  const authed = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: userData, error: userError } = await authed.auth.getUser()
  const user = userData?.user
  if (userError || !user?.email) {
    return json({ error: 'Sign in to email yourself this update' }, 401)
  }

  let announcementId: unknown
  try {
    const body = await req.json()
    announcementId = body?.announcementId
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  if (typeof announcementId !== 'string' || !UUID_RE.test(announcementId)) {
    return json({ error: 'announcementId must be a valid id' }, 400)
  }

  const admin = createClient(supabaseUrl, serviceKey)

  const { data: announcement, error: annError } = await admin
    .from('announcements')
    .select('id, title, body, link_label, link_url, active')
    .eq('id', announcementId)
    .maybeSingle()

  if (annError) {
    console.error('Failed to load announcement', annError)
    return json({ error: 'Could not load this update' }, 500)
  }
  if (!announcement || !announcement.active) {
    return json({ error: 'This update is no longer available' }, 404)
  }

  const sendRes = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({
      templateName: 'announcement',
      recipientEmail: user.email,
      idempotencyKey: `announcement-${announcement.id}-${user.id}`,
      templateData: {
        title: announcement.title,
        body: announcement.body,
        linkLabel: announcement.link_label ?? undefined,
        linkUrl: announcement.link_url ?? undefined,
      },
    }),
  })

  if (!sendRes.ok) {
    const details = await sendRes.text()
    console.error(`send-transactional-email failed [${sendRes.status}]: ${details}`)
    return json({ error: 'Could not send the email right now', status: sendRes.status }, 502)
  }

  return json({ success: true })
})
