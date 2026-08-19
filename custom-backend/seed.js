const pool = require("./db");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

const TEST_PASSWORD = "FOSSEE123";

const testUsers = [
    {
        email: "fossee.test1@gmail.com",
        fileName: "text1.txt"
    },
    {
        email: "fossee.test2@gmail.com",
        fileName: "text2.txt"
    },
    {
        email: "fossee.test3@gmail.com",
        fileName: "text3.txt"
    }
];

async function seed() {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);

        for (const testUser of testUsers) {

            const userResult = await client.query(
                `INSERT INTO users (email, password)
                 VALUES ($1, $2)
                 ON CONFLICT (email)
                 DO UPDATE SET password = EXCLUDED.password
                 RETURNING id, email`,
                [testUser.email, passwordHash]
            );

            const user = userResult.rows[0];

            console.log(
                `User ready: ${user.email} (ID: ${user.id})`
            );

            const filePath = path.join(
                __dirname,
                "..",
                "uploads",
                testUser.fileName
            );

            if (!fs.existsSync(filePath)) {
                throw new Error(
                    `Physical file not found: ${filePath}`
                );
            }

            const stats = fs.statSync(filePath);

            const existingFile = await client.query(
                `SELECT id
                 FROM files
                 WHERE owner_id = $1
                 AND file_name = $2`,
                [user.id, testUser.fileName]
            );

            if (existingFile.rows.length === 0) {

                await client.query(
                    `INSERT INTO files
                    (owner_id, file_name, mime_type, size_bytes)
                    VALUES ($1, $2, $3, $4)`,
                    [
                        user.id,
                        testUser.fileName,
                        "text/plain",
                        stats.size
                    ]
                );

                console.log(
                    `File record created: ${testUser.fileName}`
                );

            } else {

                await client.query(
                    `UPDATE files
                     SET mime_type = $1,
                         size_bytes = $2
                     WHERE id = $3`,
                    [
                        "text/plain",
                        stats.size,
                        existingFile.rows[0].id
                    ]
                );

                console.log(
                    `File record already exists: ${testUser.fileName}`
                );
            }
        }

        await client.query("COMMIT");

        console.log("\n=================================");
        console.log("Seed completed successfully!");
        console.log("=================================\n");

        console.log("Test accounts:");

        for (const testUser of testUsers) {
            console.log(`Email: ${testUser.email}`);
            console.log(`Password: ${TEST_PASSWORD}`);
            console.log(`File: ${testUser.fileName}`);
            console.log("---------------------------------");
        }

    } catch (error) {

        await client.query("ROLLBACK");

        console.error("\nSeed failed:");
        console.error(error);

    } finally {
        client.release();
        await pool.end();
    }
}

seed();