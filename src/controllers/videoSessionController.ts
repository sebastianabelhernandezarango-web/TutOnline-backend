import { Request, Response } from "express";
import { db } from "../database/db";
import { v4 as uuidv4 } from "uuid";

// Crear sesión de videollamada (solo si la reserva es Online)
export const createVideoSession = async (req: Request, res: Response) => {
  try {
    const { reservationId } = req.body;

    if (!reservationId) {
      return res.status(400).json({ error: "Falta reservationId" });
    }

    // Obtener reserva
    const [reservations]: any = await db.query(
      "SELECT * FROM reservations WHERE id = ?",
      [reservationId]
    );

    if (reservations.length === 0) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    const reservation = reservations[0];

    if (reservation.modalidad !== "Online") {
      return res.status(400).json({ error: "La reserva no es de modalidad Online" });
    }

    // Generar link de Google Meet simulado
    const meetLink = `https://meet.google.com/${uuidv4().slice(0, 10)}`;

    // Calcular hora de fin usando duración
    const startTime = new Date(reservation.fecha_inicio);
    const endTime = new Date(startTime.getTime() + reservation.duracion_min * 60000);

    // Guardar link en la reserva
    await db.query(
      `UPDATE reservations 
       SET meet_link = ?, updated_at = NOW()
       WHERE id = ?`,
      [meetLink, reservationId]
    );

    // Guardar en tabla video_sessions
    await db.query(
      `INSERT INTO video_sessions
       (id, reservation_id, meet_link, start_time, end_time, created_at, updated_at)
       VALUES (UUID(), ?, ?, ?, ?, NOW(), NOW())`,
      [reservationId, meetLink, startTime, endTime]
    );

    res.json({
      message: "Sesión de videollamada creada correctamente",
      reservationId,
      meetLink,
      startTime,
      endTime,
    });
  } catch (err) {
    console.error("Error en createVideoSession:", err);
    res.status(500).json({ error: "Error creando sesión de videollamada" });
  }
};

// Obtener info de videollamada por reserva
export const getVideoSessionByReservation = async (req: Request, res: Response) => {
  try {
    const { reservationId } = req.params;

    const [sessions]: any = await db.query(
      "SELECT * FROM video_sessions WHERE reservation_id = ?",
      [reservationId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({ error: "Sesión de videollamada no encontrada" });
    }

    res.json(sessions[0]);
  } catch (err) {
    console.error("Error en getVideoSessionByReservation:", err);
    res.status(500).json({ error: "Error obteniendo sesión de videollamada" });
  }
};
