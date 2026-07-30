import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { saveProfile } from "@/lib/profile-store";
import { verifyInvitation, markInvitationAccepted } from "@/lib/invitation-store";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function RegisterPage() {
  const [, setLocation] = useLocation();

  const [inviteToken, setInviteToken] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [title, setTitle] = useState("Counsel");
  const [practice, setPractice] = useState("Legal Counsel & Advisory");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const qEmail = searchParams.get("email") || "";
      const qToken = searchParams.get("token") || "";

      if (qEmail) setEmail(qEmail);
      if (qToken) {
        setInviteToken(qToken);
        verifyInvitation(qToken, qEmail).then((inv) => {
          if (inv?.name && inv.name !== "Legal Counsel") {
            setName(inv.name);
          }
        });
      }
    } catch {}
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setError("");
      setLoading(true);

      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const uid = userCredential.user.uid;
      const canonicalEmail = email.trim().toLowerCase();
      const emailKey = canonicalEmail.replace(/[^a-z0-9]/g, "_");

      const finalTitle = title.trim() || "Counsel";
      const finalPractice = practice.trim() || "Legal Counsel & Advisory";
      const avatarSvg = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

      // 2. Prepare userProfiles payload (includes profile info & photo)
      const userProfilePayload = {
        uid,
        name: name.trim(),
        displayName: name.trim(),
        email: canonicalEmail,
        title: finalTitle,
        practice: finalPractice,
        phone: phone.trim(),
        education: "LLB, High Court Advocate",
        achievements: "Legal Counsel",
        bio: `${finalTitle} specializing in ${finalPractice}.`,
        officeId: "counsel",
        profilePhoto: avatarSvg,
        image: avatarSvg,
        photoURL: avatarSvg,
        avatar: avatarSvg,
        updatedAt: new Date().toISOString()
      };

      // 3. Prepare users payload (office assignment & roles)
      const usersPayload = {
        uid,
        name: name.trim(),
        displayName: name.trim(),
        email: canonicalEmail,
        title: finalTitle,
        practice: finalPractice,
        officeId: "counsel",
        roleLevel: 50,
        roleName: "Counsel",
        updatedAt: new Date().toISOString()
      };

      // 4. Save to Firestore
      if (db) {
        await setDoc(doc(db, "userProfiles", uid), userProfilePayload, { merge: true });
        await setDoc(doc(db, "userProfiles", emailKey), userProfilePayload, { merge: true });

        await setDoc(doc(db, "users", uid), usersPayload, { merge: true });
        await setDoc(doc(db, "users", emailKey), usersPayload, { merge: true });
      }

      // 5. Local store backup
      saveProfile({
        name: name.trim(),
        title: finalTitle,
        practice: finalPractice,
        bio: `${finalTitle} specializing in ${finalPractice}.`,
        phone: phone.trim(),
        email: canonicalEmail,
        education: "LLB, High Court Advocate",
        achievements: "Legal Counsel",
        image: avatarSvg,
        profilePhoto: avatarSvg
      });

      if (inviteToken) {
        await markInvitationAccepted(inviteToken);
      }

      setSuccess(true);
      setTimeout(() => {
        setLocation("/office/counsel");
      }, 1200);

    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("An account with this email address already exists. Please sign in.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err.message || "Failed to create account.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 py-24">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          
          <div className="bg-[#FAF8F5] border border-amber-200/60 p-5 rounded-lg mb-6 flex flex-col items-center text-center shadow-2xs">
            <div className="w-36 h-36 md:w-40 md:h-40 mb-3 overflow-hidden">
              <img src="/brand-logo.svg" alt="LexVanguard Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-lg font-serif font-extrabold text-[#0A1F44] uppercase tracking-[0.2em] leading-tight">
              LEXVANGUARD
            </h1>
            <span className="text-[9px] font-bold text-[#0A1F44]/80 uppercase tracking-[0.25em] mt-0.5">
              ADVOCATES LLP
            </span>
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Counsel Account Registration
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Enter your information to register your LexVanguard Advocates counsel portal account.
            </p>
          </div>

          {success ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-lg text-center">
              Account created successfully! Redirecting to Counsel Office...
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Evans Ojiambo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm px-3.5 py-2 rounded-lg focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. evans@lexvanguard.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm px-3.5 py-2 rounded-lg focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Professional Title
                </label>
                <input
                  type="text"
                  placeholder="Counsel"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm px-3.5 py-2 rounded-lg focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Practice Speciality
                </label>
                <input
                  type="text"
                  placeholder="Legal Counsel & Advisory"
                  value={practice}
                  onChange={(e) => setPractice(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm px-3.5 py-2 rounded-lg focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+254 700 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm px-3.5 py-2 rounded-lg focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <a href="/login" className="text-xs text-indigo-600 hover:underline">
                  Already registered? Sign in
                </a>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Creating Account..." : "Complete Registration"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
