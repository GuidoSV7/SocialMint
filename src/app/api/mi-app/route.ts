import { NextRequest, NextResponse } from "next/server";
import { avalancheFuji } from "viem/chains";
import {
    createMetadata,
    Metadata,
    ValidatedMetadata,
    ExecutionResponse,
} from "@sherrylinks/sdk";
import { serialize } from "wagmi";
import { abi } from "@/blockchain/abi";
import { encodeFunctionData, TransactionSerializable, http, createPublicClient, parseAbi } from "viem";
import { checkHashtagsAndMentions } from "@/services/twitterService";

const CONTRACT_ADDRESS = "0xd293e159a133A75098a3D814E681d73B88a7167b";

const publicClient = createPublicClient({
    chain: avalancheFuji,
    transport: http('https://api.avax-test.network/ext/bc/C/rpc'),
});

// Headers CORS centralizados
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version",
};

export async function GET(req: NextRequest) {
    try {
        const host = req.headers.get("host") || "localhost:3000";
        const protocol = req.headers.get("x-forwarded-proto") || "http";
        const serverUrl = `${protocol}://${host}`;

        const metadata: Metadata = {
          url: "https://sherry.social",
          icon: "https://avatars.githubusercontent.com/u/117962315",
          title: "Social Mint",
          baseUrl: serverUrl,
          description: "Valida si tu post de X cumple con todos las condiciones necesarias para habilitarte el minteo de tu POAP!",
          actions: [
            {
              type: "dynamic",
              label: "Valida tu post de X",
              description: "Validar",
              chains: { source: "fuji" },
              path: `/api/mi-app`,
              params: [
                {
                  name: "eventCode",
                  label: "Código del evento",
                  type: "text",
                  required: true,
                  description: "Ingresa el código del evento",
                },
                {
                  name: "userHandler",
                  label: "elonmusk",
                  type: "text",
                  required: true,
                  description: "Ingresa tu usuario de Twitter (X)",
                },
              ],
            },
          ],
        };

        const validated: ValidatedMetadata = createMetadata(metadata);

        return NextResponse.json(validated, {
            headers: corsHeaders,
        });
    } catch (error) {
        console.error("Error creando metadata:", error);
        return NextResponse.json(
            { error: "Error al crear metadata" },
            { 
                status: 500,
                headers: corsHeaders,
            }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        // Parsear parámetros de query string para requests GET-style
        const url = new URL(req.url);
        const eventCodeFromQuery = url.searchParams.get('eventCode');
        const userHandlerFromQuery = url.searchParams.get('userHandler');
        
        let eventCode, userHandler;
        
        // Intentar obtener datos del body primero, luego de query params
        try {
            const body = await req.json();
            eventCode = body.eventCode || eventCodeFromQuery;
            userHandler = body.userHandler || userHandlerFromQuery;
        } catch {
            // Si no hay body JSON, usar query params
            eventCode = eventCodeFromQuery;
            userHandler = userHandlerFromQuery;
        }
        
        console.log('Received eventCode:', eventCode);
        console.log('Received userHandler:', userHandler);

        if (!eventCode || !userHandler) {
            return NextResponse.json(
                { error: "'eventCode' and 'userHandler' son requeridos" },
                { 
                    status: 400,
                    headers: corsHeaders,
                }
            );
        }

        // Leer datos del contrato
        const eventData = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: abi,
            functionName: "getEvent",
            args: [eventCode.toLowerCase()],
        });

        const { tags } = parseEventData(eventData);
        console.log('Event tags:', tags);

        // Validar hashtags y menciones
        const isEventValid = await checkHashtagsAndMentions(userHandler, tags);
        console.log('Event validation result:', isEventValid);
        
        if (!isEventValid) {
            return NextResponse.json(
                { error: "No se encontró publicación con los tags del evento" },
                { 
                    status: 400,
                    headers: corsHeaders,
                }
            );
        }

        // Crear transacción
        const data = encodeFunctionData({
            abi,
            functionName: "addParticipant",
            args: [eventCode],
        });

        const tx: TransactionSerializable = {
            to: CONTRACT_ADDRESS,
            data: data,
            chainId: avalancheFuji.id,
            type: 'legacy',
        };

        const serialized = serialize(tx);

        const resp: ExecutionResponse = {
            serializedTransaction: serialized,
            chainId: avalancheFuji.name,
        };

        return NextResponse.json(resp, {
            status: 200,
            headers: corsHeaders,
        });
        
    } catch (error) {
        console.error("Error en petición POST:", error);
        return NextResponse.json(
            { 
                error: "Internal Server Error",
                details: error instanceof Error ? error.message : 'Unknown error'
            }, 
            { 
                status: 500,
                headers: corsHeaders,
            }
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}

interface EventData {
    name: string;
    tags: string[];
    address: string;
    additionalData: any[];
    timestamp: bigint;
    amount: bigint;
    isActive: boolean;
}

function parseEventData(rawData: any[]): EventData {
    return {
        name: rawData[0] as string,
        tags: rawData[1] as string[],
        address: rawData[2] as string,
        additionalData: rawData[3] as any[],
        timestamp: rawData[4] as bigint,
        amount: rawData[5] as bigint,
        isActive: rawData[6] as boolean
    };
}