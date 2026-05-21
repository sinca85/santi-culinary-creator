import { MongoClient } from "mongodb";

let cachedClient = null;

function isAuthenticated(req) {
  const cookie = req.headers.cookie || "";

  if (!process.env.AUTH_TOKEN) {
    return false;
  }

  return cookie.includes(
    `santi_session=${process.env.AUTH_TOKEN}`
  );
}

async function connectToMongo() {
  if (cachedClient) return cachedClient;

  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();

  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  if (!isAuthenticated(req)) {
    return res.status(401).json({
      error: "No autorizado"
    });
  }

  try {
    const client = await connectToMongo();
    const db = client.db(process.env.MONGO_DB);
    const collection = db.collection("projects");

    if (req.method === "GET") {
      const projects = await collection.find({}).toArray();
      return res.status(200).json(projects);
    }

    if (req.method === "POST") {
      const project = req.body || {};

      if (!project.id || !project.title) {
        return res.status(400).json({
          error: "Faltan campos: id y title"
        });
      }

      const now = new Date().toISOString();

      const newProject = {
        ...project,
        createdAt: now,
        updatedAt: now
      };

      const result = await collection.insertOne(newProject);

      return res.status(201).json({
        ok: true,
        insertedId: result.insertedId,
        project: newProject
      });
    }

    if (req.method === "PATCH") {
      const { id, tasks, updates } = req.body || {};

      if (!id) {
        return res.status(400).json({
          error: "Falta campo: id"
        });
      }

      let fieldsToSet = {
        updatedAt: new Date().toISOString()
      };

      if (Array.isArray(tasks)) {
        fieldsToSet.tasks = tasks;
      }

      if (updates && typeof updates === "object") {
        const {
          _id,
          id: ignoredId,
          createdAt,
          ...safeUpdates
        } = updates;

        fieldsToSet = {
          ...fieldsToSet,
          ...safeUpdates
        };
      }

      const result = await collection.updateOne(
        {
          $or: [
            { id },
            { _id: id }
          ]
        },
        {
          $set: fieldsToSet
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          error: "Proyecto no encontrado",
          id
        });
      }

      const updatedProject = await collection.findOne({
        $or: [
          { id },
          { _id: id }
        ]
      });

      return res.status(200).json({
        ok: true,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        project: updatedProject
      });
    }

    if (req.method === "DELETE") {
      const { id } = req.body || {};

      if (!id) {
        return res.status(400).json({
          error: "Falta campo: id"
        });
      }

      const result = await collection.deleteOne({
        $or: [
          { id },
          { _id: id }
        ]
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          error: "Proyecto no encontrado",
          id
        });
      }

      return res.status(200).json({
        ok: true,
        deletedCount: result.deletedCount
      });
    }

    return res.status(405).json({
      error: "Método no permitido"
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message,
      name: err.name
    });
  }
}