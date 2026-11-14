import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'preparado',
    updated: null,
    source: null,
    provisional: { seats: [], constituencies: {} },
    definitive: { seats: [], constituencies: {} },
    turnout: {},
    comparison2023: {},
    changes: [],
    message: 'El modo directo se activará cuando exista una fuente oficial de escrutinio.'
  });
}
