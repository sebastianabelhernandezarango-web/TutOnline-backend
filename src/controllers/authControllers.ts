import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../database/db";

export const register = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      role,
      name,
      phone,
      // Campos opcionales para tutors
      especialidades,
      bio,
      precio_hora,
      ubicacion,
      experiencia_anios,
      disponibilidad
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son obligatorios" });
    }

    // Verificar si ya existe el email
    const [existing]: any = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Crear usuario
    await db.query(
      "INSERT INTO users (id, email, password_hash, role, name, phone) VALUES (UUID(), ?, ?, ?, ?, ?)",
      [email, hashed, role ?? "STUDENT", name ?? null, phone ?? null]
    );

    // Obtener el id generado
    const [userRow]: any = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    const user_id = userRow[0].id;

    // Si el usuario es tutor, crear registro en tutors
    if (role && role.toUpperCase() === "TUTOR") {
      if (precio_hora == null) {
        return res.status(400).json({ error: "precio_hora es obligatorio para los tutores" });
      }

      const specialtiesJson = especialidades ? JSON.stringify(especialidades) : null;
      const availabilityJson = disponibilidad ? JSON.stringify(disponibilidad) : null;

      await db.query(
        `
        INSERT INTO tutors 
          (id, user_id, especialidades, bio, precio_hora, ubicacion, experiencia_anios, disponibilidad, verificado, rating, reviews_count, created_at, updated_at)
        VALUES 
          (UUID(), ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, NOW(), NOW())
        `,
        [
          user_id,
          specialtiesJson,
          bio ?? null,
          precio_hora,
          ubicacion ?? null,
          experiencia_anios ?? null,
          availabilityJson
        ]
      );
    }

    res.json({ message: "Usuario registrado correctamente", user_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};


export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const [users]: any = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    const user = users[0];

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};
