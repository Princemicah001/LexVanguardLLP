import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { subscribeFirestoreMembers, FirestoreMember } from "@/lib/users";
import { 
  subscribeMessages, addDirectMessage, deleteDirectMessage, DirectMessage, 
  subscribeMatters, ChambersMatter,
  subscribeDocs, ChambersDocument 
} from "@/lib/office-store";
import { 
  MessageSquare, Send, Paperclip, Briefcase, Trash2, Search, UserCheck, 
  CheckCircle2, Clock, FileText, ChevronRight, Share2, Sparkles, User
} from "lucide-react";

export const ChambersDirectMessages: React.FC = () => {
  const { firmUser, firebaseUser } = useAuth();
  const [members, setMembers] = useState<FirestoreMember[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [matters, setMatters] = useState<ChambersMatter[]>([]);
  const [docs, setDocs] = useState<ChambersDocument[]>([]);

  const [selectedRecipientUid, setSelectedRecipientUid] = useState<string>("all");
  const [searchMember, setSearchMember] = useState("");
  const [newMsgText, setNewMsgText] = useState("");
  const [selectedMatterId, setSelectedMatterId] = useState<string>("");
  const [selectedDocTitle, setSelectedDocTitle] = useState<string>("");
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  useEffect(() => {
    const unsubMembers = subscribeFirestoreMembers((list) => setMembers(list));
    const unsubMsgs = subscribeMessages((list) => setMessages(list));
    const unsubMatters = subscribeMatters((list) => setMatters(list));
    const unsubDocs = subscribeDocs((list) => setDocs(list));

    return () => {
      unsubMembers();
      unsubMsgs();
      unsubMatters();
      unsubDocs();
    };
  }, []);

  const currentUid = firmUser?.id || firebaseUser?.uid || "current_user";
  const currentName = firmUser?.name || "Counsel Member";

  // Filter messages relevant to current selection
  const activeChatMessages = messages.filter((m) => {
    if (selectedRecipientUid === "all") {
      return m.recipientUid === "all";
    }
    return (
      (m.senderUid === currentUid && m.recipientUid === selectedRecipientUid) ||
      (m.senderUid === selectedRecipientUid && m.recipientUid === currentUid)
    );
  }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const activeRecipient = members.find((m) => m.uid === selectedRecipientUid);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgText.trim() && !selectedMatterId && !selectedDocTitle) return;

    const linkedMatter = matters.find((m) => m.id === selectedMatterId);

    await addDirectMessage({
      senderUid: currentUid,
      senderName: currentName,
      recipientUid: selectedRecipientUid,
      recipientName: selectedRecipientUid === "all" ? "All Counsel" : (activeRecipient?.name || "Counsel"),
      content: newMsgText.trim(),
      matterId: linkedMatter?.id,
      matterTitle: linkedMatter?.title,
      resourceTitle: selectedDocTitle || undefined,
      resourceUrl: selectedDocTitle ? `#vault-${selectedDocTitle}` : undefined
    });

    setNewMsgText("");
    setSelectedMatterId("");
    setSelectedDocTitle("");
    setShowAttachMenu(false);
  };

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchMember.toLowerCase()) ||
    (m.title && m.title.toLowerCase().includes(searchMember.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-[680px]">
      {/* MEMBER DIRECTORY / CHAT THREADS LIST */}
      <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50 shrink-0">
        <div className="p-3 border-b border-slate-200 bg-white">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-800" />
            Direct Messages
          </h2>
          <div className="relative mt-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search counsel..."
              value={searchMember}
              onChange={(e) => setSearchMember(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {/* ALL COUNSEL CHANNEL */}
          <button
            onClick={() => setSelectedRecipientUid("all")}
            className={`w-full p-3 text-left transition flex items-center gap-3 ${
              selectedRecipientUid === "all"
                ? "bg-slate-900 text-white font-medium"
                : "hover:bg-slate-100 text-slate-700"
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              selectedRecipientUid === "all" ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-amber-400"
            }`}>
              ALL
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-xs truncate">Chambers General</span>
                <span className="text-[10px] opacity-70">Group</span>
              </div>
            </div>
          </button>

          {/* INDIVIDUAL MEMBERS */}
          {filteredMembers.map((m) => {
            if (m.uid === currentUid) return null; // Don't DM yourself
            const isSelected = selectedRecipientUid === m.uid;
            
            // Get last message with this user
            const lastMsg = messages.filter((msg) =>
              (msg.senderUid === currentUid && msg.recipientUid === m.uid) ||
              (msg.senderUid === m.uid && msg.recipientUid === currentUid)
            ).pop();

            return (
              <button
                key={m.uid}
                onClick={() => setSelectedRecipientUid(m.uid)}
                className={`w-full p-3.5 text-left transition flex items-center gap-3 ${
                  isSelected ? "bg-slate-900 text-white font-medium" : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                <div className="relative shrink-0">
                  {m.image || m.profilePhoto ? (
                    <img
                      src={m.image || m.profilePhoto}
                      alt={m.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-300"
                    />
                  ) : (
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                      isSelected ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"
                    }`}>
                      {m.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-xs truncate">{m.name}</span>
                    {lastMsg && <span className="text-[10px] opacity-60">{lastMsg.timeFormatted}</span>}
                  </div>
                  <p className="text-[10px] opacity-75 truncate">{m.title || "Counsel"}</p>
                  {lastMsg && (
                    <p className="text-[11px] truncate opacity-60 mt-0.5 italic">
                      {lastMsg.senderUid === currentUid ? "You: " : ""}{lastMsg.content || (lastMsg.matterTitle ? "Shared case link" : "Attachment")}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* CHAT MESSAGES WINDOW */}
      <div className="flex-1 flex flex-col bg-slate-50/50">
        {/* CHAT HEADER */}
        <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs">
              {selectedRecipientUid === "all" ? "ALL" : activeRecipient?.name.slice(0, 2).toUpperCase() || "CN"}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                {selectedRecipientUid === "all" ? "Chambers General Channel" : activeRecipient?.name}
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <UserCheck className="w-3 h-3" /> Active Now
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {selectedRecipientUid === "all"
                  ? "Firm-wide collaborative workspace & announcements"
                  : `${activeRecipient?.title || "Counsel"} • ${activeRecipient?.practice || "Legal Advisory"}`}
              </p>
            </div>
          </div>
        </div>

        {/* MESSAGES LIST */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
          {activeChatMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <MessageSquare className="w-10 h-10 mb-2 opacity-40 text-slate-500" />
              <p className="font-semibold text-slate-600 text-sm">No messages yet in this conversation</p>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Start collaboration by typing a message, attaching a case matter, or sharing a document resource below.
              </p>
            </div>
          ) : (
            activeChatMessages.map((msg) => {
              const isMe = msg.senderUid === currentUid;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-slate-700">{msg.senderName}</span>
                    <span className="text-[10px] text-slate-400">{msg.timeFormatted}</span>
                  </div>

                  <div className={`max-w-md rounded-2xl p-3.5 text-xs shadow-2xs ${
                    isMe
                      ? "bg-slate-900 text-white rounded-br-xs"
                      : "bg-white border border-slate-200 text-slate-800 rounded-bl-xs"
                  }`}>
                    {/* LINKED CASE MATTER BADGE */}
                    {msg.matterTitle && (
                      <div className={`mb-2 p-2 rounded-lg border text-[11px] flex items-center gap-2 ${
                        isMe ? "bg-slate-800 border-slate-700 text-amber-300" : "bg-amber-50 border-amber-200 text-amber-900"
                      }`}>
                        <Briefcase className="w-3.5 h-3.5 shrink-0" />
                        <div>
                          <span className="font-bold block">Case Matter: {msg.matterTitle}</span>
                        </div>
                      </div>
                    )}

                    {/* RESOURCE ATTACHMENT BADGE */}
                    {msg.resourceTitle && (
                      <div className={`mb-2 p-2 rounded-lg border text-[11px] flex items-center gap-2 ${
                        isMe ? "bg-slate-800 border-slate-700 text-blue-200" : "bg-blue-50 border-blue-200 text-blue-900"
                      }`}>
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-bold">Attached Resource: {msg.resourceTitle}</span>
                      </div>
                    )}

                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                    {/* DELETE BUTTON IF MY MESSAGE */}
                    {isMe && (
                      <button
                        onClick={() => deleteDirectMessage(msg.id)}
                        className="mt-1 text-[10px] text-slate-400 hover:text-rose-400 transition flex items-center gap-1 opacity-60 hover:opacity-100"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ATTACHMENT / LINK CASE OPTIONS BAR */}
        {showAttachMenu && (
          <div className="p-3 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row gap-3 text-xs">
            <div className="flex-1">
              <label className="font-bold text-slate-700 block mb-1">Link Case / Matter:</label>
              <select
                value={selectedMatterId}
                onChange={(e) => setSelectedMatterId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-800"
              >
                <option value="">-- No linked case --</option>
                {matters.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({m.client})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="font-bold text-slate-700 block mb-1">Share Document Resource:</label>
              <select
                value={selectedDocTitle}
                onChange={(e) => setSelectedDocTitle(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-800"
              >
                <option value="">-- No resource attachment --</option>
                {docs.map((d) => (
                  <option key={d.id} value={d.title}>
                    {d.title} ({d.type})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* INPUT FORM */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 transition ${
              showAttachMenu || selectedMatterId || selectedDocTitle
                ? "bg-amber-100 border-amber-300 text-amber-900"
                : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
            }`}
            title="Attach case or document"
          >
            <Paperclip className="w-4 h-4" />
            <span className="hidden sm:inline">Attach Resource</span>
          </button>

          <input
            type="text"
            placeholder={`Message ${selectedRecipientUid === "all" ? "all counsel..." : activeRecipient?.name + "..."}`}
            value={newMsgText}
            onChange={(e) => setNewMsgText(e.target.value)}
            className="flex-1 px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />

          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 shrink-0"
          >
            Send <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
