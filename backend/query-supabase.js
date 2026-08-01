const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Servimosnorte.0@db.fmaxmnukiaszkfmnybgj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to Supabase.");

    // Let's get the 10 most recently updated conversations
    const res = await client.query(`SELECT id, phone, "customerName", "lastActivity" FROM conversations ORDER BY "lastActivity" DESC LIMIT 10`);
    console.log("\nLast 10 conversations:");
    console.table(res.rows);

    // Also let's check if the customer is still in `customers`? (Maybe not)
    const res2 = await client.query(`SELECT count(*) FROM customers`);
    console.log("\nTotal customers now:", res2.rows[0].count);

  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

run();
