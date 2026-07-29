import { useState } from "react";
import { X, Loader2, Send, Check, Copy } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { sendTeamMemberInvite } from "@/lib/invitation-store";

interface InviteModalProps {
  onClose: () => void;
}

export function InviteModal({ onClose }: InviteModalProps) {
  const { firmUser } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ inviteUrl: string; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setError("");
      setLoading(true);

      const invitedBy = firmUser?.name || "Kelvin Musya";
      const invitedByEmail = firmUser?.email || "kelvin@lexvanguard.edu";

      const res = await sendTeamMemberInvite({
        email: email.trim(),
        name: name.trim(),
        invitedBy,
        invitedByEmail
      });

      setResult({
        inviteUrl: res.inviteUrl,
        message: res.message
      });
    } catch (err: any) {
      setError(err?.message || "Failed to send invitation. Please check the email address and try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result?.inviteUrl) return;
    navigator.clipboard.writeText(result.inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden text-gray-900">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-base text-gray-900">Invite Team Member</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {!result ? (
            <form onSubmit={handleSend} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Invitee Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Evans Ojiambo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm px-3.5 py-2 rounded-lg focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Invitee Email Address *
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

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Invitation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-emerald-50 text-emerald-800 text-xs p-3.5 rounded-lg">
                Invitation sent successfully!
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Activation Link
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={result.inviteUrl}
                    className="flex-1 bg-gray-50 border border-gray-200 text-gray-800 text-xs px-3 py-2 rounded-lg font-mono"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="bg-gray-900 text-white px-3 py-2 text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors shrink-0 flex items-center space-x-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={onClose}
                  className="bg-gray-100 text-gray-800 px-4 py-2 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
