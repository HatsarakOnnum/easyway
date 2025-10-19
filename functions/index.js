const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors"); // <-- 1. Import cors

admin.initializeApp();

// 2. สร้าง cors handler (อนุญาตเฉพาะ localhost:3000 หรือทั้งหมดก็ได้)
// อนุญาตทั้งหมด (ง่ายกว่าตอนทดสอบ):
const corsHandler = cors({ origin: "http://localhost:3000" })
// หรือ อนุญาตเฉพาะ localhost:3000 (ปลอดภัยกว่า):
// const corsHandler = cors({ origin: "http://localhost:3000" });

// ... (ฟังก์ชัน addAdminRole เหมือนเดิม) ...
exports.addAdminRole = functions.https.onCall(async (data, context) => {
    // ... โค้ดเดิม ...
});


// เปิดใช้งานฟังก์ชัน callable เดิมอีกครั้ง
exports.toggleUserStatus = functions.https.onCall(async (data, context) => {
    // Log context ที่ได้รับมา เพื่อ DEBUG
    console.log("Callable - Received auth context:", JSON.stringify(context.auth, null, 2));

    // 1. ตรวจสอบสิทธิ์ Admin
    if (context.auth?.token?.admin !== true) {
        console.error("Callable - Permission check failed. Auth token claims:", context.auth?.token);
        throw new functions.https.HttpsError(
            "permission-denied",
            "Only admins can suspend or activate users."
        );
    }

    const { uid, disable } = data;
    console.log("Callable - Received data:", JSON.stringify(data, null, 2));

    if (!uid || typeof disable !== "boolean") {
        console.error("Callable - Invalid arguments received. UID:", uid, "Disable:", disable);
        throw new functions.https.HttpsError(
            "invalid-argument",
            "The function must be called with valid 'uid' (string) and 'disable' (boolean) arguments."
        );
    }

    try {
        console.log("Callable - Attempting to update user. UID before update:", uid);
        // 2. อัปเดตสถานะใน Auth
        await admin.auth().updateUser(uid, { disabled: disable });

        // 3. อัปเดตสถานะใน Firestore
        const newStatus = disable ? "suspended" : "active";
        console.log("Callable - Updating Firestore status for UID:", uid, "to:", newStatus);
        await admin.firestore().collection("users").doc(uid).update({ status: newStatus });

        console.log("Callable - User status updated successfully for UID:", uid);
        return { success: true, newStatus: newStatus };

    } catch (error) {
        console.error("Callable - Error toggling user status for UID:", uid, "Error:", error);
        throw new functions.https.HttpsError(
            "internal",
            "An error occurred while trying to update the user status."
        );
    }
    
});
/**
 * Function ง่ายๆ สำหรับทดสอบการรับ Auth Context
 */
exports.checkAuthContext = functions.https.onCall((data, context) => {
  console.log("checkAuthContext - Received auth context:", JSON.stringify(context.auth, null, 2));

  if (context.auth) {
    console.log("checkAuthContext - Auth UID:", context.auth.uid);
    console.log("checkAuthContext - Auth Token Claims:", context.auth.token);
    return { 
      message: "Successfully received auth context.", 
      uid: context.auth.uid, 
      claims: context.auth.token 
    };
  } else {
    console.error("checkAuthContext - Auth context is undefined or null.");
    throw new functions.https.HttpsError(
      "unauthenticated", 
      "Auth context was not received."
    );
  }
});