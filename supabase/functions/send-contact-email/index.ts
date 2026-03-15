import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

interface ContactData {
  name: string
  email: string
  phone?: string
  message: string
  service: 'generelt' | 'booking' | 'sponsor'
}

const serviceEmails: Record<string, string> = {
  generelt: 'info@stoll.gg',
  booking: 'booking@stoll.gg',
  sponsor: 'info@stoll.gg',
}

const serviceNames: Record<string, string> = {
  generelt: 'Generell henvendelse',
  booking: 'Booking',
  sponsor: 'Sponsor',
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const data: ContactData = await req.json()
    const toEmail = serviceEmails[data.service] || 'info@stoll.gg'
    const serviceName = serviceNames[data.service] || data.service

    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) throw new Error('Missing RESEND_API_KEY')

    const emailHtml = `
      <h2>Ny henvendelse - ${serviceName}</h2>
      <p><strong>Navn:</strong> ${data.name}</p>
      <p><strong>E-post:</strong> ${data.email}</p>
      ${data.phone ? `<p><strong>Telefon:</strong> ${data.phone}</p>` : ''}
      <p><strong>Melding:</strong></p>
      <p>${data.message}</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        Sendt fra kontaktskjema på stoll.gg
      </p>
    `

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendKey}` },
      body: JSON.stringify({
        from: 'STOLL Esportsenter <noreply@stoll.gg>',
        to: toEmail,
        subject: `[STOLL] ${serviceName}: ${data.name}`,
        html: emailHtml,
        reply_to: data.email,
      }),
    })

    const result = await response.json()
    return new Response(JSON.stringify({ success: true, id: result.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})
