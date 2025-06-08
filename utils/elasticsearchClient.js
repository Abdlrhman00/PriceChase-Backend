import { Client } from "@elastic/elasticsearch";

const client = new Client({
  node: 'https://my-elasticsearch-project-a9efdf.es.us-east-1.aws.elastic.cloud:443',
  auth: {
    apiKey: "SVNuSVBKY0JrR3NlRzhtcjZubWw6ZlhZWi1ReXFlLU5fSjdxLWNqOUZNZw=="
  },
});

async function testHealth() {
  try {
    const health = await client.cluster.health();
    const versionInfo = await elasticClient.info();
console.log(versionInfo);
    console.log('Cluster health:', health);
  } catch (err) {
    console.error(err);
  }
}

testHealth();

async function run() {
  const index = "search";

  // Check if the index already exists
  const exists = await client.indices.exists({ index });

  if (!exists) {
    // Create the index with mapping if it doesn't exist
    await client.indices.create({
      index,
      body: {
        mappings: {
          properties: {
            text: { type: 'text' }
          }
        }
      }
    });
    console.log(`✅ Created index: ${index}`);
  } else {
    console.log(`ℹ️ Index '${index}' already exists`);
  }
}

run().catch(console.error);
