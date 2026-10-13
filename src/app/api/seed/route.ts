import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export async function POST(req: NextRequest) {
  try {
    await execPromise('node prisma/seed.js');
    return NextResponse.json({ success: true, message: 'Database reset to demo state successfully.' });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ success: false, error: 'Failed to reset demo data' }, { status: 500 });
  }
}
