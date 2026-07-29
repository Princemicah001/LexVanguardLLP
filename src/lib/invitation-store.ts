import { collection, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface TeamInvitation {
  id: string;
  email: string;
  name?: string;
  invitedBy: string;
  invitedByEmail: string;
  officeId: string;
  roleName: string;
  roleLevel: number;
  token: string;
  status: "pending" | "accepted";
  createdAt: string;
}

export async function sendTeamMemberInvite({
  email,
  name,
  invitedBy,
  invitedByEmail
}: {
  email: string;
  name?: string;
  invitedBy: string;
  invitedByEmail: string;
}): Promise<{ success: boolean; inviteUrl: string; message: string }> {
  const cleanEmail = email.toLowerCase().trim();
  const token = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://lexvanguard.edu";
  const inviteUrl = `${baseUrl}/register?email=${encodeURIComponent(cleanEmail)}&token=${token}`;

  const invitation: TeamInvitation = {
    id: token,
    email: cleanEmail,
    name: name?.trim() || "Legal Counsel",
    invitedBy,
    invitedByEmail,
    officeId: "counsel",
    roleName: "Counsel",
    roleLevel: 50,
    token,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  // 1. Save invitation record to Firestore
  try {
    if (db) {
      const invRef = doc(db, "invitations", token);
      await setDoc(invRef, invitation);

      // Also index by email
      const emailKey = cleanEmail.replace(/[^a-z0-9]/g, "_");
      await setDoc(doc(db, "invitations_by_email", emailKey), invitation);
    }
  } catch (err) {
    console.warn("Could not save invitation to Firestore:", err);
  }

  // 2. Dispatch email via Resend API (/api/send-invite) with direct Resend client fallback for static custom domain hosts
  let emailDispatched = false;
  let resendError = "";

  const payload = {
    email: cleanEmail,
    name: name?.trim() || "Counsel",
    invitedBy: invitedBy || "Kelvin Musya",
    invitedByEmail: invitedByEmail || "kelvin@lexvanguard.edu",
    inviteUrl
  };

  try {
    const apiRes = await fetch("/api/send-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await apiRes.json().catch(() => ({}));

    if (apiRes.ok && data.success) {
      emailDispatched = true;
    } else if (apiRes.status === 405 || apiRes.status === 404) {
      // If hosted on a static web host (e.g. lexvanguard.lexshub.xyz) where POST /api/send-invite returns 405, fallback to direct Resend API
      try {
        emailDispatched = await sendEmailViaResendDirectly(payload);
      } catch (fbErr: any) {
        resendError = fbErr.message || "Direct Resend dispatch failed.";
      }
    } else {
      resendError = data.error || `Email service error (HTTP ${apiRes.status})`;
      console.error("Resend dispatch notice:", resendError);
    }
  } catch (err: any) {
    try {
      emailDispatched = await sendEmailViaResendDirectly(payload);
    } catch (fbErr: any) {
      resendError = fbErr.message || err.message || "Failed to communicate with invitation server.";
      console.error("Failed to reach invitation dispatch server endpoint:", resendError);
    }
  }

  if (!emailDispatched && resendError) {
    throw new Error(resendError);
  }

  return {
    success: true,
    inviteUrl,
    message: `Invitation email dispatched via Resend (onboarding@lexshub.xyz) to ${cleanEmail}!`
  };

}

async function sendEmailViaResendDirectly({
  email,
  name,
  invitedBy,
  invitedByEmail,
  inviteUrl
}: {
  email: string;
  name: string;
  invitedBy: string;
  invitedByEmail: string;
  inviteUrl: string;
}): Promise<boolean> {
  const apiKey = import.meta.env.VITE_RESEND_API_KEY || "";
  if (!apiKey) {
    throw new Error("VITE_RESEND_API_KEY environment variable is missing.");
  }
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
        <tr>
          <td style="padding:45px 40px; line-height:1.8; font-size:15px; color:#333333;">
            <p style="margin:0 0 20px; font-size:17px; color:#0A1F44; font-weight:600;">
              Dear <strong>${name}</strong>,
            </p>
            <p style="margin:0 0 20px;">
              On behalf of <strong style="color:#0A1F44;">Lex Vanguard Chambers</strong>, we are pleased to extend this formal invitation for you to join the Firm as <strong>Counsel</strong>.
            </p>
            <p style="margin:0 0 20px;">
              This invitation has been issued by <strong>${invitedBy}</strong> (<a href="mailto:${invitedByEmail}" style="color:#0A1F44; text-decoration:none;">${invitedByEmail}</a>) following your nomination to become a member of our Chambers.
            </p>
            <div style="margin:30px 0; padding:28px; background-color:#fafafa; border-left:4px solid #C9A55C; border-radius:4px;">
              <p style="margin:0 0 14px; font-weight:600; color:#0A1F44;">
                To complete your onboarding, activate your account using the secure button below:
              </p>
              <div style="text-align:left; margin:25px 0 15px 0;">
                <a href="${inviteUrl}" target="_blank" style="background-color:#0A1F44; color:#ffffff; text-decoration:none; padding:15px 32px; border-radius:6px; font-weight:700; font-size:14px; display:inline-block; letter-spacing:0.5px; box-shadow:0 4px 12px rgba(10,31,68,0.2);">
                  Activate Your Counsel Account
                </a>
              </div>
              <p style="margin:15px 0 0 0; font-size:12px; color:#777777; word-break:break-all;">
                If the button above does not work, copy and paste this URL into your browser:<br>
                <a href="${inviteUrl}" style="color:#0A1F44;">${inviteUrl}</a>
              </p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:30px 40px; background-color:#fafafa; border-top:1px solid #ececec;">
            <div style="font-size:14px; line-height:1.7; color:#333333;">
              Kind regards,<br><br>
              <strong style="color:#0A1F44; font-size:15px;">Lex Vanguard Chambers Administration</strong>
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

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "Lex Vanguard Chambers <onboarding@lexshub.xyz>",
      to: [email],
      subject: "Official Invitation to Join Lex Vanguard Chambers as Counsel",
      html: htmlContent
    })
  });

  if (res.ok) {
    return true;
  }
  const errData = await res.json().catch(() => ({}));
  throw new Error(errData.message || errData.error || `Resend API error (HTTP ${res.status})`);
}

export async function verifyInvitation(token: string, email?: string): Promise<TeamInvitation | null> {
  if (!db) return null;
  try {
    if (token) {
      const invRef = doc(db, "invitations", token);
      const snap = await getDoc(invRef);
      if (snap.exists()) {
        return snap.data() as TeamInvitation;
      }
    }
    if (email) {
      const emailKey = email.toLowerCase().trim().replace(/[^a-z0-9]/g, "_");
      const invRef = doc(db, "invitations_by_email", emailKey);
      const snap = await getDoc(invRef);
      if (snap.exists()) {
        return snap.data() as TeamInvitation;
      }
    }
  } catch (err) {
    console.warn("Failed to verify invitation token:", err);
  }
  return null;
}

export async function markInvitationAccepted(token: string): Promise<void> {
  if (!db || !token) return;
  try {
    const invRef = doc(db, "invitations", token);
    await updateDoc(invRef, {
      status: "accepted",
      acceptedAt: new Date().toISOString()
    });
  } catch {}
}
