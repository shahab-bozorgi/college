import { app } from "./api";
import { AppDataSource } from "./data-source";

const PORT = 3000;
AppDataSource.initialize().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
