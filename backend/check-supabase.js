const { Client } = require('pg');

async function checkRemoteDB() {
    console.log('Intentando conectar a Supabase con el Pooler IPv4 y nueva contraseña...');
    const client = new Client({
        connectionString: 'postgresql://postgres.fmaxmnukiaszkfmnybgj:ServimosNorte1234@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Conectado a Supabase correctamente.');

        // Revisar tablas
        const tableQuery = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tablas existentes:', tableQuery.rows.map(r => r.table_name).join(', '));

        // Revisar productos
        if (tableQuery.rows.some(r => r.table_name === 'products' || r.table_name === 'product')) {
            const tableName = tableQuery.rows.find(r => r.table_name === 'products' || r.table_name === 'product').table_name;
            const countQuery = await client.query(`SELECT COUNT(*) FROM ${tableName}`);
            console.log(`\n📦 Cantidad de productos en la base de datos de producción (Supabase): ${countQuery.rows[0].count}`);
            
            if (parseInt(countQuery.rows[0].count) > 0) {
                const productsQuery = await client.query(`SELECT id, name FROM ${tableName} LIMIT 5`);
                console.log('Primeros 5 productos:', productsQuery.rows);
            }
        } else {
            console.log('\n❌ No existe la tabla de productos en Supabase.');
        }

    } catch (err) {
        console.error('❌ Error conectando o consultando Supabase:', err.message);
    } finally {
        await client.end();
    }
}

checkRemoteDB();
