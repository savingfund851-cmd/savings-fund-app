import { db } from "./firebase.js";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot
} from "firebase/firestore";

// ── Collection References ─────────────────────────────────────────────
const COLLECTIONS = {
  members: "members",
  payments: "payments",
  notices: "notices",
  admins: "admins",
  config: "config",
};

// ── Generic Helpers ───────────────────────────────────────────────────
async function getAllDocs(colName) {
  const snapshot = await getDocs(collection(db, colName));
  const docs = [];
  snapshot.forEach((d) => docs.push(d.data()));
  return docs;
}

async function upsertDoc(colName, docId, data) {
  await setDoc(doc(db, colName, docId), data, { merge: true });
}

async function removeDoc(colName, docId) {
  await deleteDoc(doc(db, colName, docId));
}

// ── Load All Data ─────────────────────────────────────────────────────
export async function loadAllData() {
  const [members, payments, notices, admins] = await Promise.all([
    getAllDocs(COLLECTIONS.members),
    getAllDocs(COLLECTIONS.payments),
    getAllDocs(COLLECTIONS.notices),
    getAllDocs(COLLECTIONS.admins),
  ]);

  // Load system config
  let config = null;
  try {
    const configSnap = await getDoc(doc(db, COLLECTIONS.config, "system"));
    if (configSnap.exists()) {
      config = configSnap.data();
    }
  } catch (e) {
    console.warn("Could not load config:", e);
  }

  return { members, payments, notices, admins, config };
}

// ── Realtime Listener ──────────────────────────────────────────────────
export function subscribeToAllData(onUpdate) {
  let data = { members: [], payments: [], notices: [], admins: [], config: null };

  const unsubMembers = onSnapshot(collection(db, COLLECTIONS.members), (snap) => {
    data.members = snap.docs.map(d => d.data());
    onUpdate({ ...data });
  });

  const unsubPayments = onSnapshot(collection(db, COLLECTIONS.payments), (snap) => {
    data.payments = snap.docs.map(d => d.data());
    onUpdate({ ...data });
  });

  const unsubNotices = onSnapshot(collection(db, COLLECTIONS.notices), (snap) => {
    data.notices = snap.docs.map(d => d.data());
    onUpdate({ ...data });
  });

  const unsubAdmins = onSnapshot(collection(db, COLLECTIONS.admins), (snap) => {
    data.admins = snap.docs.map(d => d.data());
    onUpdate({ ...data });
  });

  const unsubConfig = onSnapshot(doc(db, COLLECTIONS.config, "system"), (docSnap) => {
    if (docSnap.exists()) {
      data.config = docSnap.data();
      onUpdate({ ...data });
    }
  });

  return () => {
    unsubMembers();
    unsubPayments();
    unsubNotices();
    unsubAdmins();
    unsubConfig();
  };
}

// ── Members ───────────────────────────────────────────────────────────
export async function saveMember(member) {
  await upsertDoc(COLLECTIONS.members, member.memberId, member);
}

export async function removeMember(memberId) {
  await removeDoc(COLLECTIONS.members, memberId);
}

// ── Payments ──────────────────────────────────────────────────────────
export async function savePayment(payment) {
  await upsertDoc(COLLECTIONS.payments, payment.paymentId, payment);
}

export async function removePayment(paymentId) {
  await removeDoc(COLLECTIONS.payments, paymentId);
}

export async function updatePaymentStatus(paymentId, status) {
  await updateDoc(doc(db, COLLECTIONS.payments, paymentId), { status });
}

// ── Admins ────────────────────────────────────────────────────────────
export async function saveAdmin(admin) {
  await upsertDoc(COLLECTIONS.admins, admin.adminId, admin);
}

export async function removeAdmin(adminId) {
  await removeDoc(COLLECTIONS.admins, adminId);
}

// ── Notices ───────────────────────────────────────────────────────────
export async function saveNotice(notice) {
  await upsertDoc(COLLECTIONS.notices, notice.noticeId, notice);
}

export async function removeNotice(noticeId) {
  await removeDoc(COLLECTIONS.notices, noticeId);
}

// ── System Config (passwords, theme, branding) ────────────────────────
export async function saveConfig(config) {
  await upsertDoc(COLLECTIONS.config, "system", config);
}

export async function initializeDefaultConfig(defaults) {
  const configSnap = await getDoc(doc(db, COLLECTIONS.config, "system"));
  if (!configSnap.exists()) {
    await setDoc(doc(db, COLLECTIONS.config, "system"), defaults);
    return defaults;
  }
  return configSnap.data();
}
