import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContactForm {
  name: string
  email: string
  phone: string
  reg_number?: string
  service: 'verksted' | 'bilpleie' | 'bilsalg'
  message: string
}

const serviceEmails: Record<string, string> = {
  verksted: 'info@ddautocenter.no',
  bilpleie: 'bilpleie@ddautocenter.no',
  bilsalg: 'bilsalg@ddautocenter.no',
}

const serviceNames: Record<string, string> = {
  verksted: 'Bilverksted',
  bilpleie: 'Bilpleie',
  bilsalg: 'Bilsalg',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const data: ContactForm = await req.json()
    
    const toEmail = serviceEmails[data.service] || 'info@ddautocenter.no'
    const serviceName = serviceNames[data.service] || data.service

    const htmlBody = `
      <h2>Ny henvendelse fra DD Auto Center</h2>
      <p><strong>Tjeneste:</strong> ${serviceName}</p>
      <p><strong>Navn:</strong> ${data.name}</p>
      <p><strong>E-post:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
      <p><strong>Telefon:</strong> <a href="tel:${data.phone}">${data.phone}</a></p>
      ${data.reg_number ? `<p><strong>Reg.nr:</strong> ${data.reg_number}</p>` : ''}
      <hr>
      <p><strong>Melding:</strong></p>
      <p>${data.message.replace(/\n/g, '<br>')}</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        Sendt fra kontaktskjema på ddautocenter.no
      </p>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'DD Auto Center <noreply@ddautocenter.no>',
        to: [toEmail],
        reply_to: data.email,
        subject: `[${serviceName}] Henvendelse fra ${data.name}`,
        html: htmlBody,
      }),
    })

    const result = await res.json()

    if (!res.ok) {
      console.error('Resend error:', result)
      throw new Error(result.message || 'Failed to send email')
    }

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
