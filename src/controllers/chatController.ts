import { Request, Response } from "express";
import { db } from "../database/db";

export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const { reservationId } = req.params;

    const [rows]: any = await db.query(
      `SELECT * FROM chat_messages WHERE reservation_id = ? ORDER BY created_at ASC`,
      [reservationId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener historial de chat" });
  }
};

