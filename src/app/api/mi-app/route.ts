import { NextRequest, NextResponse } from "next/server";
import {
  createMetadata,
  Metadata,
  ValidatedMetadata,
  ExecutionResponse,
} from "@sherrylinks/sdk";
import { checkHashtagsAndMentions } from "@/services/twitterService";
import { EventService, EventError } from "@/services/eventService";



export async function GET(req: NextRequest) {
  try {
    // const host = req.headers.get("host") || "localhost:3000";
    // const protocol = req.headers.get("x-forwarded-proto") || "http";
    // const serverUrl = `${protocol}://${host}`;

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

    const validated: ValidatedMetadata = createMetadata(metadata);

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
    const eventCode = searchParams.get("eventCode");
    const userHandler = searchParams.get("userHandler");

    if (!eventCode || !userHandler) {
      return NextResponse.json(
        { error: 'El codigo del evento y el usuario de Twitter son requeridos' },
        {
          status: 400,
          headers: getCorsHeaders(),
        },
      );
    }

    try {
      const eventData = await EventService.getEvent(eventCode);
      const isEventValid = await checkHashtagsAndMentions(userHandler, eventData.tags);
      
      if (!isEventValid) {
        return NextResponse.json(
          { error: 'No se encontró publicación con los tags del evento' },
          {
            status: 400,
            headers: getCorsHeaders(),
          },
        );
      }

      const serialized = await EventService.createAddParticipantTransaction(eventCode);

      const resp: ExecutionResponse = {
        serializedTransaction: serialized,
        chainId: "fuji",
      };

      return NextResponse.json(resp, {
        status: 200,
        headers: getCorsHeaders(),
      });
    } catch (error) {
      if (error instanceof EventError) {
        return NextResponse.json(
          { error: error.message },
          {
            status: error.code === 'EVENT_NOT_FOUND' ? 404 : 500,
            headers: getCorsHeaders(),
          },
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Error en petición POST:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { 
        status: 500,
        headers: getCorsHeaders(),
      }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
}

function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version",
  };
}

