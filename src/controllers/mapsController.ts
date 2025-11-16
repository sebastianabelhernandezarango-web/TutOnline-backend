// controllers/mapsController.ts
import { Request, Response } from "express";
import { db } from "../database/db";

// Función para parsear JSON de manera segura
function parseJSONSafe(value: any) {
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch (err) {
    // Si no es JSON válido, asumimos que es un string separado por comas
    return value.split?.(",").map((v: string) => v.trim()) || [];
  }
}

export const getNearbyTutors = async (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string);
  const lng = parseFloat(req.query.lng as string);
  const radius = parseFloat(req.query.radius as string) || 5; // km

  if (!lat || !lng) return res.status(400).json({ error: "Lat y Lng son requeridos" });

  try {
    // Consulta simple usando Haversine para distancia aproximada
    const [rows]: any = await db.query(
      `SELECT t.id, u.name, t.especialidades, tl.latitude, tl.longitude,
        (6371 * ACOS(
            COS(RADIANS(?)) * COS(RADIANS(tl.latitude)) * COS(RADIANS(tl.longitude) - RADIANS(?))
            + SIN(RADIANS(?)) * SIN(RADIANS(tl.latitude))
        )) AS distance
       FROM tutors t
       JOIN users u ON u.id = t.user_id
       JOIN tutor_locations tl ON t.id = tl.tutor_id
       HAVING distance <= ?
       ORDER BY distance ASC`,
      [lat, lng, lat, radius]
    );

    // Parsear especialidades de manera segura
    const tutors = rows.map((t: any) => ({
      ...t,
      especialidades: parseJSONSafe(t.especialidades),
    }));

    res.json(tutors);
  } catch (err) {
    console.error("Error al obtener tutores cercanos:", err);
    res.status(500).json({ error: "Error al obtener tutores cercanos" });
  }
};

