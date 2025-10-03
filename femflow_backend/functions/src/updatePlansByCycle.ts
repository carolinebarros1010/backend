import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Ensure Admin SDK initialization happens once.
admin.initializeApp();

/**
 * Scheduled Cloud Function to update training plans for all athletes based on their menstrual cycle.
 * Runs every 24 hours via Cloud Scheduler (configured externally).
 */
export const updatePlansByCycle = functions.pubsub.schedule("every 24 hours").onRun(async () => {
  const snap = await admin.firestore().collection("athletes").get();
  const batch = admin.firestore().batch();
  snap.forEach(doc => {
    const d = doc.data();
    const phase = inferPhase(d.menstrualCycle?.lastStart, d.menstrualCycle?.length ?? 28);
    // Create a new plan doc for each athlete.
    const planRef = admin.firestore().collection("plans").doc();
    batch.set(planRef, buildPlan(doc.id, phase, d.level ?? "iniciante"));
    // Update currentPlanId reference on the athlete doc.
    batch.set(doc.ref, { currentPlanId: planRef.id }, { merge: true });
  });
  await batch.commit();
  return null;
});

function inferPhase(lastStartISO?: string, length = 28): "menstrual" | "follicular" | "ovulatory" | "luteal" {
  if (!lastStartISO) return "follicular";
  const days = Math.floor((Date.now() - Date.parse(lastStartISO)) / 86400000) % length;
  if (days <= 4) return "menstrual";
  if (days <= 13) return "follicular";
  if (days <= 16) return "ovulatory";
  return "luteal";
}

function buildPlan(uid: string, phase: string, level: string) {
  const rpeBase: { [key: string]: number } = { menstrual: 5, follicular: 7, ovulatory: 8, luteal: 6 };
  const target = rpeBase[phase] || 6;
  return {
    ownerUid: uid,
    phase,
    level,
    split: "ABC",
    validFrom: new Date().toISOString(),
    sessions: [
      {
        day: "Seg",
        warmup: "RespiraFlow 5’",
        main: "A – Pernas/Glúteos",
        targetRPE: target,
        volumeMin: 40,
        cooldown: "Mobilidade 5’",
      },
      {
        day: "Qua",
        warmup: "RespiraFlow 5’",
        main: "B – Costas/Core",
        targetRPE: target,
        volumeMin: 35,
        cooldown: "Mobilidade 5’",
      },
      {
        day: "Sex",
        warmup: "RespiraFlow 5’",
        main: "C – Superiores",
        targetRPE: target,
        volumeMin: 35,
        cooldown: "Mobilidade 5’",
      },
    ],
  };
}