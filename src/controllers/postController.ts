import { Request, Response } from "express";
import { db } from "../database/db";
import { v4 as uuidv4 } from "uuid";

export const getTutorPosts = async (req: Request, res: Response) => {
  const { tutorId } = req.params;
  try {
    const [rows]: any = await db.query(
      `SELECT id, title, content, image_url, created_at FROM posts WHERE tutor_id = ? ORDER BY created_at DESC`,
      [tutorId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener posts" });
  }
};

export const createPost = async (req: Request, res: Response) => {
  try {
    const { tutor_id, title, content, image_url } = req.body;
    const id = uuidv4();
    await db.query(
      `INSERT INTO posts (id, tutor_id, title, content, image_url, created_at) VALUES (?, ?, ?, ?, ?, NOW())`,
      [id, tutor_id, title, content, image_url]
    );
    res.json({ message: "Post creado", id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creando post" });
  }
};
