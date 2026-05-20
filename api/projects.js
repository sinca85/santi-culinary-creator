import { MongoClient } from "mongodb";

let client;

export default async function handler(req, res) {
  try {
    if (!client) {
      client = new MongoClient(
        process.env.MONGO_URI
      );

      await client.connect();
    }

    const db =
      client.db(process.env.MONGO_DB);

    const projects =
      await db
        .collection("projects")
        .find({})
        .toArray();

    res.status(200).json(projects);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
}