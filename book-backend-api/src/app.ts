import { CLIENT_BASE_URL } from "#config";
import { bookRoutes } from "#routes";
import "#db";
import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: [CLIENT_BASE_URL, 'http://localhost:5173'],
  }),
);
app.use(express.json()); //cookieParser() erstmal nicht

app.get("/", (_req, res) => {
  res.json({
    message: "Book API is running",
    endpoints: {
      books: "/books",
    },
  });
});

app.use("/books", bookRoutes);

// Start the server, wird aber in src/config/index.ts konfiguriert, damit man es nicht hardcoded hat
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});