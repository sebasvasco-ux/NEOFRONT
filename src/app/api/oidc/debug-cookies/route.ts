import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const raw = req.headers.get('cookie') || ''
  return NextResponse.json({ raw })
}