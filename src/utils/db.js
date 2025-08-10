import { Client, Databases, ID } from "appwrite";

const THREE_DAYS_IN_MILLISECONDS = 259200000;

// Check if Appwrite environment variables are set
const APPWRITE_ENDPOINT = import.meta.env.VITE_ENDPOINT_URL;
const APPWRITE_PROJECT_ID = import.meta.env.VITE_PROJECT_ID;
const APPWRITE_DB_ID = import.meta.env.VITE_DB_ID;
const APPWRITE_COLLECTION_ID = import.meta.env.VITE_COLLECTION_ID;
const APPWRITE_COLLECTION_ID2 = import.meta.env.VITE_COLLECTION_ID2;

// Helper to check if Appwrite is configured
const isAppwriteConfigured = () => {
    if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_DB_ID || !APPWRITE_COLLECTION_ID || !APPWRITE_COLLECTION_ID2) {
        console.warn("Appwrite environment variables are not fully configured. Database operations will be skipped.");
        console.warn("Please ensure VITE_ENDPOINT_URL, VITE_PROJECT_ID, VITE_DB_ID, VITE_COLLECTION_ID, and VITE_COLLECTION_ID2 are set in your .env file.");
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

export const recordVisitor = async (searchParams) => {
    if (!isAppwriteConfigured()) {
        console.warn("Appwrite not configured. Skipping visitor recording.");
        return;
    }
    try {
        const omitParam = searchParams.get('omit') ?? '';
        const avoidVisitor = Number(localStorage.getItem('omit')) >= Date.now() || omitParam === 'true';

        if(avoidVisitor) {
            const nextThreeDays = Date.now() + THREE_DAYS_IN_MILLISECONDS;
            localStorage.setItem('omit', String(nextThreeDays));
        } else {
            const payload = {
                userAgent: navigator.userAgent,
                url: window.location.href
            };

            await saveToDB(payload, APPWRITE_COLLECTION_ID2);
        }
    } catch (error) {
        console.error("Error recording visitor:", error.message);
    }
}