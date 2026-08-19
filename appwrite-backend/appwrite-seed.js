require("dotenv").config();

const sdk = require("node-appwrite");
const { InputFile } = require("node-appwrite/file");
const path = require("path");
const fs = require("fs");

const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const users = new sdk.Users(client);
const storage = new sdk.Storage(client);
const tablesDB = new sdk.TablesDB(client);

async function getOrCreateUser(testUser) {
    const result = await users.list([
        sdk.Query.equal("email", [testUser.email])
    ]);

    if (result.users.length > 0) {
        console.log(
            `User already exists: ${testUser.email}`
        );

        return result.users[0];
    }

    const user = await users.create(
        sdk.ID.unique(),
        testUser.email,
        undefined,
        testUser.password,
        testUser.name
    );

    console.log(
        `User created: ${user.email} (ID: ${user.$id})`
    );

    return user;
}

async function seedStorageFile(fileName, userId, fileId) {

    const filePath = path.join(
        __dirname,
        "..",
        "uploads",
        fileName
    );

    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    try {

        const existingFile = await storage.getFile(
            process.env.APPWRITE_BUCKET_ID,
            fileId
        );

        console.log(
            `Storage file already exists: ${fileName} (${fileId})`
        );

        return existingFile;

    } catch (error) {

        if (error.code !== 404) {
            throw error;
        }
    }

    const uploadedFile = await storage.createFile(
        process.env.APPWRITE_BUCKET_ID,
        fileId,
        InputFile.fromPath(filePath, fileName),
        [
            sdk.Permission.read(
                sdk.Role.user(userId)
            )
        ]
    );

    console.log(
        `Storage file created: ${fileName} (${fileId})`
    );

    return uploadedFile;
}

async function seedFileRow(
    rowId,
    userId,
    file,
    fileName,
    filePath
) {
    const stats = fs.statSync(filePath);

    try {
        const row = await tablesDB.createRow(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_TABLE_ID,
            rowId,
            {
                ownerId: userId,
                fileName: fileName,
                mimeType: "text/plain",
                sizeBytes: stats.size,
                uploadedAt: new Date().toISOString(),
                storageFileId: file.$id
            },
            [
                sdk.Permission.read(
                    sdk.Role.user(userId)
                )
            ]
        );

        console.log(
            `FILES row created: ${rowId}`
        );

        return row;

    } catch (error) {

        if (error.code === 409) {
            console.log(
                `FILES row already exists: ${rowId}`
            );

            return null;
        }

        throw error;
    }
}

async function main() {

    console.log("Starting Appwrite seed...\n");

    const testUsers = [
        {
            email: "fossee.test1@gmail.com",
            password: "FOSSEE123",
            name: "FOSSEE Test User 1"
        },
        {
            email: "fossee.test2@gmail.com",
            password: "FOSSEE123",
            name: "FOSSEE Test User 2"
        },
        {
            email: "fossee.test3@gmail.com",
            password: "FOSSEE123",
            name: "FOSSEE Test User 3"
        }
    ];

    const files = [
        "text1.txt",
        "text2.txt",
        "text3.txt"
    ];


    for (let i = 0; i < testUsers.length; i++) {

        const testUser = testUsers[i];
        const fileName = files[i];

        try {

            const user = await getOrCreateUser(testUser);

            const storageFileId = `seed-file-${i + 1}`;

            const file = await seedStorageFile(
                fileName,
                user.$id,
                storageFileId
            );

            const filePath = path.join(
                __dirname,
                "..",
                "uploads",
                fileName
            );

            const rowId = `seed-row-${i + 1}`;

            const row = await seedFileRow(
                rowId,
                user.$id,
                file,
                fileName,
                filePath
            );


            console.log(
                `Ready: ${testUser.email}`
            );

            console.log(
                `  Storage ID: ${file.$id}`
            );

            console.log(
                `  Row ID: ${rowId}`
            );

            console.log("");

        } catch (error) {

            console.error(
                `Failed to seed ${fileName}:`,
                error
            );

            throw error;
        }
    }


    console.log("================================");
    console.log("Appwrite seed completed!");
    console.log("================================");
}

main().catch((error) => {

    console.error("Seed failed:", error);

    process.exit(1);
});