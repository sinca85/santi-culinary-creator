import { MongoClient } from "mongodb";

let cachedClient = null;

async function connectToMongo() {
  if (cachedClient) return cachedClient;

  const client = new MongoClient(
    process.env.MONGO_URI
  );

  await client.connect();

  cachedClient = client;

  return client;
}

export default async function handler(req, res) {

  // CORS
  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {

    const client =
      await connectToMongo();

    const db =
      client.db(
        process.env.MONGO_DB
      );

    const projects =
      await db
        .collection("projects")
        .find({})
        .toArray();

    return res
      .status(200)
      .json(projects);

  } catch(err){

    return res
      .status(500)
      .json({
        error:err.message
      });

  }
}