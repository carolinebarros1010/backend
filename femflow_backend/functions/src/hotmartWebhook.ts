import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK if not already initialized.
admin.initializeApp();

/**
 * HTTP Cloud Function to handle Hotmart webhook notifications.
 * Saves raw events and updates user access based on purchase status.
 */
export const hotmartWebhook = functions.https.onRequest(async (req, res) => {
  try {
    // TODO: Validate Hotmart webhook signature using HOTMART_WEBHOOK_SECRET.
    const signature = req.get("x-signature");
    // if (!verifyHotmartSignature(signature, req.rawBody)) { return res.status(403).send({ ok: false }); }

    const event = req.body;
    const eventId = String(event?.id ?? Date.now());

    // Persist raw event for auditing.
    await admin.firestore().collection("webhooks").doc("hotmart").collection("events")
      .doc(eventId).set({
        receivedAt: admin.firestore.FieldValue.serverTimestamp(),
        raw: event,
      });

    // Example processing logic:
    // Assume Hotmart sends fields like: { buyer: { uid }, product: { name }, status: "APPROVED" }
    const status = (event.status || event.event || "").toLowerCase();
    const uid = event.buyer?.uid;
    const product = event.product?.name || "";

    if (uid) {
      // Record the payment event.
      await admin.firestore().collection("payments").doc(eventId).set({
        provider: "hotmart",
        uid,
        status,
        product,
        rawPayload: event,
      }, { merge: true });

      if (status === "approved" || status === "paid" || status === "approved_payment") {
        // Grant premium access and/or ebook access.
        await admin.firestore().collection("athletes").doc(uid).set({ status: "premium" }, { merge: true });
        // Optionally assign custom claim premium via Auth.
        // await admin.auth().setCustomUserClaims(uid, { premium: true });
      }
    }

    return res.status(200).send({ ok: true });
  } catch (error: any) {
    console.error("Error handling Hotmart webhook:", error);
    return res.status(500).send({ ok: false, error: error?.message });
  }
});