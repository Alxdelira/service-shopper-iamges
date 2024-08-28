import mongoose, { ConnectOptions } from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const dbUrl: string = process.env.DB_SHOPPER_URL || "";
const dbOptions: ConnectOptions = {};

(async (): Promise<void> => {
    try {
        await mongoose.connect(dbUrl, dbOptions);
    } catch (error) {
        console.log("Error connecting to MongoDB", error);
    }
})();

let db = mongoose.connection;

export default db;