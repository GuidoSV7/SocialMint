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
import {
  encodeFunctionData,
  TransactionSerializable,
  http,
  createPublicClient,
} from "viem";
import { checkHashtagsAndMentions } from "@/services/twitterService";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS as `0x${string}`;

const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http("https://api.avax-test.network/ext/bc/C/rpc"), // RPC pública de Fuji
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
      title: "Social Mint",
      baseUrl: "https://www.tupasantia.lat",
      description:
        "Valida si tu post de X cumple con todos las condiciones necesarias para habilitarte el minteo de tu POAP!",
      actions: [
        {
          type: "dynamic",
          label: "Valida tu post de X",
          description: "Validar",
          chains: {
            source: "fuji",
          },
          path: "/api/mi-app",
          params: [
            {
              name: "eventCode",
              label: "Codigo del evento.",
              type: "text",
              required: true,
              description: "Ingresa el codigo del evento",
            },
            {
              name: "userHandler",
              label: "Twitter Handler",
              type: "text",
              required: true,
              description: "Ingresa tu usuario de Twitter (X)",
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
    const { searchParams } = new URL(req.url);
    const eventCode = searchParams.get("mensaje");
    const userHandler = searchParams.get("mensaje");

    if (!eventCode || !userHandler) {
        return NextResponse.json(
          { error: 'El codigo del evento y el usuario de Twitter son requeridos' },
          {
            status: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
          },
        );
      }

    const eventData = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: abi,
      functionName: "getEvent",
      args: [eventCode.toLowerCase()],
    });

    const { tags } = parseEventData([eventData]);
    if (tags.length === 0) {
        return NextResponse.json(
            { error: 'No se encontró el codigo del evento' },
            {
              status: 400,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              },
            },
          );
    }

    const isEventValid = await checkHashtagsAndMentions(userHandler, tags);
    if (!isEventValid) {
        return NextResponse.json(
            { error: 'No se encontró publicación con los tags del evento' },
            {
              status: 400,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              },
            },
          );
    }

    const data = encodeFunctionData({
      abi,
      functionName: "addParticipant",
      args: [eventCode],
    });

    const tx: TransactionSerializable = {
      to: CONTRACT_ADDRESS,
      data: data,
      chainId: avalancheFuji.id,
      type: "legacy",
    };
    // Serializar transacción
    const serialized = serialize(tx);

    // Crear respuesta
    const resp: ExecutionResponse = {
      serializedTransaction: serialized,
      chainId: avalancheFuji.name,
    };
    return NextResponse.json(resp, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error) {
    console.error("Error en petición POST:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version",
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
    isActive: rawData[6] as boolean,
  };
}
