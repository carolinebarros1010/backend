import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Admin SDK if not already initialized.
admin.initializeApp();

/**
 * HTTP Cloud Function to receive intake data from Typebot or other forms.
 * Saves the questionnaire responses under /athletes/{uid} and triggers plan generation.
 */
export const intake = functions.https.onRequest(async (req, res) => {
  try {
    const data = req.body;
    const uid = data.uid;
    if (!uid) {
      return res.status(400).send({ ok: false, error: "Missing uid in request body" });
    }
    // Merge intake data into athlete document.
    await admin.firestore().collection("athletes").doc(uid).set(data, { merge: true });

    // Optionally, trigger plan generation (could call updatePlansByCycle logic).
    // This example simply logs.
    console.log(`Intake data saved for UID ${uid}`, data);

    return res.status(200).send({ ok: true });
  } catch (error: any) {
    console.error("Error processing intake:", error);
    return res.status(500).send({ ok: false, error: error?.message });
  }
});