import { NextResponse } from 'next/server';
import { getMembers } from '@/lib/db';

export async function GET() {
  try {
    const members = await getMembers();
    return NextResponse.json({ success: true, data: members });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
