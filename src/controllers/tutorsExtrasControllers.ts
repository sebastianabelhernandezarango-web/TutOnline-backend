import { Request, Response } from "express";
import { db } from "../database/db";
import { v4 as uuidv4 } from "uuid";

export const getSuggestedTutors = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 5;
    const [rows]: any = await db.query(
      `SELECT u.id as user_id, u.name, t.precio_hora, t.especialidades, t.rating FROM tutors t JOIN users u ON u.id = t.user_id WHERE t.verificado = 1 ORDER BY t.rating DESC LIMIT ?`,
      [limit]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo tutores sugeridos" });
  }
};

export const followTutor = async (req: Request, res: Response) => {
  const { user_id, tutor_id } = req.body;
  try {
    await db.query(
      `INSERT IGNORE INTO followers (id, user_id, tutor_id, created_at) VALUES (UUID(), ?, ?, NOW())`,
      [user_id, tutor_id]
    );
    res.json({ message: "Seguido correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error siguiendo tutor" });
  }
};
