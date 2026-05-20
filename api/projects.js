import { MongoClient } from "mongodb";

let cachedClient = null;

async function connectToMongo() {
  if (cachedClient) {
    try {
      await cachedClient.db("admin").command({ ping: 1 });
      return cachedClient;
    } catch (err) {
      cachedClient = null;
    }
  }

  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();

  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  try {
    if (!process.env.MONGO_URI) {
      return res.status(500).json({ error: "Falta MONGO_URI" });
    }

    if (!process.env.MONGO_DB) {
      return res.status(500).json({ error: "Falta MONGO_DB" });
    }

    const client = await connectToMongo();
    const db = client.db(process.env.MONGO_DB);

    const projects = await db
      .collection("projects")
      .find({})
      .toArray();

    return res.status(200).json(projects);
  } catch (err) {
    cachedClient = null;

    return res.status(500).json({
      error: err.message,
      name: err.name
    });
  }
}