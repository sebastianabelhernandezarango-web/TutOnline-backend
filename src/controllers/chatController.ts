import { Request, Response } from "express";
import { db } from "../database/db";

// Obtener todos los chats de un estudiante
export const getChatsByStudent = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    // Obtener todas las reservas del estudiante
    const [reservas]: any = await db.query(
      `SELECT id FROM reservations WHERE student_id = ?`,
      [studentId]
    );

    if (reservas.length === 0) return res.json([]);

    const reservationIds = reservas.map((r: any) => r.id);

    // Obtener mensajes de esas reservas
    const [mensajes]: any = await db.query(
      `SELECT cm.*, r.tutor_id, u.name as tutor_name
       FROM chat_messages cm
       JOIN reservations r ON cm.reservation_id = r.id
       JOIN users u ON r.tutor_id = u.id
       WHERE r.id IN (?)
       ORDER BY cm.created_at ASC`,
      [reservationIds]
    );

    res.json(mensajes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener chats del estudiante" });
  }
};


