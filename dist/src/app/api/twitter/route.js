import { NextResponse } from "next/server";
//import { checkHashtagsAndMentions } from "@/services/twitterService";
export async function POST(req) {
    try {
        const body = await req.json();
        const { handler } = body;
        if (!handler) {
            return NextResponse.json({ error: "Handler is required" }, { status: 400 });
        }
        console.log(handler);
        return NextResponse.json("test", {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Error processing request:", errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version",
        },
    });
}
