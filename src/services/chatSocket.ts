import { Server, Socket } from "socket.io";
import { db } from "../database/db"; // conexión a tu DB
import { v4 as uuidv4 } from "uuid";

export const setupChatSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("Nuevo cliente conectado:", socket.id);

    // Unirse a la sala de la reserva
    socket.on("joinRoom", (reservationId: string) => {
      if (!reservationId) return;
      socket.join(reservationId);
      console.log(`Usuario unido a la sala: ${reservationId}`);
    });

    // Enviar mensaje
    socket.on(
      "sendMessage",
      async ({
        reservationId,
        senderId,
        message,
      }: {
        reservationId: string;
        senderId: string;
        message: string;
      }) => {
        if (!reservationId || !senderId || !message.trim()) return;

        const messageId = uuidv4();
        const timestamp = new Date();

        try {
          // Guardar mensaje en DB
          await db.query(
            `INSERT INTO chat_messages (id, reservation_id, sender_id, message, created_at) 
             VALUES (?, ?, ?, ?, ?)`,
            [messageId, reservationId, senderId, message, timestamp]
          );

          // Objeto de mensaje a enviar
          const messageObj = {
            id: messageId,
            reservation_id: reservationId,
            sender_id: senderId,
            message,
            created_at: timestamp,
          };

          // Emitir mensaje a todos los usuarios en la sala
          io.to(reservationId).emit("receiveMessage", messageObj);
        } catch (err) {
          console.error("Error guardando mensaje:", err);
          socket.emit("errorMessage", { error: "No se pudo enviar el mensaje" });
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("Cliente desconectado:", socket.id);
    });
  });
};

