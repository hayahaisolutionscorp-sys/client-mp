require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');
const { S3Client, DeleteObjectCommand } = require('../../packages/knowledge-base-sdk/node_modules/@aws-sdk/client-s3');

async function cleanupDuplicates() {
    console.log('🧹 Starting Cleanup of Duplicates for "ayahay-kb.md"...');

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

    // S3 Config
    const s3 = new S3Client({
        region: process.env.AWS_REGION || process.env.AWS_SES_REGION || 'ap-southeast-2',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });

    try {
        // 1. Find all records for the file
        const res = await pool.query(`
             SELECT id, file_name, s3_key, created_at 
             FROM knowledge_base.files 
             WHERE file_name = 'ayahay-kb.md'
             ORDER BY created_at DESC
        `);

        if (res.rows.length <= 1) {
            console.log('✅ No duplicates found (or only 1 copy exists).');
            return;
        }

        const keep = res.rows[0]; // Keep the latest
        const remove = res.rows.slice(1); // Delete the rest

        console.log(`✅ Keeping Latest: ${keep.id} (${keep.created_at})`);
        console.log(`❌ Deleting ${remove.length} duplicates...`);

        for (const file of remove) {
            console.log(`\nProcessing Duplicate: ${file.id}`);

            // A. Delete RAG Documents
            console.log('   - Deleting knowledge_base.documents...');
            const docRes = await pool.query(`
                DELETE FROM knowledge_base.documents 
                WHERE metadata->>'fileId' = $1
            `, [file.id]);
            console.log(`     Deleted ${docRes.rowCount} document chunks.`);

            // B. Delete File Record
            console.log('   - Deleting knowledge_base.files record...');
            await pool.query('DELETE FROM knowledge_base.files WHERE id = $1', [file.id]);

            // C. Delete S3 Object
            console.log(`   - Deleting S3 Object: ${file.s3_key}...`);
            await s3.send(new DeleteObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET || process.env.AWS_BUCKET_NAME || 'ayahay-v2-assets',
                Key: file.s3_key
            }));
            console.log('     S3 Deletion sent.');
        }

        console.log('\n✨ Cleanup Complete.');

    } catch (e) {
        console.error('❌ Cleanup Failed:', e);
    } finally {
        await pool.end();
    }
}

cleanupDuplicates();
