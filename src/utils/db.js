import { Client, Databases, ID } from "appwrite";

// Check if Appwrite environment variables are set
const APPWRITE_ENDPOINT = import.meta.env.VITE_ENDPOINT_URL;
const APPWRITE_PROJECT_ID = import.meta.env.VITE_PROJECT_ID;
const APPWRITE_DB_ID = import.meta.env.VITE_DB_ID;
const APPWRITE_COLLECTION_ID = import.meta.env.VITE_COLLECTION_ID; // For survey responses

// Helper to check if Appwrite is configured
const isAppwriteConfigured = () => {
    if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_DB_ID || !APPWRITE_COLLECTION_ID) {
        console.warn("Appwrite environment variables are not fully configured. Database operations will be skipped.");
        console.warn("Please ensure VITE_ENDPOINT_URL, VITE_PROJECT_ID, VITE_DB_ID, and VITE_COLLECTION_ID are set in your .env file.");
        return false;
    }
    return true;
};

export const saveToDB = (payload, collectionId) => new Promise(async (resolve, reject) => {
    if (!isAppwriteConfigured()) {
        reject(new Error("Appwrite not configured. Skipping save to DB."));
        return;
    }
    try {
        const client = new Client();
        client
            .setEndpoint(APPWRITE_ENDPOINT)
            .setProject(APPWRITE_PROJECT_ID);

        const database = new Databases(client);

        await database.createDocument(
            APPWRITE_DB_ID,
            collectionId,
            ID.unique(),
            payload
        );
        resolve();
    } catch (error) {
        reject(error);
    }
});

export const answerQuestion = (answer) => new Promise(async function (resolve, reject) {
    if (!isAppwriteConfigured()) {
        reject(new Error("Appwrite not configured. Skipping answer question."));
        return;
    }
    try {
        const payload = {
            answer,
            platform: "Ridm",
            userAgent: navigator.userAgent,
        };

        await saveToDB(payload, APPWRITE_COLLECTION_ID);
        resolve();
    } catch (error) {
        reject(error)
    }
});

// Removed recordVisitor function as requested.