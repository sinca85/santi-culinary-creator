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
  res.setHeader("Access-Control-Allow-Methods", "GET,PATCH,OPTIONS");
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

    if (req.method === "PATCH") {
        const { id, tasks } = req.body || {};

        if (!id || !Array.isArray(tasks)) {
            return res.status(400).json({
            error: "Faltan campos: id y tasks"
            });
        }

        const result = await collection.updateOne(
            {
            $or: [
                { id: id },
                { _id: id }
            ]
            },
            {
            $set: {
                tasks,
                updatedAt: new Date().toISOString()
            }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
            error: "Proyecto no encontrado",
            id
            });
        }

        return res.status(200).json({
            ok: true,
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount
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