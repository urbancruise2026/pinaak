// // In production, use a database instead of memory
// let tokens = [];

// export const addToken = (token) => {
//   console.log("\n🔑 ===== TOKEN OPERATION =====");
//   console.log("📝 Adding token:", token.substring(0, 20) + "...");
  
//   if (!tokens.includes(token)) {
//     tokens.push(token);
//     console.log("✅ Token added successfully");
//     console.log("📊 Total tokens now:", tokens.length);
//   } else {
//     console.log("⚠️ Token already exists");
//   }
  
//   console.log("============================\n");
// };

// export const getTokens = () => {
//   console.log(`🔍 Getting tokens: ${tokens.length} available`);
//   return tokens;
// };

// export const removeToken = (token) => {
//   console.log("\n🗑️ ===== REMOVING TOKEN =====");
//   console.log("📝 Removing token:", token.substring(0, 20) + "...");
  
//   const beforeCount = tokens.length;
//   tokens = tokens.filter(t => t !== token);
//   const afterCount = tokens.length;
  
//   console.log(`✅ Removed: ${beforeCount - afterCount} tokens`);
//   console.log(`📊 Total tokens now: ${afterCount}`);
//   console.log("==========================\n");
// };