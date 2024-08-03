import express from "express";

export const app = express();

app.use(express.json());

if (process.env.NODE_ENV !== "Test") {
  app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
  });
}

app.use((req, res) => {
  res.status(404).send({ message: "Not Found!" });
});
