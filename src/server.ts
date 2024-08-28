import * as dotenv from "dotenv";
import { connect_db, createApp } from "./app";

dotenv.config();

const app = createApp();
connect_db();
const PORT = process.env.PORT || 3010;

app.listen(PORT, () => {
    console.log(`🔥 Server running on http://localhost:${PORT}`);
});


