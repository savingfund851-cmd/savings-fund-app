import { db } from "./firebase.js";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
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
