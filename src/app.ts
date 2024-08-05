import { app } from "./api";

import dotenv from "dotenv-flow"
dotenv.config()

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
