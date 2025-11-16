import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./database/db";
import authRoutes from "./routes/authRoutes";
import tutorsRoutes from "./routes/tutorsRoute";
import reservationsRoutes from "./routes/reservationRoutes";
import paymentRoutes from "./routes/paymentsRoutes";
import videoSessionsRoutes from "./routes/videoSessionsRoutes"; // si ya lo añadiste
import { createServer } from "http";
import { Server } from "socket.io";
import { setupChatSocket } from "./services/chatSocket";
import chatRoutes from "./routes/chatRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import mapRoutes from "./routes/mapsRoutes";

dotenv.config();

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

setupChatSocket(io);

app.use(cors());
app.use(express.json());

// Rutas
app.use("/tutonline/auth", authRoutes);
app.use("/tutonline/tutors", tutorsRoutes);
app.use("/tutonline/reservations", reservationsRoutes);
app.use("/tutonline/payments", paymentRoutes);
app.use("/tutonline/video-sessions", videoSessionsRoutes);
app.use("/tutonline/chat", chatRoutes);
app.use("/tutonline/dashboard", dashboardRoutes);
app.use("/tutonline/map", mapRoutes);



app.get("/", (req, res) => {
  res.send("Backend funcionando 🚀");
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

