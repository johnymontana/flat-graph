const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");
const neo4j = require("neo4j-driver");

const NEO4J_URI = core.getInput("neo4j-uri");
const NEO4J_USER = core.getInput("neo4j-user");
const NEO4J_PASSWORD = core.getInput("neo4j-password");
const FILENAME = core.getInput("filename");
const CYPHER_QUERY = core.getInput("cypher-query");

const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
);

const loadData = async () => {
  const session = driver.session({ defaultAccessMode: neo4j.session.WRITE });
  try {
    const jsonData = JSON.parse(fs.readFileSync(FILENAME));

    const tx = session.beginTransaction();

    const result = await tx.run(CYPHER_QUERY, { value: jsonData });
    result.records.forEach((record) => console.log(record));
    await tx.commit();
  } catch (error) {
    core.setFailed(error.message);
  } finally {
    await session.close();
    await driver.close();
  }
};

loadData();
