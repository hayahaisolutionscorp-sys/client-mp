require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');

async function testFiles() {
    console.log('Testing File Duplicates...');

    // DB Config
    const config = {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || "5432"),
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        connectionTimeoutMillis: 5000,
        ssl: process.env.DB_SSL_CA ? { rejectUnauthorized: true, ca: process.env.DB_SSL_CA } : false
    };

    if (config.ssl && typeof process.env.DB_SSL_CA === 'string' && process.env.DB_SSL_CA.includes('\\n')) {
        config.ssl.ca = process.env.DB_SSL_CA.replace(/\\n/g, '\n');
    }

    const pool = new Pool(config);

    try {
        // Query for duplicates
        const res = await pool.query(`
             SELECT id, file_name, s3_key, created_at, agent_id 
             FROM knowledge_base.files 
             WHERE file_name = 'ayahay-kb.md'
             ORDER BY created_at DESC
        `);

        console.log(`📄 Found ${res.rows.length} records for 'ayahay-kb.md':`);
        res.rows.forEach((r, i) => {
            console.log(`   ${i + 1}. ID: ${r.id} | Key: ${r.s3_key} | Agent: ${r.agent_id} | Created: ${r.created_at}`);
        });

        // Log unique S3 keys
        const keys = new Set(res.rows.map(r => r.s3_key));
        console.log(`\n🔑 Unique S3 Keys used: ${keys.size}`);
        keys.forEach(k => console.log('   - ' + k));

        console.log(`\nℹ️  If 'Unique S3 Keys' is 1, there is strictly 1 file in S3 referenced multiple times in DB.`);
        console.log(`ℹ️  If 'Unique S3 Keys' > 1, multiple uploads occurred.`);

    } catch (e) {
        console.error('❌ DB Query FAIL:', e.message);
    } finally {
        await pool.end();
    }
}

testFiles();
