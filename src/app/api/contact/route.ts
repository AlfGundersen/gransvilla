import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS = 5 // Max 5 submissions per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return false
  }

  if (record.count >= MAX_REQUESTS) {
    return true
  }

  record.count++
  return false
}

// Email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Check for spam patterns in text
function hasSpamPatterns(text: string): boolean {
  const spamPatterns = [
    /\[url=/i,
    /\[link=/i,
    /<a\s+href=/i,
    /http[s]?:\/\/.*\.(ru|cn|tk|ml|ga|cf)\//i,
    /viagra|cialis|casino|lottery|winner|congratulations.*won/i,
    /click here|buy now|limited time|act now/i,
  ]
  return spamPatterns.some((pattern) => pattern.test(text))
}

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown'

    // Check rate limit
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'For mange forespørsler. Vennligst vent litt før du prøver igjen.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { firstName, lastName, email, phone, message, _time } = body

    // Validate required fields
    if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: 'Vennligst fyll ut alle obligatoriske felt.' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Vennligst oppgi en gyldig e-postadresse.' },
        { status: 400 }
      )
    }

    // Anti-spam: Check if form was submitted too quickly (less than 3 seconds)
    if (_time && _time < 3000) {
      // Log potential bot but return success to not reveal detection
      console.log('Potential bot detected: Form submitted too quickly', { ip, _time })
      return NextResponse.json({ success: true })
    }

    // Anti-spam: Check for spam patterns in message
    const fullContent = `${firstName} ${lastName} ${email} ${phone || ''} ${message || ''}`
    if (hasSpamPatterns(fullContent)) {
      console.log('Potential spam detected', { ip, email })
      return NextResponse.json({ success: true }) // Silent fail for spam
    }

    // Anti-spam: Check for excessively long content
    if (firstName.length > 100 || lastName.length > 100 || message?.length > 5000) {
      return NextResponse.json(
        { error: 'Innholdet er for langt.' },
        { status: 400 }
      )
    }

    // Send email using Mailjet (reusing existing configuration)
    const mailjetApiKey = process.env.MAILJET_API_KEY
    const mailjetSecretKey = process.env.MAILJET_SECRET_KEY
    const recipientEmail = process.env.CONTACT_FORM_EMAIL || 'janne@gransvilla.no'
    const senderEmail = process.env.CONTACT_FORM_SENDER || 'kontakt@gransvilla.no'

    if (!mailjetApiKey || !mailjetSecretKey) {
      console.error('Mailjet credentials not configured')
      return NextResponse.json(
        { error: 'E-posttjenesten er ikke konfigurert.' },
        { status: 500 }
      )
    }

    const emailData = {
      Messages: [
        {
          From: {
            Email: senderEmail,
            Name: 'Grans Villa Kontaktskjema',
          },
          To: [
            {
              Email: recipientEmail,
              Name: 'Grans Villa',
            },
          ],
          ReplyTo: {
            Email: email,
            Name: `${firstName} ${lastName}`,
          },
          Subject: `Ny henvendelse fra kontaktskjemaet på Gransvilla.no`,
          TextPart: `
Ny henvendelse fra kontaktskjemaet på gransvilla.no

Navn: ${firstName} ${lastName}
E-post: ${email}
Telefon: ${phone || 'Ikke oppgitt'}

Melding:
${message || 'Ingen melding'}
          `.trim(),
          HTMLPart: `
<h2>Ny henvendelse fra kontaktskjemaet</h2>
<p><strong>Navn:</strong> ${firstName} ${lastName}</p>
<p><strong>E-post:</strong> <a href="mailto:${email}">${email}</a></p>
<p><strong>Telefon:</strong> ${phone || 'Ikke oppgitt'}</p>
<h3>Melding:</h3>
<p>${message ? message.replace(/\n/g, '<br>') : 'Ingen melding'}</p>
          `.trim(),
        },
      ],
    }

    const mailjetResponse = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${mailjetApiKey}:${mailjetSecretKey}`).toString('base64')}`,
      },
      body: JSON.stringify(emailData),
    })

    if (!mailjetResponse.ok) {
      const errorData = await mailjetResponse.json()
      console.error('Mailjet error:', errorData)
      return NextResponse.json(
        { error: 'Kunne ikke sende meldingen. Vennligst prøv igjen.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Noe gikk galt. Vennligst prøv igjen.' },
      { status: 500 }
    )
  }
}
