import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

const contractABI = [
    "event EventClosed(string indexed eventCode)" // <- Evento real
];
console.log(process.env.WEBSOCKET_URL);
const provider = new ethers.WebSocketProvider("wss://api.avax-test.network/ext/bc/C/ws");

const contract = new ethers.Contract(
    "0x91c21B7132b8305E352104ba1e18d302FbAf6162",
    contractABI,
    provider
);

export const startListening = () => {
    console.log("🟢 Escuchando eventos del contrato...");

    // contract.on("EventClosed", (eventCode: string, event: any) => {
    //     console.log("🔔 Evento cerrado:", eventCode);
    //     console.log("📦 Raw event:", event);
    // });

};
