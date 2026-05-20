import { MongoClient } from "mongodb";

let cachedClient = null;

async function connectToMongo() {
  if (cachedClient) return cachedClient;

  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();

  cachedClient = client;
  return client;
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
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
                { id: id },
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
            { id: id },
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