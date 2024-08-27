import * as dotenv from "dotenv";
import createApp from "./app";

dotenv.config();

const app = createApp();
const PORT = process.env.PORT || 3010;

app.listen(PORT, () => {
    console.log(`🔥 Server running on http://localhost:${PORT}`);
});


