// import admin from "../config/firebase.js";

// export const sendNotification = async (title, body, tokens) => {


//   if (!tokens || tokens.length === 0) {
//     console.log("⚠️ No tokens available - aborting");
//     return null;
//   }

//   const message = {
//     notification: {
//       title: title,
//       body: body,
//     },
//     tokens: tokens,
//     android: {
//       priority: "high"
//     },
//     apns: {
//       payload: {
//         aps: {
//           sound: "default"
//         }
//       }
//     }
//   };

//   try {
//     const startTime = Date.now();
//     const response = await admin.messaging().sendEachForMulticast(message);
//     const endTime = Date.now();
    

    
//     // Handle failed tokens
//     if (response.failureCount > 0) {
//       console.log("🔍 Processing failed tokens...");
//       const failedTokens = [];
//       response.responses.forEach((resp, idx) => {
//         if (!resp.success) {
//           failedTokens.push({
//             token: tokens[idx],
//             error: resp.error?.message || "Unknown error"
//           });
//           console.log(`   ❌ Token ${idx}:`, resp.error?.message);
//         }
//       });
//       console.log("📊 Failed tokens summary:", failedTokens.length);
//     }
    
//     console.log("✅ Notification process completed");
//     console.log("================================\n");
    
//     return {
//       success: response.successCount,
//       failure: response.failureCount,
//       responses: response.responses
//     };
//   } catch (err) {
//     console.error("❌ FCM Error:", err);
//     console.error("📋 Error details:", {
//       code: err.code,
//       message: err.message,
//       stack: err.stack
//     });
//     console.log("================================\n");
//     throw err;
//   }
// };