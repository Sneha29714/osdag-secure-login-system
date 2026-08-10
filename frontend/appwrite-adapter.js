const appwriteClient = new Appwrite.Client();

appwriteClient
    .setEndpoint("https://sgp.cloud.appwrite.io/v1")
    .setProject("6a78385c00377c76eaf6");

// Appwrite authentication service
const appwriteAccount = new Appwrite.Account(appwriteClient);


// ======================================================
// REGISTER
// ======================================================

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


// ======================================================
// LOGIN
// ======================================================

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


// ======================================================
// LOGOUT
// ======================================================

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


// ======================================================
// GET CURRENT USER
// ======================================================

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

