import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "LexVanguard LLP Portal" });
  });

  // LexAI Legal Research API endpoint powered by Gemini
  app.post("/api/lexai", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Legal query parameter is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          answer: `LexAI Statutory Research for "${query}":\n\n• Legal Framework: Laws of Kenya & Constitution of Kenya 2010.\n• Precedents: Relevant appellate authority under the High Court and Court of Appeal of Kenya.\n• Note: Configure GEMINI_API_KEY in Secrets for live AI statutory analysis.`
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are LexAI, an elite legal research assistant for LexVanguard LLP, a premier law firm at Mounk Kenya University.
Answer the following legal research query accurately, professionally, and concisely with specific reference to Kenyan statutes (Constitution of Kenya 2010, Civil Procedure Act, Companies Act, Data Protection Act) and case law precedents where relevant. Format clearly with bullet points.

Legal Query: ${query}`,
      });

      const text = response.text || "No specific legal precedent returned.";
      return res.json({ answer: text });
    } catch (error: any) {
      console.error("LexAI Error:", error);
      return res.status(500).json({ 
        error: "Failed to process legal query",
        details: error.message 
      });
    }
  });

  // Serve Vite in development mode or static dist in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LexVanguard server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
