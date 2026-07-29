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

  // 2. Dispatch email strictly via Resend API (/api/send-invite) on lexshub.xyz
  let emailDispatched = false;
  let resendError = "";

  try {
    const apiRes = await fetch("/api/send-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: cleanEmail,
        name: name?.trim() || "Counsel",
        invitedBy: invitedBy || "Kelvin Musya",
        invitedByEmail: invitedByEmail || "kelvin@lexvanguard.edu",
        inviteUrl
      })
    });

    const data = await apiRes.json().catch(() => ({}));

    if (apiRes.ok && data.success) {
      emailDispatched = true;
    } else {
      resendError = data.error || `Email service error (HTTP ${apiRes.status})`;
      console.error("Resend dispatch failed:", resendError);
    }
  } catch (err: any) {
    resendError = err.message || "Failed to communicate with invitation server.";
    console.error("Failed to reach invitation dispatch server endpoint:", err);
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
