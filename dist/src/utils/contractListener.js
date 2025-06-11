import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();
const contractABI = [
    "event EventClosed(string indexed eventCode)" // <- Evento real
];
const provider = new ethers.WebSocketProvider(process.env.WEBSOCKET_URL);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, provider);
export const startListening = () => {
    console.log("🟢 Escuchando eventos del contrato...");
    contract.on("EventClosed", (eventCode, event) => {
        console.log("🔔 Evento cerrado:", eventCode);
        console.log("📦 Raw event:", event);
    });
};
