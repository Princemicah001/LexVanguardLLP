import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import Markdown from "react-markdown";
import { 
  LayoutDashboard, Search, Folder, FileText, User, ChevronRight, 
  Plus, Upload, Trash2, FolderOpen, Send, Scale, BookOpen, Link as LinkIcon,
  X, Check, FolderPlus, Save, Bot, Loader2, ArrowLeft, Shield, Sparkles, MessageSquare
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ChambersDirectMessages } from "@/components/ChambersDirectMessages";
import { 
  ChambersMatter, ChambersDocument,
  subscribeMatters, addMatter, 
  subscribeDocs, addDocument, deleteDocument,
  addResearchItem, addSubmission, addLog
} from "@/lib/office-store";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  sources?: { title: string; uri: string }[];
  isError?: boolean;
}

export default function ResearchCoHelperPage() {
  const { firmUser } = useAuth();
  const [, setLocation] = useLocation();

  const [activeTab, setActiveTab] = useState<"cases" | "research" | "resources" | "drafting" | "dms">("cases");
  
  // Real office matters and docs from store
  const [matters, setMatters] = useState<ChambersMatter[]>([]);
  const [documents, setDocuments] = useState<ChambersDocument[]>([]);
  
  // Active selected case
  const [selectedCase, setSelectedCase] = useState<ChambersMatter | null>(null);

  // New Case Modal / Form State
  const [isCreatingCase, setIsCreatingCase] = useState(false);
  const [newCaseTitle, setNewCaseTitle] = useState("");
  const [newCaseClient, setNewCaseClient] = useState("");

  // Research Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [attachedDocs, setAttachedDocs] = useState<ChambersDocument[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showResourcesPopover, setShowResourcesPopover] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Drafting State
  const [draftNotes, setDraftNotes] = useState("");
  const [draftOutput, setDraftOutput] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftSavedSuccess, setDraftSavedSuccess] = useState(false);

  // Subscribe to store
  useEffect(() => {
    const unsubMatters = subscribeMatters((data) => {
      setMatters(data);
      // Default to first case if none selected yet
      if (!selectedCase && data.length > 0) {
        setSelectedCase(data[0]);
      }
    });

    const unsubDocs = subscribeDocs((data) => {
      setDocuments(data);
    });

    return () => {
      unsubMatters();
      unsubDocs();
    };
  }, [selectedCase]);

  // Set initial welcome message when selected case changes
  useEffect(() => {
    if (selectedCase) {
      setChatMessages([
        {
          id: "msg_welcome",
          role: "model",
          text: `Hello Counsel. I am your **Legal Research Co-helper**. I have real-time access to statutory law and case judicial precedents via Google Search Grounding.\n\nHow can I assist you with **${selectedCase.title}** (${selectedCase.client})?`
        }
      ]);
      setAttachedDocs([]);
    }
  }, [selectedCase?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatLoading]);

  // Filter documents for current active case
  const caseDocuments = documents.filter(d => !selectedCase || d.officeId === selectedCase.officeId || d.officeId === "all");

  // Create new matter
  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseTitle.trim()) return;

    const created = await addMatter({
      officeId: firmUser?.officeId || "all",
      title: newCaseTitle.trim(),
      client: newCaseClient.trim() || "Private Client",
      status: "Active",
      urgency: "Medium",
      description: `Active litigation matter created for ${newCaseClient.trim() || "Private Client"}`
    });

    setSelectedCase(created);
    setNewCaseTitle("");
    setNewCaseClient("");
    setIsCreatingCase(false);
  };

  // Open case & jump to research tab
  const handleOpenCase = (matter: ChambersMatter) => {
    setSelectedCase(matter);
    setActiveTab("research");
  };

  // Attach doc to chat context
  const handleAttachDocument = (doc: ChambersDocument) => {
    if (!attachedDocs.some(d => d.id === doc.id)) {
      setAttachedDocs(prev => [...prev, doc]);
    }
    setShowResourcesPopover(false);
  };

  const handleRemoveAttachedDoc = (docId: string) => {
    setAttachedDocs(prev => prev.filter(d => d.id !== docId));
  };

  // Upload file to case resources
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let ext = file.name.split('.').pop()?.toUpperCase() || 'PDF';
      
      await addDocument({
        officeId: selectedCase ? selectedCase.officeId : (firmUser?.officeId || "all"),
        title: file.name,
        type: ext,
        uploadedBy: firmUser?.name || "Counsel",
        size: `${Math.round(file.size / 1024 * 10) / 10} KB`
      });
    }

    e.target.value = "";
  };

  // Delete case document
  const handleDeleteDoc = async (docId: string) => {
    await deleteDocument(docId);
    setAttachedDocs(prev => prev.filter(d => d.id !== docId));
  };

  // Send message to research AI endpoint
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputQuery.trim() && attachedDocs.length === 0) || isChatLoading) return;

    let fullPrompt = inputQuery.trim();
    if (attachedDocs.length > 0) {
      const docNames = attachedDocs.map(d => d.title).join(", ");
      fullPrompt = `[Attached Context Materials: ${docNames}]\n\n${fullPrompt}`;
    }

    const userMsgId = `usr_${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: "user",
      text: fullPrompt
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputQuery("");
    setAttachedDocs([]);
    setShowResourcesPopover(false);
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/lexai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: fullPrompt,
          matterTitle: selectedCase ? selectedCase.title : undefined,
          caseContext: selectedCase ? `Client: ${selectedCase.client} | Status: ${selectedCase.status}` : undefined
        })
      });

      const data = await response.json();

      if (data.answer) {
        const modelMsg: ChatMessage = {
          id: `ai_${Date.now()}`,
          role: "model",
          text: data.answer,
          sources: data.sources || []
        };
        setChatMessages(prev => [...prev, modelMsg]);

        // Auto-save research item to repository
        if (selectedCase) {
          addResearchItem({
            officeId: selectedCase.officeId,
            matterId: selectedCase.id,
            matterTitle: selectedCase.title,
            query: fullPrompt,
            summary: data.answer,
            sources: data.sources || [],
            createdByName: firmUser?.name || "Counsel"
          });
        }
      } else {
        throw new Error(data.error || "Failed to receive response");
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setChatMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "model",
          text: "There was a network or server error generating the legal research. Please check your query or environment key.",
          isError: true
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Handle Generate Draft
  const handleGenerateDraft = async () => {
    if (!draftNotes.trim() || isDrafting) return;
    setIsDrafting(true);
    setDraftOutput("");
    setDraftSavedSuccess(false);

    try {
      const response = await fetch("/api/research/draft-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionType: "Legal Brief & Court Submission",
          matterTitle: selectedCase ? selectedCase.title : "Matter Submission",
          clientName: selectedCase ? selectedCase.client : "The Client",
          facts: draftNotes,
          courtForum: "High Court of Kenya at Nairobi"
        })
      });

      const data = await response.json();
      if (data.draft) {
        setDraftOutput(data.draft);
      } else {
        setDraftOutput("Failed to generate draft text.");
      }
    } catch (err) {
      console.error("Drafting error:", err);
      setDraftOutput("Error occurred while generating legal draft submission.");
    } finally {
      setIsDrafting(false);
    }
  };

  // Save generated draft to case files & submissions store
  const handleSaveDraft = async () => {
    if (!draftOutput.trim() || !selectedCase) return;

    const draftTitle = `Legal Draft — ${selectedCase.title}`;

    await addSubmission({
      officeId: selectedCase.officeId,
      matterId: selectedCase.id,
      matterTitle: selectedCase.title,
      submissionType: "Court Submission",
      courtForum: "High Court of Kenya",
      title: draftTitle,
      content: draftOutput,
      createdByName: firmUser?.name || "Counsel",
      status: "Draft"
    });

    await addDocument({
      officeId: selectedCase.officeId,
      title: `${draftTitle}.md`,
      type: "Submission Draft",
      uploadedBy: firmUser?.name || "Counsel",
      size: `${Math.round(draftOutput.length / 1024 * 10) / 10} KB`
    });

    setDraftSavedSuccess(true);
    setTimeout(() => setDraftSavedSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* HEADER BAR */}
      <header className="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-20 shrink-0">
        <div className="w-full px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center py-2 sm:py-0 min-h-16 gap-2 sm:gap-4">
            
            {/* BRANDING & BACK */}
            <div className="flex items-center gap-3">
              <Link 
                href={firmUser ? `/office/${firmUser.officeId}` : "/"} 
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-2.5 py-1.5 rounded-lg transition shrink-0"
                title="Return to Office Dashboard"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Office</span>
              </Link>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Scale className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h1 className="font-sans font-bold text-sm sm:text-base text-slate-900 leading-none tracking-tight">
                    Legal Research Co-Helper
                  </h1>
                  <span className="text-[10px] font-medium text-slate-500 block mt-0.5">
                    Precedent Analysis & Workspace
                  </span>
                </div>
              </div>
            </div>

            {/* NAVIGATION TABS */}
            <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar py-1">
              <button 
                onClick={() => setActiveTab("cases")} 
                className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 ${
                  activeTab === "cases"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Cases</span>
              </button>

              <button 
                onClick={() => setActiveTab("research")} 
                className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 ${
                  activeTab === "research"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Research</span>
              </button>

              <button 
                onClick={() => setActiveTab("resources")} 
                className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 ${
                  activeTab === "resources"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Folder className="w-4 h-4" />
                <span>Resources</span>
              </button>

              <button 
                onClick={() => setActiveTab("drafting")} 
                className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 ${
                  activeTab === "drafting"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>Drafting</span>
              </button>

              <button 
                onClick={() => setActiveTab("dms")} 
                className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 ${
                  activeTab === "dms"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Direct DMs</span>
              </button>
            </nav>

            {/* USER & ACTIVE CASE STATUS */}
            <div className="flex items-center gap-3">
              {selectedCase && (
                <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-semibold text-slate-500">Active:</span>
                  <span className="max-w-[130px] truncate font-bold text-slate-800">{selectedCase.title}</span>
                </div>
              )}

              <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden md:inline">{firmUser?.name || "Counsel"}</span>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto lg:overflow-hidden relative p-3 sm:p-4 md:p-6">
        <div className="w-full h-full relative flex flex-col">

          {/* TAB: DIRECT MEMBER DMS */}
          {activeTab === "dms" && (
            <div className="h-full overflow-y-auto pb-6">
              <ChambersDirectMessages />
            </div>
          )}

          {/* TAB 1: CASES DIRECTORY */}
          {activeTab === "cases" && (
            <div className="space-y-6 overflow-y-auto h-full pb-10 pr-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Case Directory</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Manage active legal matters, upload resources, and start AI-assisted precedent research.
                  </p>
                </div>
                <button 
                  onClick={() => setIsCreatingCase(!isCreatingCase)} 
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold text-xs md:text-sm transition-all shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4" /> New Matter
                </button>
              </div>

              {/* NEW CASE FORM MODAL/DRAWER */}
              {isCreatingCase && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg animate-in fade-in slide-in-from-top-4">
                  <form onSubmit={handleCreateCase} className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Create New Practice Matter</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Matter Name / Reference</label>
                        <input 
                          type="text" 
                          value={newCaseTitle} 
                          onChange={(e) => setNewCaseTitle(e.target.value)} 
                          placeholder="e.g. Smith v. Jones (Property Dispute)" 
                          className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" 
                          required 
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Client Name</label>
                        <input 
                          type="text" 
                          value={newCaseClient} 
                          onChange={(e) => setNewCaseClient(e.target.value)} 
                          placeholder="e.g. Vanguard Acquisitions Ltd" 
                          className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" 
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button 
                        type="button" 
                        onClick={() => setIsCreatingCase(false)} 
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-semibold transition"
                      >
                        Create Matter
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* CASE CARDS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matters.map((c) => {
                  const isActive = selectedCase?.id === c.id;
                  const docCount = documents.filter(d => d.officeId === c.officeId || d.officeId === "all").length;

                  return (
                    <div 
                      key={c.id} 
                      className={`bg-white rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col group ${
                        isActive ? "border-blue-500 ring-2 ring-blue-500/20 shadow-md" : "border-slate-200"
                      }`}
                    >
                      <div className="p-6 flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${
                            c.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          }`}>
                            {c.status}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                            Client: {c.client}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
                          {c.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {c.description || `Urgency: ${c.urgency}`}
                        </p>
                      </div>

                      <div className="border-t border-slate-100 p-4 bg-gradient-to-b from-transparent to-slate-50 rounded-b-2xl flex justify-between items-center mt-auto">
                        <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                          <div className="p-1.5 bg-white rounded-md shadow-xs border border-slate-100">
                            <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
                          </div> 
                          {docCount} Docs
                        </div>
                        <button 
                          onClick={() => handleOpenCase(c)} 
                          className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Open <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: RESEARCH CHAT INTERFACE */}
          {activeTab === "research" && (
            <div className="h-full flex flex-col w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {!selectedCase ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4 p-8">
                  <FolderOpen className="w-12 h-12 text-slate-400" />
                  <p className="text-base font-semibold text-slate-700">Please select or create a case to start researching.</p>
                  <button onClick={() => setActiveTab("cases")} className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
                    Go to Case Directory
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
                  
                  {/* MESSAGES SCROLL AREA */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
                    {chatMessages.map((msg) => {
                      const isUser = msg.role === "user";

                      return (
                        <div key={msg.id} className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"} group`}>
                          {!isUser && (
                            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
                              <Scale className="w-4 h-4 text-blue-700" />
                            </div>
                          )}

                          <div className={`${
                            isUser 
                              ? "max-w-[85%] md:max-w-3xl bg-slate-900 text-white shadow-md rounded-2xl rounded-tr-[4px] px-5 py-4" 
                              : msg.isError 
                                ? "max-w-[85%] md:max-w-3xl bg-rose-50 text-rose-800 border border-rose-200 rounded-2xl rounded-tl-[4px] px-5 py-4" 
                                : "max-w-[85%] md:max-w-3xl bg-slate-50 border border-slate-200 text-slate-800 shadow-xs rounded-2xl rounded-tl-[4px] px-5 py-4 leading-relaxed"
                          }`}>
                            <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert">
                              {isUser ? (
                                <p className="text-white whitespace-pre-wrap">{msg.text}</p>
                              ) : (
                                <Markdown>{msg.text}</Markdown>
                              )}
                            </div>

                            {/* CITATION SOURCES */}
                            {msg.sources && msg.sources.length > 0 && (
                              <div className="mt-4 pt-3 border-t border-slate-200/80">
                                <div className="flex items-center gap-2 mb-2">
                                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Reference Sources & Cases
                                  </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {msg.sources.map((s, idx) => (
                                    <a 
                                      key={idx} 
                                      href={s.uri} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:text-blue-700 hover:border-blue-300 transition shadow-xs max-w-[280px]"
                                    >
                                      <LinkIcon className="w-3 h-3 text-slate-400 shrink-0" />
                                      <span className="truncate">{s.title}</span>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {isUser && (
                            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
                              <User className="w-4 h-4 text-slate-600" />
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {isChatLoading && (
                      <div className="flex gap-4 justify-start">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
                          <Scale className="w-4 h-4 text-blue-700" />
                        </div>
                        <div className="bg-white border border-slate-200 text-slate-500 rounded-2xl rounded-tl-[4px] px-5 py-4 flex items-center gap-3 shadow-xs">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          <span className="text-xs font-semibold text-slate-600">Researching Google precedent databases...</span>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* INPUT & ATTACHMENTS BAR */}
                  <div className="p-4 md:p-6 bg-white border-t border-slate-200 relative shrink-0">
                    
                    {/* RESOURCES POPOVER */}
                    {showResourcesPopover && (
                      <div className="absolute bottom-full left-4 mb-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-30">
                        <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                            <FolderOpen className="w-4 h-4 text-blue-600" /> Case Resources
                          </h4>
                          <button onClick={() => setShowResourcesPopover(false)} className="text-slate-400 hover:text-slate-600 p-1">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                          {caseDocuments.length === 0 ? (
                            <p className="text-xs text-slate-400 p-3 text-center">No documents in case file yet.</p>
                          ) : (
                            caseDocuments.map(doc => {
                              const isAttached = attachedDocs.some(d => d.id === doc.id);
                              return (
                                <div key={doc.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition">
                                  <div className="flex items-center gap-2 overflow-hidden pr-2">
                                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span className="text-xs font-medium text-slate-700 truncate">{doc.title}</span>
                                  </div>
                                  <button 
                                    onClick={() => handleAttachDocument(doc)} 
                                    disabled={isAttached} 
                                    className={`p-1.5 rounded-md text-xs transition ${
                                      isAttached ? "text-emerald-600 bg-emerald-50" : "text-slate-400 hover:text-blue-600 hover:bg-blue-100"
                                    }`}
                                  >
                                    {isAttached ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}

                    {/* ATTACHED DOCS PILLS */}
                    {attachedDocs.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {attachedDocs.map(doc => (
                          <div key={doc.id} className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                            <FileText className="w-3 h-3" />
                            <span className="max-w-[150px] truncate">{doc.title}</span>
                            <button onClick={() => handleRemoveAttachedDoc(doc.id)} className="hover:bg-blue-200 rounded-full p-0.5 ml-1">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* QUERY FORM */}
                    <form onSubmit={handleSendMessage} className="relative flex items-end gap-2 bg-slate-50 rounded-2xl border border-slate-200 p-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition shadow-inner">
                      <button 
                        type="button" 
                        onClick={() => setShowResourcesPopover(!showResourcesPopover)} 
                        className="p-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition shrink-0 mb-0.5" 
                        title="Attach Case Resource"
                      >
                        <FolderPlus className="w-4 h-4" />
                      </button>

                      <textarea 
                        value={inputQuery} 
                        onChange={(e) => setInputQuery(e.target.value)} 
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                        placeholder="Ask a question about statutory sections, precedents, or case law..." 
                        className="w-full bg-transparent border-none focus:ring-0 outline-none resize-none max-h-32 min-h-[44px] py-2 px-2 text-xs md:text-sm text-slate-800" 
                        rows={1} 
                      />

                      <button 
                        type="submit" 
                        disabled={isChatLoading || (!inputQuery.trim() && attachedDocs.length === 0)} 
                        className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 transition shadow-xs shrink-0 mb-0.5"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>

                    <div className="flex justify-between items-center mt-2.5 px-1 text-[11px] text-slate-400">
                      <span>Google Search Grounded Real-time Legal Analysis</span>
                      <span>Press <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded font-mono">Enter</kbd> to send</span>
                    </div>

                  </div>

                </div>
              )}
            </div>
          )}

          {/* TAB 3: CASE RESOURCES */}
          {activeTab === "resources" && (
            <div className="h-full flex flex-col space-y-6">
              {!selectedCase ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4 p-8">
                  <FolderOpen className="w-12 h-12 text-slate-400" />
                  <p className="text-base font-semibold text-slate-700">Please select a case to manage resources.</p>
                  <button onClick={() => setActiveTab("cases")} className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
                    Go to Case Directory
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Case Resources</h2>
                      <p className="text-sm text-slate-500 mt-1">
                        Manage documents and reference materials for <strong>{selectedCase.title}</strong>.
                      </p>
                    </div>
                    <div>
                      <input type="file" id="case-file-upload" className="hidden" multiple onChange={handleFileUpload} />
                      <button 
                        onClick={() => document.getElementById("case-file-upload")?.click()} 
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-xs md:text-sm transition shadow-sm"
                      >
                        <Upload className="w-4 h-4" /> Upload Files
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                    <div className="overflow-y-auto flex-1">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Document Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Type</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-40">Uploaded By</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right w-24">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {caseDocuments.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-6 py-16 text-center text-slate-500">
                                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                <p className="font-semibold text-slate-600 text-sm">No resources found.</p>
                                <p className="text-xs text-slate-400 mt-1">Upload documents to reference them in research.</p>
                              </td>
                            </tr>
                          ) : (
                            caseDocuments.map(doc => (
                              <tr key={doc.id} className="hover:bg-slate-50 transition group">
                                <td className="px-6 py-4 flex items-center gap-3">
                                  <div className="p-2 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg">
                                    <FileText className="w-4 h-4" />
                                  </div>
                                  <span className="font-semibold text-sm text-slate-800 truncate max-w-sm">{doc.title}</span>
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-500">
                                  <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-bold uppercase">{doc.type}</span>
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-500 font-medium">{doc.uploadedBy}</td>
                                <td className="px-6 py-4 text-right">
                                  <button 
                                    onClick={() => handleDeleteDoc(doc.id)} 
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" 
                                    title="Delete Document"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 4: DRAFTING WORKSPACE */}
          {activeTab === "drafting" && (
            <div className="h-full flex flex-col lg:flex-row gap-6">
              {/* LEFT PANEL: PARAMETERS */}
              <div className="w-full lg:w-1/3 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col shrink-0 overflow-y-auto">
                <h2 className="text-xl font-bold text-slate-900 mb-1">Drafting Parameters</h2>
                <p className="text-xs text-slate-500 mb-6">
                  Provide notes, facts, and intended arguments. The AI will structure them into a formal legal draft submission.
                </p>

                <div className="space-y-4 flex-1 flex flex-col">
                  <div className="flex-1 flex flex-col min-h-[220px]">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Rough Notes & Key Points
                    </label>
                    <textarea 
                      value={draftNotes} 
                      onChange={(e) => setDraftNotes(e.target.value)} 
                      placeholder="e.g. Defendant failed to perform obligations under Section 14 of contract. Email evidence shows acknowledgment..." 
                      className="w-full flex-1 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none bg-slate-50 focus:bg-white text-xs text-slate-800 font-sans" 
                    />
                  </div>

                  <button 
                    onClick={handleGenerateDraft} 
                    disabled={isDrafting || !draftNotes.trim()} 
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition font-bold text-xs shadow-md active:scale-95"
                  >
                    {isDrafting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Legal Submission...
                      </>
                    ) : (
                      <>
                        <Bot className="w-4 h-4 text-[#C9A55C]" />
                        Generate First Draft
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* RIGHT PANEL: EDITOR */}
              <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center shrink-0">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" /> Court Submission Editor
                  </h3>
                  <button 
                    onClick={handleSaveDraft} 
                    disabled={!draftOutput.trim() || draftSavedSuccess} 
                    className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition font-bold shadow-xs border border-slate-200 disabled:opacity-50"
                  >
                    {draftSavedSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Save className="w-4 h-4 text-slate-600" />}
                    {draftSavedSuccess ? "Saved to Case File!" : "Save Draft"}
                  </button>
                </div>

                <div className="flex-1 p-0 relative bg-slate-50/30 overflow-hidden">
                  <textarea 
                    value={draftOutput} 
                    onChange={(e) => setDraftOutput(e.target.value)} 
                    placeholder="Your generated legal draft submission will appear here ready for editing." 
                    className="w-full h-full p-8 outline-none resize-none font-serif text-sm text-slate-800 leading-relaxed bg-transparent absolute inset-0 font-sans" 
                  />

                  {!draftOutput && !isDrafting && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-slate-400 flex flex-col items-center gap-3 bg-white/50 p-8 rounded-full border border-slate-100">
                        <FileText className="w-8 h-8 text-slate-300" />
                        <p className="font-semibold text-xs text-slate-500">Document workspace is empty</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
