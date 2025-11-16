import { Request, Response } from "express";
import { db } from "../database/db";

// Función auxiliar para parsear JSON seguro o string separado por comas
const parseJSONSafe = (value: any): any => {
  if (!value) return [];
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (e) {
      // Si no es JSON válido, asumir string separado por comas
      return value.split(",").map((v) => v.trim());
    }
  }
  // Si ya es un array u objeto, devolver tal cual
  return value;
};

// Obtener todos los tutores
export const getAllTutors = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        t.especialidades,
        t.bio AS description,
        t.precio_hora AS price_per_hour,
        t.rating,
        t.reviews_count,
        t.ubicacion AS location,
        t.experiencia_anios AS experience_years,
        t.disponibilidad,
        t.verificado AS verified
      FROM tutors t
      JOIN users u ON u.id = t.user_id
    `);

    const tutors = rows.map((t: any) => ({
      ...t,
      especialidades: parseJSONSafe(t.especialidades),
      disponibilidad: parseJSONSafe(t.disponibilidad),
    }));

    res.json(tutors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener tutores" });
  }
};

// Obtener un tutor por id
export const getTutorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [rows]: any = await db.query(
      `
      SELECT 
        u.id,
        u.name,
        u.email,
        t.especialidades,
        t.bio AS description,
        t.precio_hora AS price_per_hour,
        t.rating,
        t.reviews_count,
        t.ubicacion AS location,
        t.experiencia_anios AS experience_years,
        t.disponibilidad,
        t.verificado AS verified
      FROM tutors t
      JOIN users u ON u.id = t.user_id
      WHERE t.user_id = ?
    `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Tutor no encontrado" });
    }

    const tutor = rows[0];
    tutor.especialidades = parseJSONSafe(tutor.especialidades);
    tutor.disponibilidad = parseJSONSafe(tutor.disponibilidad);

    res.json(tutor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener tutor" });
  }
};

// Crear un tutor
export const createTutor = async (req: Request, res: Response) => {
  try {
    const {
      user_id,
      especialidades,
      bio,
      precio_hora,
      ubicacion,
      experiencia_anios,
      disponibilidad,
      verificado,
    } = req.body;

    if (!user_id || precio_hora == null) {
      return res
        .status(400)
        .json({ error: "Faltan campos obligatorios: user_id o precio_hora" });
    }

    const specialtiesJson = especialidades ? JSON.stringify(especialidades) : null;
    const availabilityJson = disponibilidad ? JSON.stringify(disponibilidad) : null;

    await db.query(
      `
      INSERT INTO tutors 
        (id, user_id, especialidades, bio, precio_hora, ubicacion, experiencia_anios, disponibilidad, verificado, rating, reviews_count, created_at, updated_at)
      VALUES 
        (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, NOW(), NOW())
      `,
      [
        user_id,
        specialtiesJson,
        bio ?? null,
        precio_hora,
        ubicacion ?? null,
        experiencia_anios ?? null,
        availabilityJson,
        verificado ?? 0,
      ]
    );

    res.json({ message: "Tutor creado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear tutor" });
  }
};

// Buscar tutores con filtros avanzados
export const searchTutors = async (req: Request, res: Response) => {
  try {
    const { especialidad, min_experience, max_precio, ubicacion, min_rating } = req.query;

    const conditions: string[] = [];
    const params: any[] = [];

    if (especialidad) {
      conditions.push(`JSON_CONTAINS(t.especialidades, ?, '$')`);
      params.push(JSON.stringify(especialidad));
    }

    if (min_experience) {
      conditions.push(`t.experiencia_anios >= ?`);
      params.push(Number(min_experience));
    }

    if (max_precio) {
      conditions.push(`t.precio_hora <= ?`);
      params.push(Number(max_precio));
    }

    if (ubicacion) {
      conditions.push(`t.ubicacion LIKE ?`);
      params.push(`%${ubicacion}%`);
    }

    if (min_rating) {
      conditions.push(`t.rating >= ?`);
      params.push(Number(min_rating));
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows]: any = await db.query(
      `
      SELECT 
        u.id,
        u.name,
        u.email,
        t.especialidades,
        t.bio AS description,
        t.precio_hora AS price_per_hour,
        t.rating,
        t.reviews_count,
        t.ubicacion AS location,
        t.experiencia_anios AS experience_years,
        t.disponibilidad,
        t.verificado AS verified
      FROM tutors t
      JOIN users u ON u.id = t.user_id
      ${whereClause}
      ORDER BY t.rating DESC
      `,
      params
    );

    const tutors = rows.map((t: any) => ({
      ...t,
      especialidades: parseJSONSafe(t.especialidades),
      disponibilidad: parseJSONSafe(t.disponibilidad),
    }));

    res.json(tutors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al buscar tutores" });
  }
};
