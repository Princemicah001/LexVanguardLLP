import React, { useState, useEffect } from "react";
import { subscribeFirestoreMembers, FirestoreMember, getMemberRank, ROLES } from "@/lib/users";
import { subscribeLogs, ActivityLog } from "@/lib/office-store";
import { 
  ShieldCheck, Users, UserPlus, Key, Building, Settings, Search, 
  CheckCircle2, AlertTriangle, ShieldAlert, Lock, Unlock, Edit3, UserCheck, 
  FileText, Activity, Layers, ArrowUpRight
} from "lucide-react";
import { InviteModal } from "@/components/InviteModal";

export const ChambersAdminSuite: React.FC = () => {
  const [members, setMembers] = useState<FirestoreMember[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [searchMember, setSearchMember] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingMember, setEditingMember] = useState<FirestoreMember | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editPractice, setEditPractice] = useState("");
  const [editOffice, setEditOffice] = useState("");
  const [editRoleName, setEditRoleName] = useState("Counsel");

  useEffect(() => {
    const unsubMembers = subscribeFirestoreMembers((list) => setMembers(list));
    const unsubLogs = subscribeLogs((list) => setLogs(list));
    return () => {
      unsubMembers();
      unsubLogs();
    };
  }, []);

  const handleOpenEdit = (m: FirestoreMember) => {
    setEditingMember(m);
    setEditTitle(m.title || "Counsel");
    setEditPractice(m.practice || "Legal Counsel");
    setEditOffice(m.officeId || "counsel");
  };

  const handleSaveMemberEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    setMembers((prev) =>
      prev.map((m) =>
        m.uid === editingMember.uid
          ? {
              ...m,
              title: editTitle,
              practice: editPractice,
              officeId: editOffice
            }
          : m
      )
    );

    setEditingMember(null);
    alert(`Member permissions & title updated for ${editingMember.name}`);
  };

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchMember.toLowerCase()) ||
    (m.title && m.title.toLowerCase().includes(searchMember.toLowerCase())) ||
    (m.email && m.email.toLowerCase().includes(searchMember.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* GOVERNANCE SUMMARY HEADER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Governance Level</span>
            <span className="text-lg font-bold text-slate-900">Managing Admin</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Total Firm Members</span>
            <span className="text-lg font-bold text-slate-900">{members.length} Active Staff</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Chambers Offices</span>
            <span className="text-lg font-bold text-slate-900">6 Allocated</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">System Audit Logs</span>
            <span className="text-lg font-bold text-slate-900">{logs.length} Recorded</span>
          </div>
        </div>
      </div>

      {/* MEMBER & AUTHORIZATION MANAGEMENT */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pb-3 border-b border-slate-200">
          <div>
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Key className="w-4 h-4 text-slate-800" />
              Personnel Directory & Roles
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <button
              onClick={() => setShowInviteModal(true)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" /> Invite Member
            </button>
          </div>
        </div>

        {/* STAFF MEMBERS TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Staff Member</th>
                <th className="p-3">Title & Hierarchy</th>
                <th className="p-3">Practice Area</th>
                <th className="p-3">Assigned Office</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredMembers.map((m) => {
                const rank = getMemberRank(m);
                return (
                  <tr key={m.uid} className="hover:bg-slate-50 transition">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-xs shrink-0">
                          {m.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold block text-slate-900">{m.name}</span>
                          <span className="text-[10px] text-slate-400">{m.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="font-semibold block text-slate-900">{m.title || "Counsel"}</span>
                      <span className="inline-block mt-0.5 px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono font-bold rounded">
                        Rank Level {rank}
                      </span>
                    </td>

                    <td className="p-3 text-slate-600 font-medium">
                      {m.practice || "General Legal Practice"}
                    </td>

                    <td className="p-3 font-mono font-bold text-slate-800">
                      /{m.officeId || "counsel"}
                    </td>

                    <td className="p-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <UserCheck className="w-3 h-3" /> Active
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded text-[11px] inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" /> Permissions
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CHAMBERS OFFICE ROOMS ALLOCATION */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h3 className="font-serif font-bold text-slate-900 text-base flex items-center gap-2">
          <Building className="w-4 h-4 text-slate-800" />
          Chambers Rooms & Executive Suite Allocation
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900 text-sm">Managing Partner's Office</span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] rounded">/prince</span>
            </div>
            <p className="text-slate-500">Lead Counsel: Prince Micah</p>
            <p className="text-slate-400">Scope: Corporate & Tech Law, M&A Pipeline, Executive Firm Governance</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900 text-sm">Senior Partner's Chambers</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-bold text-[10px] rounded">/kelvin</span>
            </div>
            <p className="text-slate-500">Lead Counsel: Kelvin Musya</p>
            <p className="text-slate-400">Scope: Supreme Court Appeals, Constitutional Briefs, High Court Litigation</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900 text-sm">Head of IP Chambers</span>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-900 font-bold text-[10px] rounded">/donel</span>
            </div>
            <p className="text-slate-500">Lead Counsel: Donel Aganyo</p>
            <p className="text-slate-400">Scope: ARIPO Patent Registrations, Trademark Prosecution, IP Advisory</p>
          </div>
        </div>
      </div>

      {/* EDIT MEMBER PERMISSIONS MODAL */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 w-full max-w-md space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b pb-2">
              Edit Permissions: {editingMember.name}
            </h3>

            <form onSubmit={handleSaveMemberEdit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Title:</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Practice Specialization:</label>
                <input
                  type="text"
                  value={editPractice}
                  onChange={(e) => setEditPractice(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Chambers Office Route:</label>
                <select
                  value={editOffice}
                  onChange={(e) => setEditOffice(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="prince">Managing Partner Office (/prince)</option>
                  <option value="kelvin">Senior Partner Chambers (/kelvin)</option>
                  <option value="donel">IP Chambers (/donel)</option>
                  <option value="linet">Commercial & Finance Office (/linet)</option>
                  <option value="sharon">Research & Policy Office (/sharon)</option>
                  <option value="counsel">General Counsel Chambers (/counsel)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVITE MODAL */}
      {showInviteModal && <InviteModal onClose={() => setShowInviteModal(false)} />}
    </div>
  );
};
