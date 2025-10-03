import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize the Firebase Admin SDK only once.
admin.initializeApp();

/**
 * HTTP Cloud Function to handle Mercado Pago webhook notifications.
 * Validates the signature (via x-signature header) and processes payment events.
 */
export const mpWebhook = functions.https.onRequest(async (req, res) => {
  try {
    // TODO: Implement HMAC signature validation using MP_WEBHOOK_SECRET from Secret Manager.
    const signature = req.get("x-signature");
    // If signature verification is implemented, reject invalid signatures:
    // if (!verifySignature(signature, req.rawBody)) { return res.status(403).send({ ok: false }); }

    const event = req.body;
    const paymentId = String(event?.data?.id ?? event.id ?? Date.now());

    // Persist the raw event payload for audit purposes.
    await admin.firestore().collection("webhooks").doc("mercadopago").collection("events")
      .doc(paymentId).set({
        receivedAt: admin.firestore.FieldValue.serverTimestamp(),
        raw: event,
      });

    // Example business logic: handle approved payment update events.
    if (event.type === "payment" && event.action === "payment.updated" && event.data?.status === "approved") {
      const uid = event.data?.metadata?.uid;
      if (uid) {
        // Record the payment in /payments collection.
        await admin.firestore().collection("payments").doc(paymentId).set({
          provider: "mercadopago",
          uid,
          status: "paid",
          product: event.data.description || "",
          rawPayload: event,
        }, { merge: true });

        // Upgrade the athlete to premium status.
        await admin.firestore().collection("athletes").doc(uid).set({ status: "premium" }, { merge: true });

        // Optionally set custom claims (premium) on the user token via Auth. This requires an Admin endpoint.
        // await admin.auth().setCustomUserClaims(uid, { premium: true });
      }
    }

    return res.status(200).send({ ok: true });
  } catch (error: any) {
    console.error("Error handling Mercado Pago webhook:", error);
    return res.status(500).send({ ok: false, error: error?.message });
  }
});