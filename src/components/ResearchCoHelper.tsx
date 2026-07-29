import React, { useState, useEffect } from "react";
import { 
  Search, FileText, Sparkles, BookOpen, ExternalLink, Globe, 
  Copy, Check, Scale, ShieldAlert, ArrowRight, Download, Plus, Trash2, 
  Filter, Layers, FileCheck, RefreshCw, Send, CheckCircle2, ChevronRight, AlertCircle
} from "lucide-react";
import { 
  ChambersMatter, ChambersResearchItem, ChambersSubmission,
  subscribeMatters, subscribeResearch, subscribeSubmissions,
  addResearchItem, deleteResearchItem, addSubmission, deleteSubmission,
  addDocument, addLog
} from "../lib/office-store";

interface ResearchCoHelperProps {
  currentOfficeId?: string;
  userName?: string;
  activeMatterId?: string;
  onClose?: () => void;
}

export const ResearchCoHelper: React.FC<ResearchCoHelperProps> = ({
  currentOfficeId = "all",
  userName = "Counsel",
  activeMatterId,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<"search" | "analyzer" | "drafter" | "repository">("search");
  const [matters, setMatters] = useState<ChambersMatter[]>([]);
  const [researchList, setResearchList] = useState<ChambersResearchItem[]>([]);
  const [submissionsList, setSubmissionsList] = useState<ChambersSubmission[]>([]);

  // Selected Matter state
  const [selectedMatterId, setSelectedMatterId] = useState<string>(activeMatterId || "");

  // Tab 1: Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [caseContext, setCaseContext] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{ answer: string; sources: { title: string; uri: string }[] } | null>(null);
  const [copiedSearch, setCopiedSearch] = useState(false);
  const [savedSearchSuccess, setSavedSearchSuccess] = useState(false);

  // Tab 2: Analyzer state
  const [docTitle, setDocTitle] = useState("");
  const [docContent, setDocContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [copiedAnalysis, setCopiedAnalysis] = useState(false);

  // Tab 3: Drafter state
  const [submissionType, setSubmissionType] = useState("Appellate Brief");
  const [courtForum, setCourtForum] = useState("High Court of Kenya at Nairobi");
  const [clientName, setClientName] = useState("");
  const [draftFacts, setDraftFacts] = useState("");
  const [draftResearchNotes, setDraftResearchNotes] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftResult, setDraftResult] = useState<string | null>(null);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [filedDocSuccess, setFiledDocSuccess] = useState(false);

  // Repository filter
  const [repoFilterMatter, setRepoFilterMatter] = useState<string>("all");
  const [selectedRepoItem, setSelectedRepoItem] = useState<ChambersResearchItem | ChambersSubmission | null>(null);

  // Subscribe to store updates
  useEffect(() => {
    const unsubMatters = subscribeMatters(setMatters);
    const unsubResearch = subscribeResearch(setResearchList);
    const unsubSubmissions = subscribeSubmissions(setSubmissionsList);

    return () => {
      unsubMatters();
      unsubResearch();
      unsubSubmissions();
    };
  }, []);

  // Preset search suggestions
  const presetQueries = [
    "Constitutional threshold for interim injunctions under Kenyan Civil Procedure Rules",
    "Precedents on minority shareholder oppression under Companies Act 2015",
    "Admissibility of electronic records & digital evidence under Evidence Act Cap 80",
    "Right to fair administrative action under Article 47 of Constitution of Kenya"
  ];

  const selectedMatter = matters.find(m => m.id === selectedMatterId);

  // Handle Search Grounded AI call
  const handleRunResearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResult(null);
    setSavedSearchSuccess(false);

    try {
      const response = await fetch("/api/lexai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          matterTitle: selectedMatter ? selectedMatter.title : undefined,
          caseContext: caseContext.trim() || undefined
        })
      });

      const data = await response.json();
      if (data.answer) {
        setSearchResult({
          answer: data.answer,
          sources: data.sources || []
        });
      } else {
        setSearchResult({
          answer: "No specific legal precedents returned. Please verify network connection or search query terms.",
          sources: []
        });
      }
    } catch (err) {
      console.error("Research error:", err);
      setSearchResult({
        answer: "Failed to connect to AI legal research engine. Please try again.",
        sources: []
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Save research to case file
  const handleSaveResearch = async () => {
    if (!searchResult) return;
    await addResearchItem({
      officeId: currentOfficeId,
      matterId: selectedMatterId || undefined,
      matterTitle: selectedMatter ? selectedMatter.title : "General Legal Inquiry",
      query: searchQuery,
      summary: searchResult.answer,
      sources: searchResult.sources,
      notes: caseContext,
      createdByName: userName
    });
    setSavedSearchSuccess(true);
    setTimeout(() => setSavedSearchSuccess(false), 3000);
  };

  // Handle Document Analysis
  const handleRunAnalysis = async () => {
    if (!docContent.trim()) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await fetch("/api/research/analyze-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentTitle: docTitle || "Case Document Material",
          documentContent: docContent,
          matterTitle: selectedMatter ? selectedMatter.title : undefined
        })
      });

      const data = await response.json();
      setAnalysisResult(data.analysis || "Document analysis completed.");
    } catch (err) {
      console.error("Analysis error:", err);
      setAnalysisResult("Failed to perform document analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle Submission Drafting
  const handleRunDrafting = async () => {
    const targetMatterTitle = selectedMatter ? selectedMatter.title : "Commercial Matter";
    setIsDrafting(true);
    setDraftResult(null);
    setFiledDocSuccess(false);

    try {
      const response = await fetch("/api/research/draft-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionType,
          matterTitle: targetMatterTitle,
          clientName: clientName || selectedMatter?.client || "The Client",
          facts: draftFacts,
          researchNotes: draftResearchNotes,
          courtForum
        })
      });

      const data = await response.json();
      setDraftResult(data.draft || "Submission drafted.");
    } catch (err) {
      console.error("Drafting error:", err);
      setDraftResult("Failed to generate submission draft.");
    } finally {
      setIsDrafting(false);
    }
  };

  // File drafted submission into Chambers Docs & Submissions Store
  const handleFileSubmissionDoc = async () => {
    if (!draftResult) return;
    const targetTitle = `${submissionType} — ${selectedMatter ? selectedMatter.title : "Case Brief"}`;
    
    // Save submission record
    await addSubmission({
      officeId: currentOfficeId,
      matterId: selectedMatterId || undefined,
      matterTitle: selectedMatter ? selectedMatter.title : "General Matter",
      submissionType,
      courtForum,
      title: targetTitle,
      content: draftResult,
      createdByName: userName,
      status: "Draft"
    });

    // Also file in Chambers Documents
    await addDocument({
      officeId: currentOfficeId,
      title: `${targetTitle}.md`,
      type: "Draft Submission",
      uploadedBy: userName,
      size: `${Math.round(draftResult.length / 1024 * 10) / 10} KB`
    });

    setFiledDocSuccess(true);
    setTimeout(() => setFiledDocSuccess(false), 3000);
  };

  // Copy helper
  const handleCopyText = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filtered repository items
  const filteredResearch = researchList.filter(r => repoFilterMatter === "all" || r.matterId === repoFilterMatter);
  const filteredSubmissions = submissionsList.filter(s => repoFilterMatter === "all" || s.matterId === repoFilterMatter);

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
      
      {/* HEADER BAR */}
      <div className="bg-[#0A1F44] text-white px-6 py-5 flex flex-wrap items-center justify-between gap-4 border-b border-[#0A1F44]/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#C9A55C]/20 border border-[#C9A55C]/40 flex items-center justify-center text-[#C9A55C]">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg font-bold tracking-wide text-white">
                Research Co-Helper Suite
              </h2>
              <span className="bg-[#C9A55C]/20 text-[#C9A55C] text-xs font-semibold px-2.5 py-0.5 rounded border border-[#C9A55C]/30 flex items-center gap-1">
                <Globe className="w-3 h-3" /> Live Google Grounded
              </span>
            </div>
            <p className="text-xs text-stone-300">
              Real-time precedent search, case document analysis, and AI submission drafting
            </p>
          </div>
        </div>

        {/* MATTER CONTEXT SELECTOR */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#12284C] px-3 py-1.5 rounded-lg border border-stone-700">
            <span className="text-xs text-stone-300 font-medium whitespace-nowrap">Target Case:</span>
            <select
              value={selectedMatterId}
              onChange={(e) => setSelectedMatterId(e.target.value)}
              className="bg-transparent text-xs text-white border-none focus:outline-none focus:ring-0 cursor-pointer font-medium max-w-[200px]"
            >
              <option value="" className="text-stone-900">-- General Practice (No Case) --</option>
              {matters.map(m => (
                <option key={m.id} value={m.id} className="text-stone-900">
                  {m.title} ({m.client})
                </option>
              ))}
            </select>
          </div>

          {onClose && (
            <button 
              onClick={onClose}
              className="text-stone-300 hover:text-white p-1 rounded-md hover:bg-white/10 transition"
              title="Close Research Suite"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="bg-stone-50 px-6 border-b border-stone-200 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1 py-2">
          <button
            onClick={() => setActiveTab("search")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === "search"
                ? "bg-[#0A1F44] text-white shadow-sm"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
            }`}
          >
            <Search className="w-3.5 h-3.5 text-[#C9A55C]" />
            Live Precedent Research
          </button>

          <button
            onClick={() => setActiveTab("analyzer")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === "analyzer"
                ? "bg-[#0A1F44] text-white shadow-sm"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#C9A55C]" />
            Document & Material Analyzer
          </button>

          <button
            onClick={() => setActiveTab("drafter")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === "drafter"
                ? "bg-[#0A1F44] text-white shadow-sm"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C9A55C]" />
            Court Submission Drafter
          </button>

          <button
            onClick={() => setActiveTab("repository")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === "repository"
                ? "bg-[#0A1F44] text-white shadow-sm"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#C9A55C]" />
            Research Repository ({researchList.length + submissionsList.length})
          </button>
        </div>

        {selectedMatter && (
          <div className="hidden md:flex items-center gap-2 text-xs text-[#0A1F44] bg-[#C9A55C]/15 px-3 py-1 rounded-full border border-[#C9A55C]/30 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Active Case Context: <strong className="font-semibold">{selectedMatter.title}</strong>
          </div>
        )}
      </div>

      {/* TAB 1: LIVE PRECEDENT RESEARCH */}
      {activeTab === "search" && (
        <div className="p-6 flex-1 flex flex-col gap-6">
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <label className="block text-xs font-bold text-[#0A1F44] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Enter Research Query / Legal Subject</span>
              <span className="text-stone-400 font-normal">Powered by Gemini 3.6 & Google Search Grounding</span>
            </label>
            
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRunResearch()}
                placeholder="e.g. Mandatory requirements for issuing a statutory demand under Companies Act 2015..."
                className="w-full pl-10 pr-28 py-3 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0A1F44]"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <button
                onClick={handleRunResearch}
                disabled={isSearching || !searchQuery.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#0A1F44] text-white text-xs font-semibold rounded-md hover:bg-[#081836] disabled:opacity-50 transition flex items-center gap-1.5"
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#C9A55C]" />
                    Research
                  </>
                )}
              </button>
            </div>

            {/* QUICK PRESET CHIPS */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-medium text-stone-500">Suggested Topics:</span>
              {presetQueries.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setSearchQuery(preset)}
                  className="text-[11px] bg-white hover:bg-stone-100 text-stone-700 px-2.5 py-1 rounded-md border border-stone-200 transition text-left"
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* CASE CONTEXT OPTIONAL INPUT */}
            <div className="mt-4 pt-3 border-t border-stone-200/80">
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Specific Case Facts or Statutory Reference (Optional Context):
              </label>
              <textarea
                value={caseContext}
                onChange={(e) => setCaseContext(e.target.value)}
                rows={2}
                placeholder="Include specific dates, contract clauses, or facts relevant to this query..."
                className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-md text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#0A1F44]"
              />
            </div>
          </div>

          {/* SEARCH RESULTS DISPLAY */}
          {isSearching && (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0A1F44]/10 border border-[#0A1F44]/20 flex items-center justify-center text-[#0A1F44] animate-spin">
                <Globe className="w-5 h-5 text-[#C9A55C]" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#0A1F44]">Searching Google & Statutory Registers...</h4>
                <p className="text-xs text-stone-500 mt-1">Cross-referencing High Court, Court of Appeal precedents, and statutory sections.</p>
              </div>
            </div>
          )}

          {searchResult && !isSearching && (
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden flex flex-col shadow-sm">
              <div className="bg-stone-100/80 px-5 py-3 border-b border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                    Google Search Grounded Research Report
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyText(searchResult.answer, setCopiedSearch)}
                    className="px-3 py-1 bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 rounded text-xs font-medium flex items-center gap-1.5 transition"
                  >
                    {copiedSearch ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
                    {copiedSearch ? "Copied" : "Copy"}
                  </button>

                  <button
                    onClick={handleSaveResearch}
                    disabled={savedSearchSuccess}
                    className="px-3 py-1 bg-[#0A1F44] text-white hover:bg-[#081836] rounded text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                  >
                    {savedSearchSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Plus className="w-3.5 h-3.5 text-[#C9A55C]" />}
                    {savedSearchSuccess ? "Saved to Case File!" : "Save to Case Repository"}
                  </button>
                </div>
              </div>

              {/* REPORT TEXT */}
              <div className="p-6 text-sm text-stone-800 leading-relaxed space-y-4 max-h-[500px] overflow-y-auto whitespace-pre-wrap font-sans">
                {searchResult.answer}
              </div>

              {/* CITATION SOURCES */}
              {searchResult.sources.length > 0 && (
                <div className="bg-stone-50 p-4 border-t border-stone-200">
                  <h5 className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#C9A55C]" /> Authentic Grounding Sources & Case Law Databases
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {searchResult.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 bg-white border border-stone-200 rounded-lg hover:border-[#C9A55C] hover:bg-stone-50 text-xs text-[#0A1F44] font-medium flex items-center justify-between gap-2 transition group"
                      >
                        <span className="truncate">{src.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#C9A55C] flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DOCUMENT & MATERIAL ANALYZER */}
      {activeTab === "analyzer" && (
        <div className="p-6 flex-1 flex flex-col gap-6">
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0A1F44] uppercase tracking-wider mb-1">
                Document / Material Title
              </label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g. Defendant's Supporting Affidavit / Contract Agreement Section 12..."
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0A1F44]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0A1F44] uppercase tracking-wider mb-1">
                Paste Document Text / Pleadings / Affidavits
              </label>
              <textarea
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                rows={6}
                placeholder="Paste pleadings, witness statements, contractual terms, or research materials here for AI ratio extraction..."
                className="w-full p-3 text-xs bg-white border border-stone-300 rounded-lg text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#0A1F44]"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleRunAnalysis}
                disabled={isAnalyzing || !docContent.trim()}
                className="px-5 py-2.5 bg-[#0A1F44] text-white text-xs font-semibold rounded-lg hover:bg-[#081836] disabled:opacity-50 transition flex items-center gap-2 shadow-sm"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analyzing Document...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 text-[#C9A55C]" />
                    Run Legal Material Analysis
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ANALYSIS RESULTS DISPLAY */}
          {analysisResult && (
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
              <div className="bg-stone-100 px-5 py-3 border-b border-stone-200 flex items-center justify-between">
                <span className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#C9A55C]" /> AI Document Legal Breakdown Report
                </span>
                <button
                  onClick={() => handleCopyText(analysisResult, setCopiedAnalysis)}
                  className="px-3 py-1 bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 rounded text-xs font-medium flex items-center gap-1.5 transition"
                >
                  {copiedAnalysis ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
                  {copiedAnalysis ? "Copied" : "Copy Analysis"}
                </button>
              </div>
              <div className="p-6 text-sm text-stone-800 leading-relaxed whitespace-pre-wrap font-sans max-h-[450px] overflow-y-auto">
                {analysisResult}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COURT SUBMISSION DRAFTER */}
      {activeTab === "drafter" && (
        <div className="p-6 flex-1 flex flex-col gap-6">
          <div className="bg-stone-50 p-5 rounded-xl border border-stone-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0A1F44] uppercase tracking-wider mb-1">
                  Submission / Document Type
                </label>
                <select
                  value={submissionType}
                  onChange={(e) => setSubmissionType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0A1F44]"
                >
                  <option value="Appellate Brief">Appellate Brief / Memorandum of Appeal</option>
                  <option value="Notice of Motion & Affidavit">Notice of Motion & Supporting Affidavit</option>
                  <option value="Pre-Trial Skeleton Argument">Pre-Trial Skeleton Arguments</option>
                  <option value="Legal Advisory Opinion">Legal Advisory Opinion & Risk Brief</option>
                  <option value="Constitutional Petition">Constitutional Reference / Petition</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A1F44] uppercase tracking-wider mb-1">
                  Court / Judicial Forum
                </label>
                <input
                  type="text"
                  value={courtForum}
                  onChange={(e) => setCourtForum(e.target.value)}
                  placeholder="e.g. Supreme Court of Kenya / High Court Commercial Division"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0A1F44]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0A1F44] uppercase tracking-wider mb-1">
                  Client / Applicant Name
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder={selectedMatter ? selectedMatter.client : "e.g. Vanguard Acquisitions Ltd"}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0A1F44]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A1F44] uppercase tracking-wider mb-1">
                  Linked Case / Matter
                </label>
                <div className="px-3 py-2 bg-stone-100 border border-stone-300 rounded-lg text-xs font-semibold text-[#0A1F44] flex items-center justify-between">
                  <span>{selectedMatter ? selectedMatter.title : "General Practice Docket"}</span>
                  <span className="text-[10px] text-stone-500 font-normal">Change in header above</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0A1F44] uppercase tracking-wider mb-1">
                Background Facts & Instructions
              </label>
              <textarea
                value={draftFacts}
                onChange={(e) => setDraftFacts(e.target.value)}
                rows={3}
                placeholder="Key factual chronological background for the preamble and statement of facts..."
                className="w-full p-2.5 text-xs bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0A1F44]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0A1F44] uppercase tracking-wider mb-1">
                Precedents & Statutory Notes to Incorporate
              </label>
              <textarea
                value={draftResearchNotes}
                onChange={(e) => setDraftResearchNotes(e.target.value)}
                rows={2}
                placeholder="Include specific case law ratios or statutory sections to anchor arguments..."
                className="w-full p-2.5 text-xs bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0A1F44]"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleRunDrafting}
                disabled={isDrafting}
                className="px-6 py-2.5 bg-[#0A1F44] text-white text-xs font-bold rounded-lg hover:bg-[#081836] disabled:opacity-50 transition flex items-center gap-2 shadow-sm"
              >
                {isDrafting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Drafting Submission...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#C9A55C]" />
                    Draft Court Submission & Prayer
                  </>
                )}
              </button>
            </div>
          </div>

          {/* DRAFT DISPLAY */}
          {draftResult && (
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm flex flex-col">
              <div className="bg-[#0A1F44] px-5 py-3 text-white flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider uppercase flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#C9A55C]" /> Generated Legal Submission Draft
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyText(draftResult, setCopiedDraft)}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded text-xs font-medium flex items-center gap-1.5 transition"
                  >
                    {copiedDraft ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-stone-300" />}
                    {copiedDraft ? "Copied" : "Copy Draft"}
                  </button>

                  <button
                    onClick={handleFileSubmissionDoc}
                    disabled={filedDocSuccess}
                    className="px-3.5 py-1 bg-[#C9A55C] text-[#0A1F44] hover:bg-[#b8944b] rounded text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                  >
                    {filedDocSuccess ? <Check className="w-3.5 h-3.5 text-[#0A1F44]" /> : <Plus className="w-3.5 h-3.5 text-[#0A1F44]" />}
                    {filedDocSuccess ? "Filed into Chambers Docs!" : "File to Chambers Documents"}
                  </button>
                </div>
              </div>

              <div className="p-6 bg-stone-50 font-mono text-xs text-stone-900 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto border-t border-stone-200">
                {draftResult}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SAVED CASE RESEARCH REPOSITORY */}
      {activeTab === "repository" && (
        <div className="p-6 flex-1 flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-[#0A1F44]" />
              <span className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">Filter Repository by Case:</span>
              <select
                value={repoFilterMatter}
                onChange={(e) => setRepoFilterMatter(e.target.value)}
                className="bg-white border border-stone-300 text-xs text-stone-900 font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0A1F44]"
              >
                <option value="all">All Cases & Practice Matters</option>
                {matters.map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>

            <div className="text-xs text-stone-500 font-medium">
              Saved Research Notes ({filteredResearch.length}) • Draft Submissions ({filteredSubmissions.length})
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* SAVED RESEARCH NOTES COLUMN */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider flex items-center gap-2 border-b border-stone-200 pb-2">
                <Search className="w-4 h-4 text-[#C9A55C]" /> Saved Legal Research ({filteredResearch.length})
              </h3>

              {filteredResearch.length === 0 ? (
                <div className="p-6 text-center text-xs text-stone-400 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                  No saved research notes for this selection.
                </div>
              ) : (
                filteredResearch.map((res) => (
                  <div key={res.id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm hover:border-[#C9A55C] transition flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-[#0A1F44] line-clamp-2">
                        {res.query}
                      </span>
                      <button
                        onClick={() => deleteResearchItem(res.id)}
                        className="text-stone-400 hover:text-rose-600 transition p-1"
                        title="Delete Research Note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-stone-500">
                      <span className="bg-stone-100 px-2 py-0.5 rounded font-medium text-stone-700">
                        {res.matterTitle || "General Practice"}
                      </span>
                      <span>• {res.createdByName}</span>
                      <span>• {res.createdAt}</span>
                    </div>

                    <p className="text-xs text-stone-700 line-clamp-3 bg-stone-50 p-2.5 rounded border border-stone-150">
                      {res.summary}
                    </p>

                    {res.sources.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {res.sources.map((s, idx) => (
                          <a
                            key={idx}
                            href={s.uri}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] bg-stone-100 hover:bg-stone-200 text-[#0A1F44] px-2 py-0.5 rounded border border-stone-200 flex items-center gap-1"
                          >
                            <ExternalLink className="w-2.5 h-2.5 text-[#C9A55C]" /> {s.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* DRAFT COURT SUBMISSIONS COLUMN */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider flex items-center gap-2 border-b border-stone-200 pb-2">
                <Sparkles className="w-4 h-4 text-[#C9A55C]" /> Court Submissions & Briefs ({filteredSubmissions.length})
              </h3>

              {filteredSubmissions.length === 0 ? (
                <div className="p-6 text-center text-xs text-stone-400 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                  No drafted court submissions for this selection.
                </div>
              ) : (
                filteredSubmissions.map((sub) => (
                  <div key={sub.id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm hover:border-[#C9A55C] transition flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-[#0A1F44] block">
                          {sub.title}
                        </span>
                        <span className="text-[10px] text-[#C9A55C] font-bold uppercase tracking-wider">
                          {sub.submissionType} • {sub.courtForum}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteSubmission(sub.id)}
                        className="text-stone-400 hover:text-rose-600 transition p-1"
                        title="Delete Submission"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-stone-500">
                      <span className="bg-stone-100 px-2 py-0.5 rounded font-medium text-stone-700">
                        {sub.matterTitle}
                      </span>
                      <span>• Status: <strong className="text-emerald-700">{sub.status}</strong></span>
                      <span>• {sub.createdAt}</span>
                    </div>

                    <p className="text-xs text-stone-700 font-mono line-clamp-3 bg-stone-50 p-2.5 rounded border border-stone-150">
                      {sub.content}
                    </p>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
