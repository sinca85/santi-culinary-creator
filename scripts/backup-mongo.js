const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

async function run(){

  const client =
    new MongoClient(
      process.env.MONGO_URI
    );

  await client.connect();

  const db =
    client.db(
      process.env.MONGO_DB
    );

  const projects =
    await db
    .collection("projects")
    .find({})
    .toArray();

  const backupDir =
    path.join(
      process.cwd(),
      "backups"
    );

  if(
    !fs.existsSync(
      backupDir
    )
  ){
    fs.mkdirSync(
      backupDir
    );
  }

  const file1 =
    path.join(
      backupDir,
      "projects-backup-1.json"
    );

  const file2 =
    path.join(
      backupDir,
      "projects-backup-2.json"
    );

  if(
    fs.existsSync(file1)
  ){

    fs.copyFileSync(
      file1,
      file2
    );

  }

  fs.writeFileSync(
    file1,
    JSON.stringify(
      projects,
      null,
      2
    )
  );

  await client.close();

  console.log(
    "Backup OK"
  );
}

run();