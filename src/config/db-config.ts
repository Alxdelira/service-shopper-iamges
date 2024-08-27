import mongoose, { ConnectOptions } from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const dbUrl: string = process.env.DB_URL || "";
const dbOptions: ConnectOptions = {};

(async (): Promise<void> => {
    try {
        await mongoose.connect(dbUrl, dbOptions);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log("Error connecting to MongoDB", error);
    }
})();

let db = mongoose.connection;

export default db;