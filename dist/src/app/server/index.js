import express from "express";
import next from "next";
import * as dotenv from "dotenv";
import { startListening } from "../../utils/contractListener.js";
dotenv.config();
const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "3000", 10);
// Initialize Next.js
const app = next({ dev });
const handle = app.getRequestHandler();
// Start the server
app.prepare().then(() => {
    const server = express();
    // Start contract listener
    startListening();
    // Basic route handler
    server.use((req, res) => {
        return handle(req, res);
    });
    server.listen(port, () => {
        console.log(`🚀 Server running in ${dev ? 'development' : 'production'} mode at http://localhost:${port}`);
    });
}).catch((err) => {
    console.error('Error starting server:', err);
    process.exit(1);
});
