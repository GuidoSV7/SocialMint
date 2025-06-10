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
const CONTRACT_ADDRESS = "0xe7E692df7a75306A56430e984a403f6F2eb322ef";

const publicClient = createPublicClient({
    chain: avalancheFuji,
    transport: http('https://api.avax-test.network/ext/bc/C/rpc'), // RPC pública de Fuji
    // Alternativamente usa process.env.RPC_URL si tienes uno personalizado
});
export async function GET(req: NextRequest) {

    //todo: averiguar si se puede obtener la address del usuario desde el frontend de sherry

    try {
        const host = req.headers.get("host") || "localhost:3000";
        const protocol = req.headers.get("x-forwarded-proto") || "http";
        const serverUrl = `${protocol}://${host}`;

        const metadata: Metadata = {
            url: "https://sherry.social",
            icon: "https://avatars.githubusercontent.com/u/117962315",
            title: "Mensaje con Timestamp",
            baseUrl: serverUrl,
            description:
                "Almacena un mensaje con un timestamp optimizado calculado por nuestro algoritmo",
            actions: [
                {
                    type: "dynamic",
                    label: "Almacenar Mensaje",
                    description:
                        "Almacena tu mensaje con un timestamp personalizado calculado para almacenamiento óptimo",
                    chains: { source: "fuji" },
                    path: `/api/example`,
                    params: [
                        {
                            name: "mensaje",
                            label: "¡Tu Mensaje Hermano!",
                            type: "text",
                            required: true,
                            description:
                                "Ingresa el mensaje que quieres almacenar en la blockchain",
                        },
                    ],
                },
            ],
        };

        // Validar metadata usando el SDK
        const validated: ValidatedMetadata = createMetadata(metadata);

        // Retornar con headers CORS para acceso cross-origin
        return NextResponse.json(validated, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            },
        });
    } catch (error) {
        console.error("Error creando metadata:", error);
        return NextResponse.json(
            { error: "Error al crear metadata" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const { eventCode, userHandler } = await req.json();
        console.log(eventCode, userHandler);
        if (!eventCode || !userHandler) {
            return NextResponse.json(
                { error: "'eventCode' and 'userHandler' son requeridos" },
                { status: 400 }
            );
        }

        const eventData = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: abi,
            functionName: "getEvent",
            args: [eventCode.toLowerCase()],
        });

        const { tags } = parseEventData(eventData);
        const isEventValid = await checkHashtagsAndMentions("rflores012", tags);
        // const data = encodeFunctionData({
        //     abi,
        //     functionName: "addParticipant",
        //     args: ["sherry-hackathon", userHandler],
        // });

        // const tx: TransactionSerializable = {
        //     to: CONTRACT_ADDRESS,
        //     data,
        //     chainId: avalancheFuji.id,
        //     type: "legacy",
        // };

        // const serialized = serialize(tx);

        return NextResponse.json(
            {
                isEventValid,
                chainId: avalancheFuji.name,
            },
            {
                status: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                },
            }
        );
    } catch (error) {
        console.error("Error en petición POST:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers':
                'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version',
        },
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

// Función para parsear los datos del smart contract
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