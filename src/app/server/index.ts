import express, { Request, Response } from "express";
import next from "next";
import * as dotenv from "dotenv";
import { startListening } from "@/utils/contractListener";

dotenv.config();

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = parseInt(process.env.PORT || "3000", 10);

app.prepare().then(() => {
    const server = express();


    startListening();

    server.get("/api/custom", (req: Request, res: Response) => {
        res.json({ message: "Ruta personalizada funcionando" });
    });

    // Maneja todas las demás rutas de Next.js
    server.all("*", (req: Request, res: Response) => {
        return handle(req, res);
    });

    server.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
});
