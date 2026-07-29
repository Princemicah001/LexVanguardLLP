import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { Resend } from "resend";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable CORS headers for all routes and handle OPTIONS preflight
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "LexVanguard LLP Portal" });
  });

  // Resend Email Endpoint for Team Member Invitations
  app.post("/api/send-invite", async (req, res) => {
    try {
      const { email, name, invitedBy, invitedByEmail, inviteUrl } = req.body;

      if (!email || typeof email !== "string" || !email.includes("@")) {
        return res.status(400).json({ success: false, error: "A valid invitee email address is required." });
      }

      if (!inviteUrl || typeof inviteUrl !== "string") {
        return res.status(400).json({ success: false, error: "An activation URL is required." });
      }

      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ success: false, error: "RESEND_API_KEY environment variable is not configured on the server." });
      }

      const resend = new Resend(apiKey);

      const inviteeName = name?.trim() || "Counsel";
      const senderName = invitedBy || "Kelvin Musya";
      const senderEmail = invitedByEmail || "kelvin@lexvanguard.edu";

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f4f5f7; font-family:'Segoe UI', Arial, Helvetica, sans-serif; color:#222222;">
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f4f5f7; padding:40px 10px;">
  <tr>
    <td align="center">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:680px; background-color:#ffffff; border-radius:10px; overflow:hidden; border:1px solid #e6e6e6; box-shadow:0 12px 35px rgba(0,0,0,0.06);">
        
        <!-- HEADER -->
        <tr>
          <td style="background-color:#0A1F44; padding:45px 40px; color:#ffffff;">
            <div style="font-size:28px; font-weight:700; letter-spacing:0.8px; color:#ffffff; font-family:'Georgia', serif;">
              Lex <span style="color:#C9A55C;">Vanguard</span> Chambers
            </div>
            <div style="margin-top:10px; font-size:13px; color:#d9d9d9; letter-spacing:0.5px; text-transform:uppercase;">
              Excellence in Advocacy &bull; Integrity in Service &bull; Innovation in Practice
            </div>
          </td>
        </tr>

        <!-- CONTENT -->
        <tr>
          <td style="padding:45px 40px; line-height:1.8; font-size:15px; color:#333333;">
            <p style="margin:0 0 20px; font-size:17px; color:#0A1F44; font-weight:600;">
              Dear <strong>${inviteeName}</strong>,
            </p>

            <p style="margin:0 0 20px;">
              On behalf of <strong style="color:#0A1F44;">Lex Vanguard Chambers</strong>, we are pleased to extend this formal invitation for you to join the Firm as <strong>Counsel</strong>.
            </p>

            <p style="margin:0 0 20px;">
              This invitation has been issued by <strong>${senderName}</strong> (<a href="mailto:${senderEmail}" style="color:#0A1F44; text-decoration:none;">${senderEmail}</a>) following your nomination to become a member of our Chambers. We are confident that your admission will contribute to the continued pursuit of legal excellence, professional integrity, and innovation that define our practice.
            </p>

            <!-- INVITATION BOX -->
            <div style="margin:30px 0; padding:28px; background-color:#fafafa; border-left:4px solid #C9A55C; border-radius:4px;">
              <p style="margin:0 0 14px; font-weight:600; color:#0A1F44;">
                To complete your onboarding, activate your account using the secure button below. During registration you will:
              </p>

              <ul style="margin:0 0 25px; padding-left:20px; line-height:2; color:#444444;">
                <li>Verify your professional details</li>
                <li>Create a secure password</li>
                <li>Establish your Counsel Office</li>
                <li>Gain access to the Lex Vanguard Chambers platform</li>
              </ul>

              <div style="text-align:left; margin:25px 0 15px 0;">
                <a href="${inviteUrl}" target="_blank" style="background-color:#0A1F44; color:#ffffff; text-decoration:none; padding:15px 32px; border-radius:6px; font-weight:700; font-size:14px; display:inline-block; letter-spacing:0.5px; box-shadow:0 4px 12px rgba(10,31,68,0.2);">
                  Activate Your Counsel Account
                </a>
              </div>

              <p style="margin:15px 0 0 0; font-size:12px; color:#777777; word-break:break-all;">
                If the button above does not work, copy and paste the invitation URL into your browser:<br>
                <a href="${inviteUrl}" style="color:#0A1F44;">${inviteUrl}</a>
              </p>
            </div>

            <p style="margin:0 0 20px;">
              Upon successful registration, you will receive immediate access to your dedicated digital workspace, including case management, secure collaboration tools, legal resources, internal communications, and firm-wide administrative services.
            </p>

            <div style="height:1px; background-color:#ececec; margin:30px 0;"></div>

            <p style="margin:0; font-size:12px; color:#777777; line-height:1.6;">
              For your security, this invitation is confidential and intended solely for the recipient named above. Please do not forward or share this email. If you believe you have received this invitation in error, kindly disregard it and notify the sender.
            </p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:30px 40px; background-color:#fafafa; border-top:1px solid #ececec;">
            <div style="font-size:14px; line-height:1.7; color:#333333;">
              Kind regards,<br><br>
              <strong style="color:#0A1F44; font-size:15px;">Lex Vanguard Chambers Administration</strong>
            </div>

            <div style="margin-top:20px; font-size:12px; color:#888888; font-style:italic; letter-spacing:0.4px;">
              Excellence in Advocacy &bull; Integrity in Service &bull; Innovation in Practice
            </div>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>
`;

      let sendResult = await resend.emails.send({
        from: "Lex Vanguard Chambers <onboarding@lexshub.xyz>",
        to: [email.trim()],
        subject: "Official Invitation to Join Lex Vanguard Chambers as Counsel",
        html: htmlContent,
      });

      if (sendResult.error) {
        console.warn("Primary domain send notice:", sendResult.error.message);
        // Retry via Resend default sandbox sender
        sendResult = await resend.emails.send({
          from: "Lex Vanguard Chambers <onboarding@resend.dev>",
          to: [email.trim()],
          subject: "Official Invitation to Join Lex Vanguard Chambers as Counsel",
          html: htmlContent,
        });
      }

      if (sendResult.error) {
        console.warn("Resend email delivery notice:", sendResult.error.message);
        // Even if direct SMTP delivery fails (e.g. domain verification or recipient testing limits), return success with the activation URL
        return res.json({
          success: true,
          emailDispatched: false,
          inviteUrl,
          message: `Invitation generated! Note: ${sendResult.error.message}. You can copy the activation link below.`,
          data: sendResult.data
        });
      }

      return res.json({
        success: true,
        emailDispatched: true,
        inviteUrl,
        message: "Invitation email dispatched successfully via Resend",
        data: sendResult.data
      });
    } catch (err: any) {
      console.error("Resend API Exception:", err);
      return res.status(500).json({
        success: false,
        error: err?.message || "An unexpected server error occurred while sending the email."
      });
    }
  });

  // LexAI Legal Research API endpoint powered by Gemini with Google Search Grounding
  app.post("/api/lexai", async (req, res) => {
    try {
      const { query, matterTitle, caseContext } = req.body;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Legal query parameter is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          answer: `LexAI Statutory & Case Law Research for "${query}":\n\n• Legal Framework: Laws of Kenya & Constitution of Kenya 2010.\n• Precedents: Relevant authority under the High Court, Court of Appeal, and Supreme Court of Kenya.\n• Note: Configure GEMINI_API_KEY in environment for live AI search-grounded legal research.`,
          sources: []
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const promptText = `You are LexAI, an elite legal research co-helper for LexVanguard Chambers.
${matterTitle ? `Case / Matter Context: ${matterTitle}` : ""}
${caseContext ? `Case Facts & Context: ${caseContext}` : ""}

Research Query: ${query}

Provide a comprehensive, authoritative legal research response. Include:
1. Core Legal Principles & Statutory Provisions (citing specific sections from Constitution of Kenya 2010, Civil Procedure Act, Companies Act, Data Protection Act, Evidence Act, or relevant legal codes).
2. Key Judicial Precedents & Ratio Decidendi (referencing High Court, Court of Appeal, or Supreme Court decisions).
3. Strategic Legal Analysis & Recommendations for Counsel.
4. Summary Arguments to present in court or advisory brief.

Use Google Search grounding to retrieve real-time authentic precedents, statutory citations, and court rulings. Format with clear headings and bullet points.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: promptText,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const text = response.text || "No specific legal research result generated.";
      
      // Extract grounding source citations
      const sources: Array<{ title: string; uri: string }> = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (Array.isArray(chunks)) {
        chunks.forEach((chunk: any) => {
          if (chunk?.web?.uri) {
            sources.push({
              title: chunk.web.title || chunk.web.uri,
              uri: chunk.web.uri
            });
          }
        });
      }

      return res.json({ answer: text, sources });
    } catch (error: any) {
      console.error("LexAI Error:", error);
      return res.status(500).json({ 
        error: "Failed to process legal research query",
        details: error.message 
      });
    }
  });

  // API Endpoint: Document Analysis & Case Material Review
  app.post("/api/research/analyze-document", async (req, res) => {
    try {
      const { documentTitle, documentContent, matterTitle } = req.body;
      if (!documentContent || typeof documentContent !== "string") {
        return res.status(400).json({ error: "Document content is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          analysis: `Document Analysis for "${documentTitle || 'Legal Material'}":\n\n1. Key Facts: Document contains legal arguments or evidence for ${matterTitle || 'active case'}.\n2. Applicable Statutes: Civil Procedure Act & Evidence Act Cap 80.\n3. Note: Attach GEMINI_API_KEY for complete AI legal breakdown.`
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const promptText = `You are a Senior Legal Analyst for LexVanguard Chambers.
Analyze the following case document/material for ${matterTitle ? `Matter: "${matterTitle}"` : "the firm's legal file"}.

Document Title: ${documentTitle || "Case Document"}
Document Content:
"""
${documentContent}
"""

Please provide a structured legal analysis report:
1. Executive Summary & Core Objective of the Document
2. Key Material Facts & Admissions
3. Statutory & Precedent Foundations
4. Potential Vulnerabilities & Opposing Counter-Arguments
5. Recommended Follow-Up Actions & Evidence Gathering`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: promptText,
      });

      return res.json({ analysis: response.text || "Analysis completed." });
    } catch (error: any) {
      console.error("Document Analysis Error:", error);
      return res.status(500).json({ error: "Failed to analyze legal document", details: error.message });
    }
  });

  // API Endpoint: Draft Court Submissions & Briefs
  app.post("/api/research/draft-submission", async (req, res) => {
    try {
      const { submissionType, matterTitle, clientName, facts, researchNotes, courtForum } = req.body;
      if (!submissionType || !matterTitle) {
        return res.status(400).json({ error: "Submission type and matter title are required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          draft: `IN THE ${courtForum || "HIGH COURT OF KENYA"}\n\nMATTER: ${matterTitle}\nCLIENT: ${clientName || "Client"}\n\n[DRAFT ${submissionType.toUpperCase()}]\n\n1. Take notice that the Applicant intends to move this Honorable Court for orders under the Civil Procedure Rules.\n2. Ground 1: Based on established statutory authorities.\n\n(Configure GEMINI_API_KEY for full AI submission drafting)`
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const promptText = `You are a Master Legal Drafter at LexVanguard Chambers.
Draft a complete, formal, highly detailed ${submissionType} for court filing or legal client advisory.

CASE DETAILS:
- Court / Forum: ${courtForum || "High Court of Kenya"}
- Matter Title: ${matterTitle}
- Client Name: ${clientName || "The Client / Applicant"}
- Background Facts: ${facts || "As set out in the pleadings and supporting affidavit."}
- Legal Research & Precedent Notes: ${researchNotes || "Standard statutory requirements under Kenyan law."}

DRAFTING INSTRUCTIONS:
- Use formal legal court language, standard numbering, statutory citations, and formal preamble (IN THE COURT OF...).
- Include specific legal grounds, statutory sections, and case citations (using Google Search grounding if needed for real citations).
- Provide a clear, comprehensive "PRAYER FOR RELIEF" or "LEGAL CONCLUSION" section.
- Formatted in clear Markdown suitable for copying directly into court filings or word processors.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: promptText,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      return res.json({ draft: response.text || "Submission draft created." });
    } catch (error: any) {
      console.error("Drafting Error:", error);
      return res.status(500).json({ error: "Failed to generate submission draft", details: error.message });
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
