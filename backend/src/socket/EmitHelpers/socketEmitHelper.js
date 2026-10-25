// helpers/socketEmitHelper.js

const emitToHierarchy = ({ io, eventName, lead, userIdKey }) => {
  // User
  if (lead[userIdKey]) {
    io.to(`user_${lead[userIdKey]}`).emit(eventName, lead);
  }
  if (lead.advisor_id) {
    io.to(`user_${lead.advisor_id}`).emit(eventName, lead);
  }

  // City
  if (lead.city_id) {
    io.to(`city_${lead.city_id}`).emit(eventName, lead);
  }

  // Zone
  if (lead.zone_id) {
    io.to(`zone_${lead.zone_id}`).emit(eventName, lead);
  }

  // Region
  if (lead.region_id) {
    io.to(`region_${lead.region_id}`).emit(eventName, lead);
  }

  // CEO
  io.to("all_leads").emit(eventName, lead);
};

export default emitToHierarchy;
