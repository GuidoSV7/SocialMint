import { NextRequest, NextResponse } from 'next/server';
import { POAPService } from '@/services/poapService';

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    
    const apiKey = "xck5dwyBGgx6AE4sng883ZDCVM2ddMqzIS2t6ube5TdmXESKNU0OROczq4Jj4RRKbtskjmqS4sKKSf3OWVq4HDKtYt2aGPYWGKyr22DUWrHzAMCK3SYaSPZW1tr25ikE";


 
    const { eventId } = params;
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }


    if (!/^\d+$/.test(eventId)) {
      return NextResponse.json(
        { error: 'Event ID must be a valid number' },
        { status: 400 }
      );
    }


    const poapService = new POAPService(apiKey);
    const eventInfo = await poapService.getEventInfo(eventId);
    
 
    return NextResponse.json(eventInfo, { status: 200 });

  } catch (error: any) {
    console.error('Error in POAP event info route:', error);

  
    if (error.message?.includes('POAP API Error')) {
      return NextResponse.json(
        { 
          error: 'POAP API Error',
          details: error.message 
        },
        { status: 400 }
      );
    }

  
    return NextResponse.json(
      { 
        error: 'Failed to get event info',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}


export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}