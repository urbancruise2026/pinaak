import { LeadRecord } from "@/types/types";
import { getSocket, connectSocket, disconnectSocket } from "./index";

// ================================
// PRESALES LEAD LISTENERS
// ================================

export const listenToPresalesLeads = (callback: (data: LeadRecord) => void) => {
  const socket = getSocket();

  socket.off("presalesLeadCreated");

  socket.on("presalesLeadCreated", (data) => {
    console.log("📨 Presales Lead Realtime:", data);

    callback(data);
  });
};


export const listenToAdviserLeads = (callback: (data: LeadRecord) => void) => {
  const socket = getSocket();

  socket.off("adviserLeadAssigned");

  socket.on("adviserLeadAssigned", (data) => {
    console.log("📨 Adviser Lead Assigned:", data);

    callback(data);
  });
};


export const listenToLeadUpdated = (callback: (data: LeadRecord) => void) => {
  const socket = getSocket();

  socket.off("leadUpdated");

  socket.on("leadUpdated", (data) => {
    console.log("♻️ Lead Updated:", data);

    callback(data);
  });
};


export const listenToLeadStatusChanged = (
  callback: (data: LeadRecord) => void,
) => {
  const socket = getSocket();

  socket.off("leadStatusChanged");

  socket.on("leadStatusChanged", (data) => {
    console.log("🔄 Lead Status Changed:", data);

    callback(data);
  });
};


export const removeLeadListeners = () => {
  const socket = getSocket();

  socket.off("presalesLeadCreated");

  socket.off("adviserLeadAssigned");

  socket.off("leadUpdated");

  socket.off("leadStatusChanged");
};

export { connectSocket, disconnectSocket, getSocket };
