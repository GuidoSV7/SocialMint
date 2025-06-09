import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

const contractABI = [
    "event EventoImportante(address indexed from, uint256 valor)"
];

const provider = new ethers.WebSocketProvider(process.env.WEBSOCKET_URL as string);

const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS as string,
    contractABI,
    provider
);

export function startListening() {
    console.log("🟢 Escuchando eventos del contrato...");

    contract.on("createEvent", (from: string, valor: ethers.BigNumber, event) => {


    });

    contract.on("error", (err: Error) => {
        console.error("❌ Error en el listener del contrato:", err);
    });
}
