import { NextRequest, NextResponse } from 'next/server';
import { POAPService } from '@/services/poapService';


// export async function POST(request: NextRequest) {

//   try {
  
//      const apiKey = process.env.POAP_API_KEY!;

  
//     const body = await request.json();
  
//     if (!body.secret_codes || !body.addresses) {
//       return NextResponse.json(
//         { error: 'Missing required fields: slug, event_ids, secret_codes, addresses' },
//         { status: 400 }
//       );
//     }

//     if (body.addresses.length === 0) {
//       return NextResponse.json(
//         { error: 'At least one address is required' },
//         { status: 400 }
//       );
//     }

    
//     const poapService = new POAPService(apiKey);
//     const result = await poapService.createDelivery(body);
    
//     return NextResponse.json(result, { status: 200 });

//   } catch (error: any) {
//     console.error('Error in POAP delivery route:', error);

    
//     if (error.message?.includes('POAP API Error')) {
//       return NextResponse.json(
//         { 
//           error: 'POAP API Error',
//           details: error.message 
//         },
//         { status: 400 }
//       );
//     }

   
//     return NextResponse.json(
//       { 
//         error: 'Failed to create POAP delivery',
//         details: error.message || 'Unknown error'
//       },
//       { status: 500 }
//     );
//   }
// }

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}