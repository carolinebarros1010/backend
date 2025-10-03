import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

/**
 * Callable function to set custom user claims.
 * Restricted to admin via project IAM or functions auth context.
 */
export const setPremiumClaim = functions.https.onCall(async (data, context) => {
  // Only allow administrators to set claims.
  if (!context.auth) {
    throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
  }
  const callerToken = context.auth.token;
  if (!callerToken.admin) {
    throw new functions.https.HttpsError("permission-denied", "Only administrators can set premium claims.");
  }

  const { uid, premium } = data;
  if (!uid || typeof premium !== "boolean") {
    throw new functions.https.HttpsError("invalid-argument", "The uid and premium parameters are required.");
  }

  await admin.auth().setCustomUserClaims(uid, { premium });
  return { ok: true };
});