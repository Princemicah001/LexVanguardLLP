import React, { useState, useEffect } from "react";
import { 
  subscribeInvoices, addInvoice, updateInvoiceStatus, deleteInvoice, ChambersInvoice,
  subscribeStkTransactions, addStkTransaction, StkPushTransaction,
  subscribeMatters, ChambersMatter
} from "@/lib/office-store";
import { 
  DollarSign, Calculator, FileText, Send, Phone, CheckCircle2, Clock, 
  AlertCircle, Plus, Printer, TrendingUp, Download, Building2, ShieldCheck,
  CreditCard, ArrowRight, Loader2, Sparkles, RefreshCw
} from "lucide-react";

export const ChambersFinanceSuite: React.FC = () => {
  const [invoices, setInvoices] = useState<ChambersInvoice[]>([]);
  const [transactions, setTransactions] = useState<StkPushTransaction[]>([]);
  const [matters, setMatters] = useState<ChambersMatter[]>([]);
  const [activeTab, setActiveTab] = useState<"calculator" | "invoices" | "stk" | "reports">("invoices");

  // Calculator State
  const [calcServiceType, setCalcServiceType] = useState("Litigation");
  const [calcHours, setCalcHours] = useState<number>(10);
  const [calcRate, setCalcRate] = useState<number>(25000);
  const [calcDisbursements, setCalcDisbursements] = useState<number>(50000);
  const [calcClientName, setCalcClientName] = useState("");
  const [calcMatterTitle, setCalcMatterTitle] = useState("");

  // STK Push State
  const [stkPhone, setStkPhone] = useState("0712345678");
  const [stkAmount, setStkAmount] = useState<number>(150000);
  const [stkClient, setStkClient] = useState("Apex Innovations");
  const [stkMatter, setStkMatter] = useState("Intellectual Property Retainer");
  const [stkRef, setStkRef] = useState("LV-2026-092");
  const [isStkLoading, setIsStkLoading] = useState(false);
  const [stkStep, setStkStep] = useState<"idle" | "sending" | "prompting" | "success">("idle");
  const [stkSuccessReceipt, setStkSuccessReceipt] = useState("");

  // New Invoice Modal
  const [showNewInvModal, setShowNewInvModal] = useState(false);
  const [newInvClient, setNewInvClient] = useState("");
  const [newInvMatter, setNewInvMatter] = useState("");
  const [newInvAmount, setNewInvAmount] = useState<number>(250000);
  const [newInvDueDate, setNewInvDueDate] = useState("2026-08-25");

  // Selected Invoice for Receipt View
  const [viewReceipt, setViewReceipt] = useState<ChambersInvoice | null>(null);

  useEffect(() => {
    const unsubInvoices = subscribeInvoices((list) => setInvoices(list));
    const unsubTx = subscribeStkTransactions((list) => setTransactions(list));
    const unsubMatters = subscribeMatters((list) => setMatters(list));

    return () => {
      unsubInvoices();
      unsubTx();
      unsubMatters();
    };
  }, []);

  // Calculated figures
  const subtotal = calcHours * calcRate + calcDisbursements;
  const vat = Math.round(subtotal * 0.16);
  const grandTotal = subtotal + vat;

  const totalCollected = invoices
    .filter((i) => i.status === "Paid")
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const totalOutstanding = invoices
    .filter((i) => i.status === "Issued" || i.status === "Overdue")
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const handleCreateInvoiceFromCalc = async () => {
    if (!calcClientName.trim() || !calcMatterTitle.trim()) {
      alert("Please enter Client Name and Matter Title before generating invoice.");
      return;
    }

    const invNum = `LV-2026-${Math.floor(100 + Math.random() * 900)}`;
    await addInvoice({
      invoiceNumber: invNum,
      clientName: calcClientName.trim(),
      matterTitle: calcMatterTitle.trim(),
      officeId: "finance",
      amount: subtotal,
      vatAmount: vat,
      totalAmount: grandTotal,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      status: "Issued",
      items: [
        { description: `${calcServiceType} Advisory & Legal Representation`, hoursOrQty: calcHours, rate: calcRate, total: calcHours * calcRate },
        { description: "Court Registry & Statutory Disbursement Costs", hoursOrQty: 1, rate: calcDisbursements, total: calcDisbursements }
      ],
      notes: "Generated via LexVanguard Legal Fee Calculator."
    });

    setActiveTab("invoices");
    alert(`Invoice ${invNum} generated and issued successfully!`);
  };

  const handleCreateNewInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvClient.trim() || !newInvMatter.trim() || !newInvAmount) return;

    const vatAmt = Math.round(newInvAmount * 0.16);
    const totalAmt = newInvAmount + vatAmt;
    const invNum = `LV-2026-${Math.floor(100 + Math.random() * 900)}`;

    await addInvoice({
      invoiceNumber: invNum,
      clientName: newInvClient.trim(),
      matterTitle: newInvMatter.trim(),
      officeId: "finance",
      amount: newInvAmount,
      vatAmount: vatAmt,
      totalAmount: totalAmt,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: newInvDueDate,
      status: "Issued",
      items: [
        { description: `Legal Counsel & Professional Services`, hoursOrQty: 1, rate: newInvAmount, total: newInvAmount }
      ],
      notes: "Standard Chambers Fee Invoice."
    });

    setShowNewInvModal(false);
    setNewInvClient("");
    setNewInvMatter("");
    setNewInvAmount(250000);
  };

  const handleInitiateStkPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stkPhone || !stkAmount || !stkClient) return;

    setIsStkLoading(true);
    setStkStep("sending");

    // Simulate STK push gateway step 1
    setTimeout(() => {
      setStkStep("prompting");

      // Simulate STK push user confirmation step 2
      setTimeout(async () => {
        const receiptCode = `MPESA-WSX${Math.floor(10000 + Math.random() * 90000)}`;
        setStkSuccessReceipt(receiptCode);
        setStkStep("success");
        setIsStkLoading(false);

        await addStkTransaction({
          phoneNumber: stkPhone,
          amount: stkAmount,
          clientName: stkClient,
          matterTitle: stkMatter,
          referenceDoc: stkRef,
          status: "Success",
          mpesaReceiptNumber: receiptCode,
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
          initiatedBy: "Finance Office"
        });
      }, 2500);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* KPI METRICS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Total Revenue Paid</span>
            <span className="text-lg font-bold text-slate-900">KES {totalCollected.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Outstanding Retainers</span>
            <span className="text-lg font-bold text-slate-900">KES {totalOutstanding.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Active Fee Invoices</span>
            <span className="text-lg font-bold text-slate-900">{invoices.length} Registered</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">STK Gateway Receipts</span>
            <span className="text-lg font-bold text-slate-900">{transactions.length} Transactions</span>
          </div>
        </div>
      </div>

      {/* FINANCE TABBED NAVIGATION */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pb-3 border-b border-slate-200">
          <div>
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-800" />
              Finance & Billing
            </h2>
          </div>

          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg overflow-x-auto">
            <button
              onClick={() => setActiveTab("invoices")}
              className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                activeTab === "invoices" ? "bg-slate-900 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Invoices
            </button>
            <button
              onClick={() => setActiveTab("calculator")}
              className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                activeTab === "calculator" ? "bg-slate-900 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Fee Calculator
            </button>
            <button
              onClick={() => setActiveTab("stk")}
              className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                activeTab === "stk" ? "bg-slate-900 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              STK Push
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                activeTab === "reports" ? "bg-slate-900 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Analytics
            </button>
          </div>
        </div>

        {/* TAB 1: INVOICES & RECEIPTS */}
        {activeTab === "invoices" && (
          <div className="pt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">Chambers Invoice Ledger</h3>
              <button
                onClick={() => setShowNewInvModal(true)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Issue New Invoice
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Invoice No.</th>
                    <th className="p-3">Client & Matter</th>
                    <th className="p-3">Issued / Due</th>
                    <th className="p-3 text-right">Subtotal</th>
                    <th className="p-3 text-right">VAT (16%)</th>
                    <th className="p-3 text-right">Total (KES)</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        No invoices created yet. Use "Issue New Invoice" or the Fee Calculator to generate one.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                        <td className="p-3">
                          <span className="font-bold block text-slate-900">{inv.clientName}</span>
                          <span className="text-[11px] text-slate-500">{inv.matterTitle}</span>
                        </td>
                        <td className="p-3">
                          <span className="block">{inv.issueDate}</span>
                          <span className="text-[10px] text-slate-400">Due: {inv.dueDate}</span>
                        </td>
                        <td className="p-3 text-right font-mono">KES {inv.amount.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono text-slate-500">KES {inv.vatAmount.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">KES {inv.totalAmount.toLocaleString()}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.status === "Paid"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : inv.status === "Issued"
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "bg-slate-100 text-slate-700 border border-slate-300"
                          }`}>
                            {inv.status === "Paid" && <CheckCircle2 className="w-3 h-3" />}
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-3 text-center space-x-1 shrink-0">
                          <button
                            onClick={() => setViewReceipt(inv)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded text-[11px] inline-flex items-center gap-1"
                            title="View Printable Receipt"
                          >
                            <Printer className="w-3 h-3" /> Receipt
                          </button>
                          {inv.status !== "Paid" && (
                            <button
                              onClick={() => updateInvoiceStatus(inv.id, "Paid")}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] inline-flex items-center gap-1"
                            >
                              Mark Paid
                            </button>
                          )}
                          <button
                            onClick={() => deleteInvoice(inv.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                            title="Delete"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: FEE CALCULATOR */}
        {activeTab === "calculator" && (
          <div className="pt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Calculator className="w-4 h-4 text-slate-800" />
                Legal Fee & Disbursement Estimator
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Service Type / Practice:</label>
                  <select
                    value={calcServiceType}
                    onChange={(e) => setCalcServiceType(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                  >
                    <option value="Litigation">Litigation & Appellate Representation</option>
                    <option value="M&A Advisory">Mergers & Acquisitions / Corporate</option>
                    <option value="Intellectual Property">IP & Patent Prosecution</option>
                    <option value="Constitutional Law">Constitutional Review & Advisory</option>
                    <option value="Real Estate">Real Estate Conveyancing & Due Diligence</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Estimated Legal Hours:</label>
                  <input
                    type="number"
                    value={calcHours}
                    onChange={(e) => setCalcHours(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Hourly Billing Rate (KES):</label>
                  <input
                    type="number"
                    value={calcRate}
                    onChange={(e) => setCalcRate(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Court Disbursements & Filing Fees (KES):</label>
                  <input
                    type="number"
                    value={calcDisbursements}
                    onChange={(e) => setCalcDisbursements(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Target Client Name:</label>
                  <input
                    type="text"
                    placeholder="e.g. Crown Energy Ltd"
                    value={calcClientName}
                    onChange={(e) => setCalcClientName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Matter / Reference Title:</label>
                  <input
                    type="text"
                    placeholder="e.g. Supreme Court Appeal Grounds"
                    value={calcMatterTitle}
                    onChange={(e) => setCalcMatterTitle(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* CALCULATOR SUMMARY CARD */}
            <div className="bg-slate-900 text-white rounded-xl p-5 flex flex-col justify-between shadow-md">
              <div>
                <h4 className="font-serif font-bold text-amber-400 text-base mb-4 pb-2 border-b border-slate-800 uppercase tracking-wider">
                  Calculation Breakdown
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Legal Fee ({calcHours} hrs @ KES {calcRate.toLocaleString()})</span>
                    <span className="font-mono font-bold">KES {(calcHours * calcRate).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Statutory Disbursements</span>
                    <span className="font-mono font-bold">KES {calcDisbursements.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800">
                    <span className="text-slate-300 font-semibold">Subtotal</span>
                    <span className="font-mono font-bold text-slate-200">KES {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">VAT (16%)</span>
                    <span className="font-mono text-amber-400">KES {vat.toLocaleString()}</span>
                  </div>

                  <div className="pt-3 border-t-2 border-amber-500/40 flex justify-between items-baseline">
                    <span className="font-bold text-sm text-white uppercase">Grand Total:</span>
                    <span className="font-mono font-extrabold text-xl text-amber-400">
                      KES {grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateInvoiceFromCalc}
                className="w-full mt-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                Generate Draft Invoice <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: STK PUSH PAYMENT REQUEST */}
        {activeTab === "stk" && (
          <div className="pt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <form onSubmit={handleInitiateStkPush} className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-700" />
                Initiate M-Pesa STK Push Payment Request
              </h3>
              <p className="text-xs text-slate-500">
                Sends a live mobile payment prompt to the client's handset for instant retainer settlement.
              </p>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">M-Pesa Phone Number:</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={stkPhone}
                    onChange={(e) => setStkPhone(e.target.value)}
                    placeholder="254712345678 or 0712345678"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Payment Amount (KES):</label>
                <input
                  type="number"
                  value={stkAmount}
                  onChange={(e) => setStkAmount(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Client Name:</label>
                <input
                  type="text"
                  value={stkClient}
                  onChange={(e) => setStkClient(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Reference Matter:</label>
                <input
                  type="text"
                  value={stkMatter}
                  onChange={(e) => setStkMatter(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isStkLoading}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 shadow-sm"
              >
                {isStkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Trigger STK Push Prompt
              </button>
            </form>

            {/* STK LIVE SIMULATOR / HISTORY LEDGER */}
            <div className="space-y-4">
              {stkStep !== "idle" && (
                <div className={`p-5 rounded-xl border transition ${
                  stkStep === "success" 
                    ? "bg-emerald-50 border-emerald-300 text-emerald-950" 
                    : "bg-blue-50 border-blue-300 text-blue-950"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {stkStep === "success" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
                    )}
                    <h4 className="font-bold text-sm">
                      {stkStep === "sending" && "Connecting to Safaricom Daraja Gateway..."}
                      {stkStep === "prompting" && `STK Prompt Sent to ${stkPhone}! Awaiting PIN...`}
                      {stkStep === "success" && "Payment Confirmed & Verified!"}
                    </h4>
                  </div>

                  {stkStep === "prompting" && (
                    <p className="text-xs text-blue-800">
                      Simulating handset response... Client is entering their M-Pesa PIN for KES {stkAmount.toLocaleString()}.
                    </p>
                  )}

                  {stkStep === "success" && (
                    <div className="text-xs space-y-1 font-mono mt-2 pt-2 border-t border-emerald-200">
                      <div>M-Pesa Receipt: <span className="font-bold text-emerald-800">{stkSuccessReceipt}</span></div>
                      <div>Amount Paid: <span className="font-bold">KES {stkAmount.toLocaleString()}</span></div>
                      <div>Client: <span>{stkClient}</span></div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Recent STK Transactions</h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white text-xs">
                  {transactions.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">No STK push logs yet.</div>
                  ) : (
                    transactions.map((tx) => (
                      <div key={tx.id} className="p-3 flex justify-between items-center hover:bg-slate-50">
                        <div>
                          <span className="font-bold block text-slate-900">{tx.clientName} ({tx.phoneNumber})</span>
                          <span className="text-[10px] text-slate-500">{tx.matterTitle}</span>
                        </div>
                        <div className="text-right font-mono">
                          <span className="font-bold block text-slate-900">KES {tx.amount.toLocaleString()}</span>
                          <span className="text-[10px] text-emerald-700 font-bold">{tx.mpesaReceiptNumber || "Success"}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FINANCIAL REPORTS */}
        {activeTab === "reports" && (
          <div className="pt-4 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Chambers Revenue & Practice Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs">Revenue by Practice Area</h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span>Corporate & M&A</span>
                      <span className="font-bold">45%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-slate-900 h-full w-[45%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span>Appellate & Supreme Court Litigation</span>
                      <span className="font-bold">35%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full w-[35%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span>Intellectual Property & Patents</span>
                      <span className="font-bold">20%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full w-[20%]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs">Retainer Collection Performance</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-200">
                    <span className="text-slate-600">Collection Efficiency:</span>
                    <span className="font-bold text-emerald-700">92.4%</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200">
                    <span className="text-slate-600">Average Days to Payment:</span>
                    <span className="font-bold text-slate-900">8.5 Days</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-600">Audited Tax Year:</span>
                    <span className="font-bold text-slate-900">2026 Fiscal Q2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* NEW INVOICE MODAL */}
      {showNewInvModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 w-full max-w-md space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b pb-2">Issue New Fee Invoice</h3>
            <form onSubmit={handleCreateNewInvoice} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Client Name:</label>
                <input
                  type="text"
                  required
                  value={newInvClient}
                  onChange={(e) => setNewInvClient(e.target.value)}
                  placeholder="e.g. Crown Energy Ltd"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Matter Title:</label>
                <input
                  type="text"
                  required
                  value={newInvMatter}
                  onChange={(e) => setNewInvMatter(e.target.value)}
                  placeholder="e.g. Supreme Court Appeal Grounds"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Base Amount (KES):</label>
                <input
                  type="number"
                  required
                  value={newInvAmount}
                  onChange={(e) => setNewInvAmount(Number(e.target.value))}
                  className="w-full p-2 border rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Due Date:</label>
                <input
                  type="date"
                  required
                  value={newInvDueDate}
                  onChange={(e) => setNewInvDueDate(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewInvModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg"
                >
                  Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE RECEIPT MODAL */}
      {viewReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-8 w-full max-w-lg space-y-6">
            <div className="flex justify-between items-start pb-4 border-b">
              <div className="flex items-center gap-3">
                <img src="/brand-logo.svg" alt="LexVanguard Logo" className="w-28 h-28 object-contain shrink-0" />
                <div>
                  <h2 className="font-serif font-extrabold text-xl text-slate-900 uppercase tracking-widest">
                    LEXVANGUARD
                  </h2>
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block">
                    ADVOCATES LLP • OFFICIAL FEE RECEIPT
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm text-slate-900">{viewReceipt.invoiceNumber}</span>
                <span className="text-xs text-slate-500 block">Date: {viewReceipt.issueDate}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Client:</span>
                <span className="font-bold text-slate-900">{viewReceipt.clientName}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Matter:</span>
                <span className="font-bold text-slate-900">{viewReceipt.matterTitle}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-emerald-700">{viewReceipt.status}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg text-xs space-y-2">
              <div className="flex justify-between font-bold">
                <span>Subtotal:</span>
                <span className="font-mono">KES {viewReceipt.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>VAT (16%):</span>
                <span className="font-mono">KES {viewReceipt.vatAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold pt-2 border-t border-slate-300">
                <span>Total Received:</span>
                <span className="font-mono text-slate-950">KES {viewReceipt.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setViewReceipt(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
