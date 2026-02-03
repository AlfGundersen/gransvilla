import { type NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

const MAILJET_API_KEY = process.env.MAILJET_API_KEY
const MAILJET_SECRET_KEY = process.env.MAILJET_SECRET_KEY
const MAILJET_LIST_ID = process.env.MAILJET_LIST_ID

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const limited = rateLimit(`newsletter:${ip}`, { limit: 5, windowMs: 60_000 })
  if (limited) return limited

  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'E-postadresse er påkrevd' }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Ugyldig e-postadresse' }, { status: 400 })
    }

    if (!MAILJET_API_KEY || !MAILJET_SECRET_KEY) {
      console.error('Mailjet API keys not configured')
      return NextResponse.json({ error: 'Nyhetsbrev er ikke konfigurert' }, { status: 500 })
    }

    // Add or update contact in Mailjet
    const credentials = Buffer.from(`${MAILJET_API_KEY}:${MAILJET_SECRET_KEY}`).toString('base64')

    // First, create/update the contact
    const contactResponse = await fetch('https://api.mailjet.com/v3/REST/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({
        IsExcludedFromCampaigns: false,
        Email: email,
      }),
    })

    // If contact already exists, that's fine (status 400 with specific error)
    if (!contactResponse.ok && contactResponse.status !== 400) {
      const errorData = await contactResponse.json().catch(() => ({}))
      console.error('Mailjet contact creation error:', errorData)
      return NextResponse.json(
        { error: 'Kunne ikke legge til e-post' },
        { status: 500 }
      )
    }

    // If a list ID is configured, add contact to the list
    if (MAILJET_LIST_ID) {
      const listResponse = await fetch(
        `https://api.mailjet.com/v3/REST/contactslist/${MAILJET_LIST_ID}/managecontact`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${credentials}`,
          },
          body: JSON.stringify({
            Email: email,
            Action: 'addnoforce',
          }),
        }
      )

      if (!listResponse.ok) {
        const errorData = await listResponse.json().catch(() => ({}))
        console.error('Mailjet list subscription error:', errorData)
        // Don't fail the whole request if list subscription fails
        // Contact was still created
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Noe gikk galt. Vennligst prøv igjen.' },
      { status: 500 }
    )
  }
}
