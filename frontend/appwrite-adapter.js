const appwriteClient = new Appwrite.Client();

appwriteClient
    .setEndpoint("https://sgp.cloud.appwrite.io/v1")
    .setProject("6a78385c00377c76eaf6");

const appwriteAccount = new Appwrite.Account(appwriteClient);

const appwriteTablesDB = new Appwrite.TablesDB(appwriteClient);

const appwriteStorage = new Appwrite.Storage(appwriteClient);

const DATABASE_ID = "6a7864550003fbf7514b";
const FILES_TABLE_ID = "files";
const STORAGE_BUCKET_ID = "user-files";

async function appwriteRegister(email, password) {
    try {
        const user = await appwriteAccount.create(
            Appwrite.ID.unique(),
            email,
            password
        );

        return {
            status: 201,
            body: {
                message: "User registered successfully",
                user: user
            }
        };

    } catch (error) {
        return {
            status: error.code || 400,
            body: {
                message: error.message
            }
        };
    }
}

async function appwriteLogin(email, password) {
    try {
        const session = await appwriteAccount.createEmailPasswordSession(
            email,
            password
        );

        return {
            status: 200,
            body: {
                message: "Login successful",
                session: session
            }
        };

    } catch (error) {
        return {
            status: error.code || 401,
            body: {
                message: error.message
            }
        };
    }
}

async function appwriteLogout() {
    try {
        await appwriteAccount.deleteSession("current");

        return {
            status: 200,
            body: {
                message: "Logout successful"
            }
        };

    } catch (error) {
        return {
            status: error.code || 400,
            body: {
                message: error.message
            }
        };
    }
}

async function appwriteGetMe() {
    try {
        const user = await appwriteAccount.get();

        return {
            status: 200,
            body: {
                message: "Authenticated",
                user: user
            }
        };

    } catch (error) {
        return {
            status: error.code || 401,
            body: {
                message: error.message
            }
        };
    }
}

async function appwriteGetFiles() {
    try {
        const user = await appwriteAccount.get();

        const result = await appwriteTablesDB.listRows(
            DATABASE_ID,
            FILES_TABLE_ID
        );

        const userFiles = result.rows.filter(
            file => file.ownerId === user.$id
        );

        return {
            status: 200,
            body: {
                message: "Files retrieved successfully",
                files: userFiles
            }
        };

    } catch (error) {
        return {
            status: error.code || 400,
            body: {
                message: error.message
            }
        };
    }
}

async function appwriteGetFileById(id) {
    try {
        const user = await appwriteAccount.get();

        const file = await appwriteTablesDB.getRow(
            DATABASE_ID,
            FILES_TABLE_ID,
            id
        );

        if (file.ownerId !== user.$id) {
            return {
                status: 403,
                body: {
                    message: "You do not have access to this file"
                }
            };
        }

        return {
            status: 200,
            body: {
                message: "File retrieved successfully",
                file: file
            }
        };

    } catch (error) {
        return {
            status: error.code || 404,
            body: {
                message: error.message
            }
        };
    }
}

async function appwriteUploadFile(file) {
    try {
        const user = await appwriteAccount.get();

        const uploadedFile = await appwriteStorage.createFile(
            STORAGE_BUCKET_ID,
            Appwrite.ID.unique(),
            file
        );

        const row = await appwriteTablesDB.createRow(
            DATABASE_ID,
            FILES_TABLE_ID,
            Appwrite.ID.unique(),
            {
                ownerId: user.$id,
                fileName: file.name,
                mimeType: file.type || "application/octet-stream",
                sizeBytes: file.size,
                uploadedAt: new Date().toISOString(),
                storageFileId: uploadedFile.$id
            }
        );

        return {
            status: 201,
            body: {
                message: "File uploaded successfully",
                file: row
            }
        };

    } catch (error) {
        console.error("Upload error:", error);

        return {
            status: error.code || 400,
            body: {
                message: error.message
            }
        };
    }
}