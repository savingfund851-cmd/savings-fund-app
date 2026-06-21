import { useState, useEffect } from "react";
import { loadAllData, saveMember, removeMember, savePayment, updatePaymentStatus, removePayment, saveAdmin, removeAdmin, saveNotice, removeNotice, saveConfig } from "./firebaseService.js";

// ── Constants & Translations ────────────────────────────────────────────────
const MONTHS = Array.from({length:12},(_,i)=>String(i+1).padStart(2,"0"));
const YEARS  = Array.from({length:15},(_,i)=>String(2026+i)); // 2026 to 2040

const TRANSLATIONS = {
  bn: {
    title: "সঞ্চয় তহবিল",
    superadmin: "সুপার অ্যাডমিন",
    admin: "অ্যাডমিন",
    logout: "← লগআউট",
    welcome: "স্বাগতম",
    memberId: "সদস্য আইডি",
    joinDate: "যোগدان",
    totalDeposit: "মোট জমা",
    monthlyContribution: "মাসিক চাঁদা",
    totalPaidMonths: "মোট পরিশোধ",
    monthsUnit: "মাস",
    nextPayDateLabel: "পরবর্তী দেয়ার তারিখ",
    nextPayDateValue: "আগামী মাসের ১-১৫ তারিখ",
    paymentHistory: "পেমেন্ট ইতিহাস",
    month: "মাস",
    year: "বছর",
    amount: "পরিমাণ",
    method: "পদ্ধতি",
    trxId: "ট্রানজেকশন",
    date: "তারিখ",
    status: "স্ট্যাটাস",
    loginTitle: "🔐 সিকিউর লগইন প্যানেল",
    userIdLabel: "ইউজার আইডি / সদস্য আইডি / ফোন নম্বর",
    password: "পাসওয়ার্ড",
    loginBtn: "লগইন করুন →",
    dashboard: "📊 ড্যাশবোর্ড",
    membersTab: "👥 সদস্য",
    adminsTab: "🛡️ অ্যাডমিন লিস্ট",
    paymentsTab: "💳 পেমেন্ট",
    duesTab: "⚠️ বকেয়া",
    reportsTab: "📈 রিপোর্ট ও PDF",
    noticeTab: "📢 নোটিশ বোর্ড",
    customizeTab: "🎨 কাস্টমাইজেশন",
    securityTab: "🔒 পাসওয়ার্ড পরিবর্তন",
    memberDashboard: "🏠 ড্যাশবোর্ড",
    memberPayTab: "💸 পেমেন্ট দিন",
    memberSecurityTab: "🔐 পাসওয়ার্ড পরিবর্তন",
    activeMembers: "সক্রিয় সদস্য",
    totalCollected: "মোট সংগ্রহ",
    currentBalance: "বর্তমান ব্যালেন্স",
    dueMembers: "বকেয়া সদস্য",
    pendingApproval: "অনুমোদন বাকি",
    recentPayments: "সাম্প্রতিক পেমেন্ট",
    action: "কার্যক্রম",
    review: "🔍 রিভিউ করুন",
    done: "✓ সম্পন্ন",
    allStatus: "সব স্ট্যাটাস",
    allMonths: "সব মাস",
    allYears: "সব বছর",
    searchPlaceholder: "নাম, ফোন বা আইডি দিয়ে খুঁজুন...",
    newMemberBtn: "+ নতুন সদস্য",
    newAdminBtn: "+ নতুন অ্যাডমিন",
    id: "আইডি",
    name: "নাম",
    phone: "ফোন",
    actions: "কার্যক্রম",
    editReset: "✏️ এডিট / রিসেট",
    deleteBtn: "🗑️ ডিলিট",
    inactive: "নিষ্ক্রিয়",
    active: "সক্রিয়",
    dueReport: "⚠️ বকেয়া রিপোর্ট",
    totalDueMembers: "মোট বকেয়া সদস্য",
    totalDueAmount: "মোট বকেয়া পরিমাণ",
    payStatus: "পেমেন্ট স্ট্যাটাস",
    months: ["","জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"]
  },
  en: {
    title: "Savings Fund",
    superadmin: "Super Admin",
    admin: "Admin",
    logout: "← Logout",
    welcome: "Welcome",
    memberId: "Member ID",
    joinDate: "Joined",
    totalDeposit: "Total Deposit",
    monthlyContribution: "Monthly Fee",
    totalPaidMonths: "Paid Months",
    monthsUnit: "Months",
    nextPayDateLabel: "Next Payment Date",
    nextPayDateValue: "1st-15th of next month",
    paymentHistory: "Payment History",
    month: "Month",
    year: "Year",
    amount: "Amount",
    method: "Method",
    trxId: "Transaction",
    date: "Date",
    status: "Status",
    loginTitle: "🔐 Secure Login Panel",
    userIdLabel: "User ID / Member ID / Phone",
    password: "Password",
    loginBtn: "Login Now →",
    dashboard: "📊 Dashboard",
    membersTab: "👥 Members",
    adminsTab: "🛡️ Admins",
    paymentsTab: "💳 Payments",
    duesTab: "⚠️ Dues",
    reportsTab: "📈 Reports & PDF",
    noticeTab: "📢 Notice Board",
    customizeTab: "🎨 UI Customize",
    securityTab: "🔒 Change Password",
    memberDashboard: "🏠 Dashboard",
    memberPayTab: "💸 Make Payment",
    memberSecurityTab: "🔐 Change Password",
    activeMembers: "Active Members",
    totalCollected: "Total Collected",
    currentBalance: "Current Balance",
    dueMembers: "Due Members",
    pendingApproval: "Pending Approval",
    recentPayments: "Recent Payments",
    action: "Action",
    review: "🔍 Review",
    done: "✓ Done",
    allStatus: "All Status",
    allMonths: "All Months",
    allYears: "All Years",
    searchPlaceholder: "Search by name, phone or ID...",
    newMemberBtn: "+ New Member",
    newAdminBtn: "+ New Admin",
    id: "ID",
    name: "Name",
    phone: "Phone",
    actions: "Actions",
    editReset: "✏️ Edit / Reset",
    deleteBtn: "🗑️ Delete",
    inactive: "Inactive",
    active: "Active",
    dueReport: "⚠️ Due Report",
    totalDueMembers: "Total Due Members",
    totalDueAmount: "Total Due Amount",
    payStatus: "Payment Status",
    months: ["","January","February","March","April","May","June","July","August","September","October","November","December"]
  }
};

const toYM = (year, month) => `${year}-${month}`;
const fromYM = (ym) => { const [y,m]=ym.split("-"); return {year:y, month:m}; };
const labelYM = (ym, lang) => { 
  const {year,month} = fromYM(ym); 
  return TRANSLATIONS[lang].months[parseInt(month)]+" "+year; 
};

// ── Seed Data ──────────────────────────────────────────────────────────────
const SEED_MEMBERS = [];
const SEED_PAYMENTS = [];
const SEED_NOTICES = [];
const SEED_ADMINS = [
  { adminId: "ADM001", name: "General Admin 1", phone: "01700000000", password: "admin123", status: "active" }
];

const fmt = (n, lang) => {
  if (lang === "bn") return "৳" + Number(n).toLocaleString("bn-BD");
  return "৳" + Number(n).toLocaleString("en-US");
};
const today = () => new Date().toISOString().slice(0,10);
const genId = (prefix, list) => prefix + String(list.length+1).padStart(3,"0");

// ── Inject Animation Style ──────────────────────────────────────────────────
const animationStyle = `
  @keyframes slideInName {
    0% { opacity: 0; transform: translateX(-15px); filter: blur(2px); }
    100% { opacity: 1; transform: translateX(0); filter: blur(0); }
  }
  .animated-name {
    display: inline-block !important;
    animation: slideInName 0.6s cubic-bezier(0.16, 1, 0.3, 1) calc(var(--delay, 0) * 0.1s) forwards !important;
  }
  @media print {
    @page {
      size: A4 portrait;
      margin: 15mm 20mm 20mm 20mm;
    }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body * { visibility: hidden !important; }
    #printable-area, #printable-area * { visibility: visible !important; }
    #printable-area {
      position: fixed !important;
      top: 0 !important; left: 0 !important;
      width: 100% !important;
      background: #fff !important;
      font-size: 12px !important;
      color: #111 !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    #printable-area table { width: 100% !important; border-collapse: collapse !important; }
    #printable-area th, #printable-area td { border: 1px solid #d1d5db !important; padding: 6px 8px !important; font-size: 11px !important; }
    #printable-area thead tr { background: #f3f4f6 !important; }
    .no-print, .no-print * { display: none !important; }
    .only-print { display: block !important; }
    #printable-area h2, #printable-area h3, #printable-area h4 { color: #1e1b4b !important; }
    #printable-area .print-summary-box { border: 1px solid #e5e7eb !important; background: #f9fafb !important; }
  }
  .only-print { display: none; }
`;

// ── Tiny UI Components ──────────────────────────────────────────────────────
const Badge = ({ status, lang }) => {
  const map = {
    verified: ["#d1fae5","#065f46", lang==="bn"?"✓ যাচাইকৃত":"✓ Verified"],
    pending:  ["#fffbeb","#b45309", lang==="bn"?"⏳ অপেক্ষায়":"⏳ Pending"],
    active:   ["#dbeafe","#1e40af", lang==="bn"?"সक्रिय":"Active"],
    inactive: ["#fee2e2","#991b1b", lang==="bn"?"নিষ্ক্রিয়":"Inactive"],
    overdue:  ["#ffe4e6","#9f1239", lang==="bn"?"বকেয়া":"Due"],
    paid:     ["#d1fae5","#065f46", lang==="bn"?"পরিশোধ":"Paid"],
  };
  const [bg,color,label] = map[status]||["#f3f4f6","#374151",status];
  return <span style={{background:bg,color,borderRadius:99,padding:"2px 10px",fontSize:12,fontWeight:600}}>{label}</span>;
};

const Card = ({children,style={},id,className}) => (
  <div id={id} className={className} style={{background:"#fff",borderRadius:14,padding:"20px 22px",boxShadow:"0 1px 6px #0001",...style}}>{children}</div>
);

const StatCard = ({label,value,accent,icon}) => (
  <Card style={{display:"flex",alignItems:"center",gap:16}}>
    <div style={{width:48,height:48,borderRadius:12,background:accent+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{icon}</div>
    <div>
      <div style={{fontSize:13,color:"#6b7280",fontWeight:500}}>{label}</div>
      <div style={{fontSize:18,fontWeight:700,color:"#111827",marginTop:2}}>{value}</div>
    </div>
  </Card>
);

const Input = ({label,...props}) => (
  <div style={{marginBottom:14}}>
    {label && <label style={{display:"block",fontSize:13,color:"#374151",fontWeight:600,marginBottom:4}}>{label}</label>}
    <input {...props} style={{width:"100%",border:"1.5px solid #e5e7eb",borderRadius:8,padding:"9px 12px",fontSize:14,outline:"none",boxSizing:"border-box",background:"#f9fafb",...props.style}}/>
  </div>
);

const MonthYearSelect = ({label, year, month, onYear, onMonth, lang}) => (
  <div style={{marginBottom:14}}>
    {label && <label style={{display:"block",fontSize:13,color:"#374151",fontWeight:600,marginBottom:4}}>{label}</label>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
      <select value={month} onChange={e=>onMonth(e.target.value)}
        style={{border:"1.5px solid #e5e7eb",borderRadius:8,padding:"9px 12px",fontSize:14,background:"#f9fafb"}}>
        {MONTHS.map(m=><option key={m} value={m}>{TRANSLATIONS[lang].months[parseInt(m)]}</option>)}
      </select>
      <select value={year} onChange={e=>onYear(e.target.value)}
        style={{border:"1.5px solid #e5e7eb",borderRadius:8,padding:"9px 12px",fontSize:14,background:"#f9fafb"}}>
        {YEARS.map(y=><option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  </div>
);

const Btn = ({children,variant="primary",small,themeColor="#2563eb",...props}) => {
  const s = {
    primary: {background:themeColor,color:"#fff"},
    success: {background:"#059669",color:"#fff"},
    danger:  {background:"#dc2626",color:"#fff"},
    ghost:   {background:"#f3f4f6",color:"#374151"},
    outline: {background:"#fff",color:themeColor,border:`1.5px solid ${themeColor}`},
    warn:    {background:"#d97706",color:"#fff"},
  };
  return (
    <button {...props} style={{...s[variant],border:s[variant].border||"none",borderRadius:8,padding:small?"6px 14px":"9px 20px",fontSize:small?13:14,fontWeight:600,cursor:props.disabled?"not-allowed":"pointer",opacity:props.disabled?.5:1,...props.style}}>
      {children}
    </button>
  );
};

const Modal = ({title,onClose,children,wide}) => (
  <div style={{position:"fixed",inset:0,background:"#0007",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
    <div style={{background:"#fff",borderRadius:16,padding:28,width:"100%",maxWidth:wide?640:460,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 8px 40px #0003"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h3 style={{margin:0,fontSize:18,fontWeight:700}}>{title}</h3>
        <button onClick={onClose} style={{border:"none",background:"#f3f4f6",borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:18}}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const Toast = ({msg,type}) => (
  <div style={{position:"fixed",bottom:28,right:28,zIndex:9999,background:type==="error"?"#dc2626":"#059669",color:"#fff",borderRadius:10,padding:"12px 20px",fontWeight:600,fontSize:14,boxShadow:"0 4px 20px #0003"}}>
    {type==="error"?"❌ ":"✅ "}{msg}
  </div>
);

// ══════════════════════════════════════════════════════════════════════════
// ADMIN & SUPER ADMIN VIEWS
// ══════════════════════════════════════════════════════════════════════════

const AdminDashboard = ({members,payments,lang,themeColor}) => {
  const t = TRANSLATIONS[lang];
  const active = members.filter(m=>m.status==="active").length;
  const totalCollected = payments.filter(p=>p.status==="verified").reduce((s,p)=>s+p.amount,0);
  const pending = payments.filter(p=>p.status==="pending").length;
  const currentMonth = toYM("2026","06");
  const dueMembers = members.filter(m=>{
    const paid = payments.find(p=>p.memberId===m.memberId&&p.status==="verified"&&p.month===currentMonth);
    return m.status==="active" && !paid;
  }).length;

  const recent = [...payments].sort((a,b)=>b.paymentDate.localeCompare(a.paymentDate)).slice(0,6);

  return (
    <div>
      <h2 style={{fontWeight:800,marginBottom:20,fontSize:22}}>{t.dashboard}</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:16,marginBottom:28}}>
        <StatCard label={t.activeMembers}    value={active}                   accent={themeColor} icon="👥"/>
        <StatCard label={t.totalCollected}   value={fmt(totalCollected, lang)} accent="#059669" icon="💰"/>
        <StatCard label={t.currentBalance}  value={fmt(totalCollected, lang)} accent="#7c3aed" icon="🏦"/>
        <StatCard label={t.dueMembers}       value={dueMembers}               accent="#dc2626" icon="⚠️"/>
        <StatCard label={t.pendingApproval}   value={pending}                  accent="#d97706" icon="⏳"/>
      </div>

      <Card>
        <h3 style={{marginTop:0,marginBottom:14,fontSize:16,fontWeight:700}}>{t.recentPayments}</h3>
        <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{background:"#f9fafb"}}>
              {[t.membersTab, t.amount, t.month, t.method, t.date, t.status].map(h=>(
                <th key={h} style={{padding:"8px 12px",textAlign:"left",color:"#6b7280",fontWeight:600}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map(p=>{
              const m=members.find(x=>x.memberId===p.memberId);
              return (
                <tr key={p.paymentId} style={{borderTop:"1px solid #f3f4f6"}}>
                  <td style={{padding:"9px 12px",fontWeight:600}}><span className="animated-name">{m?.name}</span></td>
                  <td style={{padding:"9px 12px",fontWeight:700,color:"#059669"}}>{fmt(p.amount, lang)}</td>
                  <td style={{padding:"9px 12px"}}>{labelYM(p.month, lang)}</td>
                  <td style={{padding:"9px 12px"}}>{p.paymentMethod}</td>
                  <td style={{padding:"9px 12px",color:"#6b7280"}}>{p.paymentDate}</td>
                  <td style={{padding:"9px 12px"}}><Badge status={p.status} lang={lang}/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
};

const AdminPayments = ({members,payments,setPayments,showToast,lang,role,themeColor}) => {
  const t = TRANSLATIONS[lang];
  const [filter,setFilter] = useState("pending");
  const [filterYear,setFilterYear]  = useState("all");
  const [filterMonth,setFilterMonth]= useState("all");
  const [detailPay,setDetailPay]    = useState(null);

  const filtered = payments.filter(p=>{
    const statusOk = filter==="all" || p.status===filter;
    const {year,month} = fromYM(p.month);
    const yearOk  = filterYear==="all"  || year===filterYear;
    const monthOk = filterMonth==="all" || month===filterMonth;
    return statusOk && yearOk && monthOk;
  });

  const approve = async (id) => {
    setPayments(prev=>prev.map(p=>p.paymentId===id?{...p,status:"verified"}:p));
    setDetailPay(null);
    showToast(lang==="bn"?"পেমেন্ট সফলভাবে অনুমোদিত!":"Payment approved successfully!");
    await updatePaymentStatus(id, "verified");
  };

  const reject = async (id) => {
    setPayments(prev=>prev.filter(p=>p.paymentId!==id));
    setDetailPay(null);
    showToast(lang==="bn"?"পেমেন্ট রিজেক্ট করা হয়েছে":"Payment rejected","error");
    await removePayment(id);
  };

  const deletePayment = async (id) => {
    if(window.confirm(lang==="bn"?"পেমেন্টটি স্থায়ীভাবে ডিলিট করতে চান?":"Delete this payment permanently?")) {
      setPayments(prev=>prev.filter(p=>p.paymentId!==id));
      showToast(lang==="bn"?"পেমেন্ট ডিলিট করা হয়েছে":"Payment deleted successfully","error");
      await removePayment(id);
    }
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <h2 style={{fontWeight:800,fontSize:22,margin:0}}>{t.paymentsTab}</h2>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          <select value={filter} onChange={e=>setFilter(e.target.value)}
            style={{border:"1.5px solid #e5e7eb",borderRadius:8,padding:"7px 12px",fontSize:13,background:"#f9fafb"}}>
            <option value="all">{t.allStatus}</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
          </select>
          <select value={filterMonth} onChange={e=>setFilterMonth(e.target.value)}
            style={{border:"1.5px solid #e5e7eb",borderRadius:8,padding:"7px 12px",fontSize:13,background:"#f9fafb"}}>
            <option value="all">{t.allMonths}</option>
            {MONTHS.map(m=><option key={m} value={m}>{t.months[parseInt(m)]}</option>)}
          </select>
          <select value={filterYear} onChange={e=>setFilterYear(e.target.value)}
            style={{border:"1.5px solid #e5e7eb",borderRadius:8,padding:"7px 12px",fontSize:13,background:"#f9fafb"}}>
            <option value="all">{t.allYears}</option>
            {YEARS.map(y=><option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <Card>
        <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{background:"#f9fafb"}}>
              {[t.membersTab, t.amount, t.month, t.year, t.trxId, t.method, t.date, t.status, t.action].map(h=>(
                <th key={h} style={{padding:"9px 10px",textAlign:"left",color:"#6b7280",fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p=>{
              const mem = members.find(x=>x.memberId===p.memberId);
              const {year,month} = fromYM(p.month);
              return (
                <tr key={p.paymentId} style={{borderTop:"1px solid #f3f4f6",background:p.status==="pending"?"#fffbeb":"transparent"}}>
                  <td style={{padding:"9px 10px",fontWeight:600}}><span className="animated-name">{mem?.name}</span></td>
                  <td style={{padding:"9px 10px",fontWeight:700,color:"#059669"}}>{fmt(p.amount, lang)}</td>
                  <td style={{padding:"9px 10px"}}>{t.months[parseInt(month)]}</td>
                  <td style={{padding:"9px 10px"}}>{year}</td>
                  <td style={{padding:"9px 10px",fontFamily:"monospace",fontSize:12,color:themeColor,fontWeight:600}}>{p.trxId}</td>
                  <td style={{padding:"9px 10px"}}>{p.paymentMethod}</td>
                  <td style={{padding:"9px 10px",color:"#6b7280"}}>{p.paymentDate}</td>
                  <td style={{padding:"9px 10px"}}><Badge status={p.status} lang={lang}/></td>
                  <td style={{padding:"9px 10px", display:"flex", gap:6}}>
                    {p.status==="pending" ? (
                      <Btn small variant="warn" themeColor={themeColor} onClick={()=>setDetailPay(p)}>{t.review}</Btn>
                    ) : (
                      <span style={{color:"#059669",fontSize:12,fontWeight:600}}>{t.done}</span>
                    )}
                    {role === "superadmin" && (
                      <Btn small variant="danger" onClick={()=>deletePayment(p.paymentId)}>{t.deleteBtn}</Btn>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </Card>

      {detailPay && (
        <Modal title="Review Payment" onClose={()=>setDetailPay(null)}>
          <p><strong>Member:</strong> {members.find(m=>m.memberId===detailPay.memberId)?.name}</p>
          <p><strong>Amount:</strong> {fmt(detailPay.amount, lang)}</p>
          <p><strong>TrxID:</strong> {detailPay.trxId}</p>
          <div style={{display:"flex",gap:10,marginTop:20,justifyContent:"flex-end"}}>
            <Btn variant="danger" onClick={()=>reject(detailPay.paymentId)}>Reject</Btn>
            <Btn variant="success" onClick={()=>approve(detailPay.paymentId)}>Approve & Verify</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

const AdminMembers = ({members,setMembers,showToast,lang,role,themeColor}) => {
  const t = TRANSLATIONS[lang];
  const [modal,setModal] = useState(null);
  const [form,setForm]   = useState({});
  const [search,setSearch] = useState("");

  const filtered = members.filter(m=>m.name.toLowerCase().includes(search.toLowerCase())||m.phone.includes(search)||m.memberId.includes(search));

  const save = async () => {
    if(!form.name||!form.phone) return showToast("Name & Phone required","error");
    if(!form.password) return showToast("Password required", "error");
    
    let memberToSave;
    if(modal==="add"){
      memberToSave = {...form,memberId:genId("M",members),joinDate:today()};
      setMembers(prev=>[...prev,memberToSave]);
      showToast(lang==="bn"?"সদস্য সফলভাবে যোগ হয়েছে":"Member Added Successfully");
    } else {
      memberToSave = form;
      setMembers(prev=>prev.map(m=>m.memberId===form.memberId?form:m));
      showToast(lang==="bn"?"তথ্য আপডেট হয়েছে":"Member Info Updated");
    }
    setModal(null);
    await saveMember(memberToSave);
  };

  const deleteMember = async (id) => {
    if(window.confirm(lang==="bn"?"সদস্যকে স্থায়ীভাবে ডিলিট করতে চান?":"Delete this member permanently?")) {
      setMembers(prev=>prev.filter(m=>m.memberId!==id));
      showToast(lang==="bn"?"সদস্য মুছে ফেলা হয়েছে":"Member Deleted","error");
      await removeMember(id);
    }
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h2 style={{fontWeight:800,fontSize:22,margin:0}}>{t.membersTab}</h2>
        <Btn themeColor={themeColor} onClick={()=>{setForm({status:"active",monthlyContribution:1000,password:"123456"});setModal("add");}}>{t.newMemberBtn}</Btn>
      </div>
      <Card style={{marginBottom:16}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.searchPlaceholder}
          style={{width:"100%",border:"1.5px solid #e5e7eb",borderRadius:8,padding:"9px 14px",fontSize:14,boxSizing:"border-box"}}/>
      </Card>
      <Card>
        <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{background:"#f9fafb"}}>
              {[t.id, t.name, t.phone, t.password, t.monthlyContribution, t.status, t.actions].map(h=>(
                <th key={h} style={{padding:"9px 12px",textAlign:"left",color:"#6b7280",fontWeight:600}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(m=>(
              <tr key={m.memberId} style={{borderTop:"1px solid #f3f4f6"}}>
                <td style={{padding:"10px 12px",color:"#6b7280",fontFamily:"monospace"}}>{m.memberId}</td>
                <td style={{padding:"10px 12px",fontWeight:600}}><span className="animated-name">{m.name}</span></td>
                <td style={{padding:"10px 12px"}}>{m.phone}</td>
                <td style={{padding:"10px 12px",fontFamily:"monospace",color:themeColor}}>{m.password}</td>
                <td style={{padding:"10px 12px",fontWeight:700,color:"#059669"}}>{fmt(m.monthlyContribution, lang)}</td>
                <td style={{padding:"10px 12px"}}><Badge status={m.status} lang={lang}/></td>
                <td style={{padding:"10px 12px", display:"flex", gap:6}}>
                  <Btn small variant="ghost" onClick={()=>{setForm({...m});setModal("edit");}}>{t.editReset}</Btn>
                  {role === "superadmin" && (
                    <Btn small variant="danger" onClick={()=>deleteMember(m.memberId)}>{t.deleteBtn}</Btn>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>

      {modal && (
        <Modal title={modal==="add"?"New Member":"Member Management"} onClose={()=>setModal(null)}>
          <Input label="Name *" value={form.name||""} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/>
          <Input label="Phone *" value={form.phone||""} onChange={e=>setForm(p=>({...p,phone:e.target.value}))}/>
          <Input label="Password *" value={form.password||""} onChange={e=>setForm(p=>({...p,password:e.target.value}))}/>
          <Input label="Monthly Fee" type="number" value={form.monthlyContribution||""} onChange={e=>setForm(p=>({...p,monthlyContribution:+e.target.value}))}/>
          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:13,color:"#374151",fontWeight:600,marginBottom:8}}>{lang==="bn"?"স্ট্যাটাস":"Status"}</label>
            <div style={{display:"flex",gap:10}}>
              <button type="button" onClick={()=>setForm(p=>({...p,status:"active"}))} style={{
                flex:1, padding:"9px 12px", borderRadius:8, border:"1.5px solid",
                borderColor: form.status==="active" ? "#059669" : "#e5e7eb",
                background: form.status==="active" ? "#d1fae5" : "#f9fafb",
                color: form.status==="active" ? "#065f46" : "#6b7280",
                fontWeight:600, fontSize:13, cursor:"pointer"
              }}>✅ {lang==="bn"?"সक्रिय":"Active"}</button>
              <button type="button" onClick={()=>setForm(p=>({...p,status:"inactive"}))} style={{
                flex:1, padding:"9px 12px", borderRadius:8, border:"1.5px solid",
                borderColor: form.status==="inactive" ? "#dc2626" : "#e5e7eb",
                background: form.status==="inactive" ? "#fee2e2" : "#f9fafb",
                color: form.status==="inactive" ? "#991b1b" : "#6b7280",
                fontWeight:600, fontSize:13, cursor:"pointer"
              }}>🚫 {lang==="bn"?"নিষ্ক্রিয়":"Inactive"}</button>
            </div>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end", marginTop:18}}>
            <Btn variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn themeColor={themeColor} onClick={save}>Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

const SuperAdminList = ({admins, setAdmins, showToast, lang, themeColor}) => {
  const t = TRANSLATIONS[lang];
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  const saveAdmin = async () => {
    if(!form.name || !form.phone || !form.password) return showToast("All fields are required", "error");
    let adminToSave;
    if(modal === "add") {
      adminToSave = { ...form, adminId: genId("ADM", admins), status: "active" };
      setAdmins(prev => [...prev, adminToSave]);
      showToast(lang==="bn"?"নতুন অ্যাডমিন সফলভাবে তৈরি হয়েছে":"New Admin Created Successfully");
    } else {
      adminToSave = form;
      setAdmins(prev => prev.map(a => a.adminId === form.adminId ? form : a));
      showToast(lang==="bn"?"অ্যাডমিন তথ্য আপডেট হয়েছে":"Admin Data Updated");
    }
    setModal(null);
    await saveAdmin(adminToSave);
  };

  const deleteAdmin = async (id) => {
    if(window.confirm(lang==="bn"?"অ্যাডমিনকে ডিলিট করতে চান?":"Delete this Admin?")) {
      setAdmins(prev => prev.filter(a => a.adminId !== id));
      showToast(lang==="bn"?"অ্যাডমিন রিমুভ করা হয়েছে":"Admin Removed", "error");
      await removeAdmin(id);
    }
  };

  return (
    <div>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20}}>
        <h2 style={{fontWeight:800, fontSize:22, margin:0}}>{t.adminsTab}</h2>
        <Btn themeColor={themeColor} onClick={()=>{setForm({status:"active"}); setModal("add");}}>{t.newAdminBtn}</Btn>
      </div>
      <Card>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%", borderCollapse:"collapse", fontSize:13}}>
            <thead>
              <tr style={{background:"#f9fafb"}}>
                {[t.id, t.name, t.phone, t.password, t.status, t.actions].map(h=><th key={h} style={{padding:"10px 12px", textAlign:"left", color:"#6b7280", fontWeight:600}}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {admins.map(a => (
                <tr key={a.adminId} style={{borderTop:"1px solid #f3f4f6"}}>
                  <td style={{padding:"10px 12px", fontFamily:"monospace"}}>{a.adminId}</td>
                  <td style={{padding:"10px 12px", fontWeight:600}}>{a.name}</td>
                  <td style={{padding:"10px 12px"}}>{a.phone}</td>
                  <td style={{padding:"10px 12px", fontFamily:"monospace", color:themeColor}}>{a.password}</td>
                  <td style={{padding:"10px 12px"}}><Badge status={a.status} lang={lang}/></td>
                  <td style={{padding:"10px 12px", display:"flex", gap:6}}>
                    <Btn small variant="ghost" onClick={()=>{setForm({...a}); setModal("edit");}}>{t.editReset}</Btn>
                    <Btn small variant="danger" onClick={()=>deleteAdmin(a.adminId)}>{t.deleteBtn}</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {modal && (
        <Modal title={modal==="add"?"New Sub-Admin":"Edit Admin Properties"} onClose={()=>setModal(null)}>
          <Input label="Name *" value={form.name||""} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/>
          <Input label="Phone *" value={form.phone||""} onChange={e=>setForm(p=>({...p,phone:e.target.value}))}/>
          <Input label="Password *" value={form.password||""} onChange={e=>setForm(p=>({...p,password:e.target.value}))}/>
          <div style={{marginBottom:14}}>
            <label style={{display:"block", fontSize:13, fontWeight:600, marginBottom:6}}>Status</label>
            <select value={form.status||"active"} onChange={e=>setForm(p=>({...p,status:e.target.value}))} style={{width:"100%", padding:"9px 12px", border:"1.5px solid #e5e7eb", borderRadius:8}}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div style={{display:"flex", gap:10, justifyContent:"flex-end", marginTop:18}}>
            <Btn variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn themeColor={themeColor} onClick={saveAdmin}>Save Admin</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

const SuperAdminCustomize = ({custom, setCustom, showToast, lang, themeColor}) => {
  return (
    <Card style={{maxWidth:550}}>
      <h3 style={{marginTop:0, marginBottom:16}}>🎨 সিস্টেম ব্র্যান্ডিং ও কাস্টমাইজেশন প্যানেল</h3>
      <Input label="সিস্টেম নাম / টাইটেল (App Title)" value={custom.title} onChange={e=>setCustom(p=>({...p, title: e.target.value}))}/>
      <Input label="কাস্টম লোগো URL (Logo Image URL)" value={custom.logoUrl} onChange={e=>setCustom(p=>({...p, logoUrl: e.target.value}))} placeholder="https://example.com/logo.png"/>
      
      <div style={{marginBottom:14}}>
        <label style={{display:"block", fontSize:13, fontWeight:600, marginBottom:4}}>প্রাইমারি থিম কালার (Theme Primary Color)</label>
        <div style={{display:"flex", gap:12, alignItems:"center"}}>
          <input type="color" value={custom.themeColor} onChange={e=>setCustom(p=>({...p, themeColor: e.target.value}))} style={{width:50, height:40, border:"none", cursor:"pointer"}}/>
          <span style={{fontSize:13, fontFamily:"monospace"}}>{custom.themeColor}</span>
        </div>
      </div>

      <div style={{marginBottom:18}}>
        <label style={{display:"block", fontSize:13, fontWeight:600, marginBottom:4}}>গ্লোবাল ফন্ট সাইজ টিউনিং (Font Scale)</label>
        <select value={custom.fontSize} onChange={e=>setCustom(p=>({...p, fontSize: e.target.value}))} style={{width:"100%", padding:"9px 12px", border:"1.5px solid #e5e7eb", borderRadius:8, background:"#f9fafb"}}>
          <option value="13px">Compact (ছোট)</option>
          <option value="14px">Standard (স্বাভাবিক)</option>
          <option value="16px">Large (বড়)</option>
        </select>
      </div>

      <Btn themeColor={themeColor} onClick={async ()=>{showToast(lang==="bn"?"কনফিগারেশন সেভ হয়েছে!":"Branding Configuration Saved!"); await saveConfig(custom);}} style={{width:"100%"}}>Save Configurations</Btn>
    </Card>
  );
};

const AdminDues = ({members,payments,lang}) => {
  const t = TRANSLATIONS[lang];
  const [selYear,setSelYear]   = useState("2026");
  const [selMonth,setSelMonth] = useState("06");
  const ym = toYM(selYear,selMonth);

  const rows = members.filter(m=>m.status==="active").map(m=>{
    const paid    = payments.find(p=>p.memberId===m.memberId&&p.month===ym&&p.status==="verified");
    const pending = payments.find(p=>p.memberId===m.memberId&&p.month===ym&&p.status==="pending");
    return {...m, paidStatus: paid?"paid": pending?"pending":"overdue"};
  });

  const dues  = rows.filter(r=>r.paidStatus==="overdue");
  const total = dues.reduce((s,m)=>s+m.monthlyContribution,0);

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:20}}>
        <h2 style={{fontWeight:800,fontSize:22,margin:0}}>{t.dueReport}</h2>
        <div style={{display:"flex",gap:8}}>
          <select value={selMonth} onChange={e=>setSelMonth(e.target.value)} style={{border:"1.5px solid #e5e7eb",borderRadius:8,padding:"8px 12px",background:"#f9fafb"}}>
            {MONTHS.map(m=><option key={m} value={m}>{t.months[parseInt(m)]}</option>)}
          </select>
          <select value={selYear} onChange={e=>setSelYear(e.target.value)} style={{border:"1.5px solid #e5e7eb",borderRadius:8,padding:"8px 12px",background:"#f9fafb"}}>
            {YEARS.map(y=><option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
        <StatCard label={t.totalDueMembers}  value={dues.length}        accent="#dc2626" icon="⚠️"/>
        <StatCard label={t.totalDueAmount}   value={fmt(total, lang)}   accent="#dc2626" icon="💸"/>
      </div>
    </div>
  );
};

const AdminReports = ({members, payments, lang, custom}) => {
  const [reportType, setReportType] = useState("single");
  const [startMonth, setStartMonth] = useState("01");
  const [startYear, setStartYear]   = useState("2026");
  const [endMonth, setEndMonth]     = useState("06");
  const [endYear, setEndYear]       = useState("2026");

  const getMonthsRange = () => {
    const range = [];
    let startVal = parseInt(startYear) * 12 + parseInt(startMonth);
    let endVal = reportType === "single" ? startVal : parseInt(endYear) * 12 + parseInt(endMonth);
    if (endVal < startVal) return [];
    for (let v = startVal; v <= endVal; v++) {
      const y = Math.floor((v - 1) / 12);
      const m = String(((v - 1) % 12) + 1).padStart(2, "0");
      range.push(toYM(String(y), m));
    }
    return range;
  };

  const targetMonths = getMonthsRange();
  const activeMembers = members.filter(m => m.status === "active");

  let totalTarget = 0;
  let totalCollected = 0;

  targetMonths.forEach(ym => {
    activeMembers.forEach(m => { totalTarget += m.monthlyContribution; });
    const collectedInMonth = payments.filter(p => p.month === ym && p.status === "verified").reduce((s, p) => s + p.amount, 0);
    totalCollected += collectedInMonth;
  });

  const totalDues = totalTarget - totalCollected;
  const collectionRate = totalTarget > 0 ? ((totalCollected / totalTarget) * 100).toFixed(1) : 0;

  let situationMsg = lang === "bn" ? "স্থিতিশীল" : "Stable";
  let situationColor = "#059669";
  if (collectionRate < 50) { situationMsg = lang === "bn" ? "ঝুঁকিপূর্ণ" : "Critical"; situationColor = "#dc2626"; }
  else if (collectionRate < 85) { situationMsg = lang === "bn" ? "মাঝারি" : "Moderate"; situationColor = "#d97706"; }

  return (
    <div>
      <Card style={{marginBottom: 20}} className="no-print">
        <h3 style={{marginTop:0, marginBottom:16}}>📅 রিপোর্ট ফিল্টার অপশন</h3>
        <div style={{display:"flex", gap:16, marginBottom:16, alignItems:"center"}}>
          <label><input type="radio" checked={reportType==="single"} onChange={()=>setReportType("single")}/> নির্দিষ্ট একক মাস</label>
          <label><input type="radio" checked={reportType==="period"} onChange={()=>setReportType("period")}/> নির্দিষ্ট সময়কাল</label>
        </div>
        <div style={{display:"flex", gap:16, flexWrap:"wrap"}}>
          <MonthYearSelect label={reportType === "single" ? "মাস নির্বাচন করুন" : "শুরুর মাস"} year={startYear} month={startMonth} onYear={setStartYear} onMonth={setStartMonth} lang={lang} />
          {reportType === "period" && ( <MonthYearSelect label="শেষের মাস" year={endYear} month={endMonth} onYear={setEndYear} onMonth={setEndMonth} lang={lang} /> )}
        </div>
        <div style={{display:"flex", gap:10, marginTop:10}}>
          <Btn onClick={()=>window.print()} variant="success">🖨️ PDF সেভ / প্রিন্ট করুন</Btn>
        </div>
      </Card>

      <Card id="printable-area">
        <div style={{textAlign:"center", borderBottom:"2px solid #1e1b4b", paddingBottom:16, marginBottom:20}}>
          {custom.logoUrl ? <img src={custom.logoUrl} alt="Logo" style={{height:55, marginBottom:6, borderRadius:8}}/> : <div style={{fontSize:26, marginBottom:6}}>🏦</div>}
          <h2 style={{margin:0, fontSize:22, color:"#1e1b4b", fontWeight:900}}>{custom.title}</h2>
          <p style={{margin:"4px 0 0", color:"#6b7280", fontSize:13}}>আর্থিক ও বকেয়া রিপোর্ট বিবরণী</p>
          <div style={{marginTop:10, display:"flex", justifyContent:"center", gap:24, fontSize:12, color:"#374151"}}>
            <span>📅 সময়কাল: <strong>{targetMonths.length > 0 ? labelYM(targetMonths[0], lang) : "-"}{targetMonths.length > 1 ? " → " + labelYM(targetMonths[targetMonths.length-1], lang) : ""}</strong></span>
            <span>🗓️ প্রিন্ট তারিখ: <strong>{today()}</strong></span>
          </div>
        </div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:12, marginBottom:20}}>
          {[
            {label: lang==="bn"?"মোট জমার লক্ষ্যমাত্রা":"Total Target", val: fmt(totalTarget, lang), color:"#1e40af", bg:"#eff6ff"},
            {label: lang==="bn"?"মোট সংগৃহীত জমা":"Total Collected", val: fmt(totalCollected, lang), color:"#065f46", bg:"#f0fdf4"},
            {label: lang==="bn"?"মোট বকেয়া":"Total Dues", val: fmt(totalDues, lang), color:"#9f1239", bg:"#fff1f2"},
            {label: lang==="bn"?"সংগ্রহের হার":"Collection Rate", val: collectionRate+"%", color: situationColor, bg: situationColor+"15"},
          ].map((box,i) => (
            <div key={i} className="print-summary-box" style={{padding:"12px 14px", border:"1px solid #e5e7eb", borderRadius:10, background:box.bg}}>
              <div style={{fontSize:11, color:"#6b7280", marginBottom:4}}>{box.label}</div>
              <div style={{fontSize:18, fontWeight:700, color:box.color}}>{box.val}</div>
            </div>
          ))}
        </div>
        <table style={{width:"100%", borderCollapse:"collapse", fontSize:13}}>
          <thead>
            <tr style={{background:"#f9fafb", borderBottom:"2px solid #e5e7eb"}}>
              <th style={{padding:"8px 10px", textAlign:"left"}}>ক্রমিক মাস</th>
              <th style={{padding:"8px 10px", textAlign:"right"}}>লক্ষ্যমাত্রা</th>
              <th style={{padding:"8px 10px", textAlign:"right"}}>আদায় হয়েছে</th>
              <th style={{padding:"8px 10px", textAlign:"right"}}>বকেয়া</th>
              <th style={{padding:"8px 10px", textAlign:"center"}}>হার</th>
            </tr>
          </thead>
          <tbody>
            {targetMonths.map(ym => {
              const monthTarget = activeMembers.reduce((s, m) => s + m.monthlyContribution, 0);
              const monthCollected = payments.filter(p => p.month === ym && p.status === "verified").reduce((s, p) => s + p.amount, 0);
              const monthDue = monthTarget - monthCollected;
              const rate = monthTarget > 0 ? Math.round((monthCollected/monthTarget)*100) : 0;
              return (
                <tr key={ym} style={{borderBottom:"1px solid #f3f4f6"}}>
                  <td style={{padding:"8px 10px", fontWeight:600}}>{labelYM(ym, lang)}</td>
                  <td style={{padding:"8px 10px", textAlign:"right"}}>{fmt(monthTarget, lang)}</td>
                  <td style={{padding:"8px 10px", textAlign:"right", color:"#059669", fontWeight:600}}>{fmt(monthCollected, lang)}</td>
                  <td style={{padding:"8px 10px", textAlign:"right", color:monthDue > 0 ? "#dc2626" : "#6b7280"}}>{fmt(monthDue, lang)}</td>
                  <td style={{padding:"8px 10px", textAlign:"center"}}>
                    <span style={{fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:99, background: rate>80?"#d1fae5":"#fee2e2", color: rate>80?"#065f46":"#9f1239"}}>{rate}%</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

const AdminNotices = ({notices, setNotices, showToast, themeColor}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const handlePublish = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return showToast("Title & Content Required", "error");
    const newNotice = { noticeId: genId("N", notices), title, content, date: today() };
    setNotices([newNotice, ...notices]);
    showToast("নতুন নোটিশ পাবলিশ করা হয়েছে!");
    setTitle(""); setContent("");
    await saveNotice(newNotice);
  };
  return (
    <div style={{display:"grid", gridTemplateColumns: "1fr 1fr", gap: 24, flexWrap:"wrap"}}>
      <Card>
        <h3 style={{marginTop:0, marginBottom:16}}>📢 নতুন নোটিশ তৈরি করুন</h3>
        <form onSubmit={handlePublish}>
          <Input label="নোটিশ টাইটেল *" value={title} onChange={e=>setTitle(e.target.value)}/>
          <div style={{marginBottom:14}}>
            <label style={{display:"block", fontSize:13, fontWeight:600, marginBottom:4}}>নোটিশ বিবরণ *</label>
            <textarea value={content} onChange={e=>setContent(e.target.value)} style={{width:"100%", height:120, border:"1.5px solid #e5e7eb", borderRadius:8, padding:10, fontSize:14, background:"#f9fafb", boxSizing:"border-box"}}/>
          </div>
          <Btn type="submit" themeColor={themeColor} style={{width:"100%"}}>Publish Notice</Btn>
        </form>
      </Card>
      <div>
        <h3 style={{marginTop:0, marginBottom:14}}>📜 বর্তমান নোটিশ সমূহ</h3>
        {notices.map(n => (
          <Card key={n.noticeId} style={{marginBottom:12, borderLeft: `4px solid ${themeColor}`}}>
            <div style={{display:"flex", justifyContent:"space-between"}}>
              <h4 style={{margin:0}}>{n.title}</h4>
              <button onClick={async ()=>{setNotices(notices.filter(x=>x.noticeId!==n.noticeId)); showToast("Deleted", "error"); await removeNotice(n.noticeId);}} style={{border:"none", background:"none", color:"#dc2626", cursor:"pointer", fontSize:12}}>মুছে ফেলুন</button>
            </div>
            <p style={{fontSize:13, color:"#4b5563"}}>{n.content}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

const PasswordSettingsGlobal = ({currentPassword, setPassword, showToast, labelText, onSave}) => {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const handleUpdate = async () => {
    if(oldPw !== currentPassword) return showToast("Current password incorrect", "error");
    setPassword(newPw);
    showToast("Password updated successfully");
    setOldPw(""); setNewPw("");
    if (onSave) await onSave(newPw);
  };
  return (
    <Card style={{maxWidth:440}}>
      <h3 style={{marginTop:0}}>{labelText}</h3>
      <Input label="Current Password" type="password" value={oldPw} onChange={e=>setOldPw(e.target.value)}/>
      <Input label="New Password" type="password" value={newPw} onChange={e=>setNewPw(e.target.value)}/>
      <Btn onClick={handleUpdate} style={{width:"100%"}}>Change Secure Password</Btn>
    </Card>
  );
};

// ── MEMBER VIEWS ────────────────────────────────────────────────────────────
const MemberDashboard = ({member,payments,notices,lang,custom}) => {
  const t = TRANSLATIONS[lang];
  const myPayments = payments.filter(p=>p.memberId===member.memberId);
  const totalDeposit = myPayments.filter(p=>p.status==="verified").reduce((s,p)=>s+p.amount,0);
  const hasVerifiedPayment = myPayments.some(p => p.status === "verified");

  return (
    <div>
      <div style={{background: `linear-gradient(135deg, ${custom.themeColor}, #7c3aed)`,borderRadius:16,padding:"24px 28px",color:"#fff",marginBottom:24}}>
        <div style={{fontSize:13,opacity:.8,marginBottom:4}}>{t.welcome}</div>
        <div style={{fontSize:24,fontWeight:800}} className="animated-name">{member.name}</div>
        <div style={{fontSize:13,opacity:.7,marginTop:4}}>{t.memberId}: {member.memberId} · {t.joinDate}: {member.joinDate}</div>
        <div style={{marginTop:20,display:"flex",gap:28,flexWrap:"wrap"}}>
          <div><div style={{fontSize:11,opacity:.7}}>{t.totalDeposit}</div><div style={{fontSize:22,fontWeight:800}}>{fmt(totalDeposit, lang)}</div></div>
          <div><div style={{fontSize:11,opacity:.7}}>{t.monthlyContribution}</div><div style={{fontSize:22,fontWeight:800}}>{fmt(member.monthlyContribution, lang)}</div></div>
          <div><div style={{fontSize:11,opacity:.7}}>{t.totalPaidMonths}</div><div style={{fontSize:22,fontWeight:800}}>{myPayments.filter(p=>p.status==="verified").length} {t.monthsUnit}</div></div>
        </div>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))", gap:16, marginBottom:24}}>
        <StatCard label={lang === "bn" ? "পেমেন্ট স্ট্যাটাস" : "Payment Status"} value={hasVerifiedPayment ? "Thank you!! payment successful" : "Pending / Due"} accent="#059669" icon="📅"/>
        <StatCard label={t.nextPayDateLabel} value={t.nextPayDateValue} accent={custom.themeColor} icon="📆"/>
      </div>
      <Card style={{borderTop: `4px solid ${custom.themeColor}`}}>
        <h3 style={{marginTop:0}}>📢 {lang==="bn"?"অফিসিয়াল নোটিশ বোর্ড":"Official Notice Board"}</h3>
        {notices.length === 0 ? <p style={{fontSize:13, color:"#9ca3af"}}>No updates available right now.</p> : (
          <div style={{display:"flex", flexDirection:"column", gap:12}}>
            {notices.map(n => (
              <div key={n.noticeId} style={{padding:"12px 16px", background:"#f8fafc", borderRadius:10, borderLeft:"3px solid #7c3aed"}}>
                <h4 style={{margin:"0 0 6px 0"}}>{n.title}</h4>
                <p style={{margin:0, fontSize:13, color:"#4b5563"}}>{n.content}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

const MemberPayment = ({member,payments,setPayments,showToast,lang,themeColor}) => {
  const [selYear,setSelYear]   = useState("2026");
  const [selMonth,setSelMonth] = useState("06");
  const [amount,setAmount]     = useState(member.monthlyContribution);
  const [trxId,setTrxId]       = useState("");
  const [paymentMethod,setPaymentMethod] = useState("bKash");

  const submit = async () => {
    if(!trxId.trim()) return showToast("TrxID Required","error");
    const newPayment = {paymentId:genId("P",payments),memberId:member.memberId,amount,month:toYM(selYear,selMonth),trxId,paymentMethod,paymentDate:today(),status:"pending"};
    setPayments(prev=>[...prev,newPayment]);
    showToast("Payment submitted for approval");
    setTrxId("");
    await savePayment(newPayment);
  };

  return (
    <Card style={{maxWidth:480}}>
      <MonthYearSelect label="Month *" year={selYear} month={selMonth} onYear={setSelYear} onMonth={setSelMonth} lang={lang}/>
      <Input label="Amount *" type="number" value={amount} onChange={e=>setAmount(+e.target.value)}/>
      <div style={{marginBottom:14}}>
        <label style={{display:"block", fontSize:13, fontWeight:600, marginBottom:4, color:"#374151"}}>Payment Method *</label>
        <select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)} style={{width:"100%", height:42, border:"1.5px solid #e5e7eb", borderRadius:8, padding:"0 12px", fontSize:14, background:"#f9fafb", outline:"none"}}>
          <option value="bKash">bKash</option>
          <option value="Nagad">Nagad</option>
          <option value="Rocket">Rocket</option>
          <option value="Bank">Bank Transfer</option>
        </select>
      </div>
      <Input label="Transaction ID *" value={trxId} onChange={e=>setTrxId(e.target.value)}/>
      <Btn themeColor={themeColor} onClick={submit} style={{width:"100%"}}>Submit Payment</Btn>
    </Card>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// MAIN APPLICATION COMPONENT (WITH AUTO LOGIN DETECT ARCHITECTURE)
// ══════════════════════════════════════════════════════════════════════════

export default function App() {
  const [lang, setLang] = useState("bn"); 
  const [role, setRole] = useState(null); // 'superadmin' | 'admin' | 'member'
  const [activeMember, setActiveMember] = useState(null);
  
  // App Global Database
  const [members, setMembers] = useState(SEED_MEMBERS);
  const [payments, setPayments] = useState(SEED_PAYMENTS);
  const [notices, setNotices] = useState(SEED_NOTICES);
  const [admins, setAdmins] = useState(SEED_ADMINS);
  
  // System Configurations
  const [custom, setCustom] = useState({
    title: "সঞ্চয় তহবিল",
    themeColor: "#2563eb",
    fontSize: "14px",
    logoUrl: ""
  });

  const [activeTab, setActiveTab] = useState("dashboard");
  const [toast, setToast] = useState(null);
  
  // Passwords Layer
  const [superPassword, setSuperPassword] = useState("super123");
  const [adminPassword, setAdminPassword] = useState("admin123");

  // Single Input Form Controls
  const [loading, setLoading] = useState(true);
  const [loginId, setLoginId] = useState("");
  const [loginPw, setLoginPw] = useState("");

  const showToast = (msg, type="success") => { setToast({msg, type}); setTimeout(()=>setToast(null), 3500); };

  useEffect(() => {
    loadAllData().then(data => {
      if (data.members.length > 0) setMembers(data.members);
      if (data.payments.length > 0) setPayments(data.payments);
      if (data.notices.length > 0) setNotices(data.notices);
      if (data.admins.length > 0) setAdmins(data.admins);
      
      if (data.config) {
        setCustom(data.config);
        if (data.config.superPassword) setSuperPassword(data.config.superPassword);
        if (data.config.adminPassword) setAdminPassword(data.config.adminPassword);
      }
      setLoading(false);
    }).catch(err => {
      console.error("Failed to load data:", err);
      showToast("Failed to load data from server", "error");
      setLoading(false);
    });
  }, []);

  // ── Smart Auto-Login Handler ──────────────────────────────────────────────
  const handleAutoLogin = (e) => {
    e.preventDefault();
    const inputId = loginId.trim();

    // 1. Check Super Admin Identity
    if (inputId === "superadmin") {
      if (loginPw === superPassword) {
        setRole("superadmin"); setActiveTab("dashboard");
        showToast(lang==="bn"?"⚡ সুপার অ্যাডমিন লগইন সফল!":"⚡ Super Admin Access Granted!");
        return;
      } else {
        showToast(lang==="bn"?"ভুল সুপার অ্যাডমিন পাসওয়ার্ড!":"Invalid Super Admin Password", "error");
        return;
      }
    }

    // 2. Check Admin List Identity (Sub-Admins)
    const foundAdmin = admins.find(a => a.adminId === inputId && a.password === loginPw);
    if ((inputId === "admin" && loginPw === adminPassword) || (foundAdmin && foundAdmin.status === "active")) {
      setRole("admin"); setActiveTab("dashboard");
      showToast(lang==="bn"?"🛡️ অ্যাডমিন লগইন সফল!":"🛡️ Admin Access Approved");
      return;
    } else if (admins.some(a => a.adminId === inputId && a.status === "inactive")) {
      showToast(lang==="bn"?"এই অ্যাডমিন অ্যাকাউন্টটি নিষ্ক্রিয়!":"This Admin account is Inactive", "error");
      return;
    }

    // 3. Fallback to Member Accounts Check
    const foundMember = members.find(m => m.memberId === inputId || m.phone === inputId);
    if (foundMember) {
      if (foundMember.password === loginPw) {
        if (foundMember.status === "active") {
          setActiveMember(foundMember); setRole("member"); setActiveTab("dashboard");
          showToast(lang==="bn"?`👤 স্বাগতম, ${foundMember.name}`:`👤 Welcome, ${foundMember.name}`);
        } else {
          showToast(lang==="bn"?"আপনার অ্যাকাউন্টটি নিষ্ক্রিয় আছে!":"Your account is inactive!", "error");
        }
      } else {
        showToast(lang==="bn"?"ভুল মেম্বার পাসওয়ার্ড!":"Incorrect Member Password", "error");
      }
      return;
    }

    // If matches nothing
    showToast(lang==="bn"?"ইউজার আইডি বা মেম্বার খুঁজে পাওয়া যায়নি!":"User Identity Not Found!", "error");
  };

  const currentMemberData = role === "member" ? members.find(m => m.memberId === activeMember?.memberId) : null;
  const t = TRANSLATIONS[lang];

  const getTabsByRole = () => {
    if (role === "superadmin") return [
      {id:"dashboard", label: t.dashboard}, {id:"members", label: t.membersTab},
      {id:"admins", label: t.adminsTab}, {id:"payments", label: t.paymentsTab},
      {id:"dues", label: t.duesTab}, {id:"reports", label: t.reportsTab},
      {id:"notice", label: t.noticeTab}, {id:"customize", label: t.customizeTab}, {id:"security", label: t.securityTab}
    ];
    if (role === "admin") return [
      {id:"dashboard", label: t.dashboard}, {id:"members", label: t.membersTab},
      {id:"payments", label: t.paymentsTab}, {id:"dues", label: t.duesTab},
      {id:"reports", label: t.reportsTab}, {id:"notice", label: t.noticeTab}
    ];
    return [
      {id:"dashboard", label: t.memberDashboard}, {id:"pay", label: t.memberPayTab}, {id:"security", label: t.memberSecurityTab}
    ];
  };

  // ── Unified Login Page (No tabs) ──────────────────────────────────────────
  if(!role) return (
    <div style={{
      minHeight:"100vh", fontSize: custom.fontSize,
      background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 40%,#312e81 70%,#1d4ed8 100%)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:20
    }}>
      <style>{animationStyle + `
        .login-input:focus { border-color: ${custom.themeColor} !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.2) !important; outline: none; }
      `}</style>

      <div style={{width:"100%", maxWidth:420, zIndex:10}}>
        <div style={{display:"flex", justifyContent:"flex-end", marginBottom:16}}>
          <button onClick={()=>setLang(lang==="bn"?"en":"bn")} style={{background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:8, padding:"6px 14px", fontSize:12, fontWeight:700, cursor:"pointer", color:"#e2e8f0"}}>🌐 {lang === "bn" ? "English" : "বাংলা"}</button>
        </div>

        <div style={{textAlign:"center", marginBottom:26}}>
          {custom.logoUrl ? <img src={custom.logoUrl} alt="Logo" style={{height:75, marginBottom:12, borderRadius:16}}/> : <div style={{width:70, height:70, margin:"0 auto 12px", background:`linear-gradient(135deg, ${custom.themeColor}, #8b5cf6)`, borderRadius:20, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32}}>🏦</div>}
          <h1 style={{fontWeight:900, fontSize:26, color:"#fff", margin:0}}>{custom.title}</h1>
        </div>

        <div style={{background:"rgba(255,255,255,0.07)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:20, padding:"28px 24px"}}>
          <h3 style={{margin:"0 0 20px 0", color:"#fff", textAlign:"center", fontSize:16, fontWeight:700}}>{t.loginTitle}</h3>
          
          <form onSubmit={handleAutoLogin}>
            <div style={{marginBottom:16}}>
              <label style={{display:"block", fontSize:12, color:"#cbd5e1", fontWeight:600, marginBottom:6}}>{t.userIdLabel}</label>
              <input className="login-input" value={loginId} onChange={e=>setLoginId(e.target.value)} placeholder="e.g. superadmin, ADM001, M001 or Phone" required style={{width:"100%", border:"1.5px solid rgba(255,255,255,0.15)", borderRadius:10, padding:"12px 14px", fontSize:14, background:"rgba(255,255,255,0.06)", color:"#fff", boxSizing:"border-box"}}/>
            </div>
            <div style={{marginBottom:24}}>
              <label style={{display:"block", fontSize:12, color:"#cbd5e1", fontWeight:600, marginBottom:6}}>{t.password}</label>
              <input className="login-input" type="password" value={loginPw} onChange={e=>setLoginPw(e.target.value)} placeholder="••••••••" required style={{width:"100%", border:"1.5px solid rgba(255,255,255,0.15)", borderRadius:10, padding:"12px 14px", fontSize:14, background:"rgba(255,255,255,0.06)", color:"#fff", boxSizing:"border-box"}}/>
            </div>
            <button type="submit" style={{width:"100%", padding:"12px", background: `linear-gradient(90deg, ${custom.themeColor}, #4f46e5)`, color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 12px rgba(0,0,0,0.2)"}}>{t.loginBtn}</button>
          </form>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f8fafc", fontSize:18, fontWeight:700, color:"#1e1b4b"}}>
        Loading Data...
      </div>
    );
  }

  // ── Main Layout (Dashboard) ────────────────────────────────────────────────
  return (
    <div style={{minHeight:"100vh", background:"#f8fafc", fontSize: custom.fontSize}}>
      <style>{animationStyle}</style>
      <div style={{background:"#fff", borderBottom:"1px solid #e5e7eb", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:60, position:"sticky", top:0, zIndex:100}} className="no-print">
        <div style={{display:"flex", alignItems:"center", gap:10}}>
          {custom.logoUrl ? <img src={custom.logoUrl} alt="App Logo" style={{height:35, borderRadius:6}}/> : <span style={{fontSize:24}}>🏦</span>}
          <span style={{fontWeight:800, fontSize:16, color:"#1e1b4b"}}>{custom.title}</span>
          <span className="animated-name" style={{background: role.includes("admin")?"#dbeafe":"#d1fae5", color: role.includes("admin")?"#1d4ed8":"#065f46", borderRadius:99, padding:"2px 10px", fontSize:11, fontWeight:700}}>
            {role === "superadmin" ? t.superadmin : (role === "admin" ? t.admin : currentMemberData?.name)}
          </span>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:12}}>
          <button onClick={()=>setLang(lang==="bn"?"en":"bn")} style={{background:"#f1f5f9", border:"none", borderRadius:8, padding:"6px 14px", fontSize:12, fontWeight:700, cursor:"pointer"}}>🌐 {lang === "bn" ? "English" : "বাংলা"}</button>
          <Btn small variant="ghost" onClick={()=>{setRole(null); setActiveMember(null); setLoginId(""); setLoginPw("");}}>{t.logout}</Btn>
        </div>
      </div>

      <div style={{background:"#fff", borderBottom:"1px solid #e5e7eb", padding:"0 24px", display:"flex", gap:4, overflowX:"auto"}} className="no-print">
        {getTabsByRole().map(tab => (
          <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{padding:"14px 16px", border:"none", background:"none", cursor:"pointer", fontWeight:activeTab===tab.id?700:500, color:activeTab===tab.id?custom.themeColor:"#6b7280", borderBottom:activeTab===tab.id?`2.5px solid ${custom.themeColor}`:"2.5px solid transparent", fontSize:14, whiteSpace:"nowrap"}}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{maxWidth:1100, margin:"0 auto", padding:"28px 20px"}}>
        {role.includes("admin") && activeTab==="dashboard" && <AdminDashboard members={members} payments={payments} lang={lang} themeColor={custom.themeColor}/>}
        {role.includes("admin") && activeTab==="payments"  && <AdminPayments  members={members} payments={payments} setPayments={setPayments} showToast={showToast} lang={lang} role={role} themeColor={custom.themeColor}/>}
        {role.includes("admin") && activeTab==="members"   && <AdminMembers   members={members} setMembers={setMembers} showToast={showToast} lang={lang} role={role} themeColor={custom.themeColor}/>}
        {role.includes("admin") && activeTab==="dues"      && <AdminDues      members={members} payments={payments} lang={lang}/>}
        {role.includes("admin") && activeTab==="reports"   && <AdminReports   members={members} payments={payments} lang={lang} custom={custom}/>}
        {role.includes("admin") && activeTab==="notice"    && <AdminNotices   notices={notices} setNotices={setNotices} showToast={showToast} themeColor={custom.themeColor}/>}
        
        {role === "superadmin" && activeTab === "admins"    && <SuperAdminList admins={admins} setAdmins={setAdmins} showToast={showToast} lang={lang} themeColor={custom.themeColor}/>}
        {role === "superadmin" && activeTab === "customize" && <SuperAdminCustomize custom={custom} setCustom={setCustom} showToast={showToast} lang={lang} themeColor={custom.themeColor}/>}
        {role === "superadmin" && activeTab === "security"  && <PasswordSettingsGlobal currentPassword={superPassword} setPassword={setSuperPassword} showToast={showToast} labelText="Change Super Admin Password" onSave={async (pw)=>{const c={...custom,superPassword:pw}; setCustom(c); await saveConfig(c);}}/>}
        
        {role === "member" && activeTab === "dashboard" && <MemberDashboard member={currentMemberData} payments={payments} notices={notices} lang={lang} custom={custom}/>}
        {role === "member" && activeTab === "pay"       && <MemberPayment  member={currentMemberData} payments={payments} setPayments={setPayments} showToast={showToast} lang={lang} themeColor={custom.themeColor}/>}
        {role === "member" && activeTab === "security"  && <PasswordSettingsGlobal currentPassword={currentMemberData?.password} setPassword={(newPw) => {const mem = {...currentMemberData, password: newPw}; setMembers(prev => prev.map(m => m.memberId === mem.memberId ? mem : m)); saveMember(mem);}} showToast={showToast} labelText={t.memberSecurityTab}/>}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type}/>}
    </div>
  );
}