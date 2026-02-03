import crypto from 'crypto'
import { type NextRequest, NextResponse } from 'next/server'
import { syncAllCollections } from '@/lib/sanity/sync'

const SYNC_API_SECRET = process.env.SYNC_API_SECRET

export async function POST(request: NextRequest) {
  const auth = request.headers.get('authorization')
  const provided = auth?.startsWith('Bearer ') ? auth.slice(7) : ''

  if (
    !SYNC_API_SECRET ||
    !provided ||
    !crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(SYNC_API_SECRET))
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await syncAllCollections()
    return NextResponse.json({
      ok: true,
      created: result.created,
      updated: result.updated,
      deleted: result.deleted,
    })
  } catch (error) {
    console.error('Collection sync failed:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
