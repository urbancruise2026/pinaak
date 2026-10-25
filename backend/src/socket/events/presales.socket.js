const presalesSocket = (socket, io) => {
  socket.on("presalesLeadCreated", (lead) => {
    io.to(`user_${lead.presalesId}`).emit("presalesLeadCreated", lead);

    if (lead.zone) {
      io.to(`zone_${lead.zone}`).emit("presalesLeadCreated", lead);
    }

    if (lead.region) {
      io.to(`region_${lead.region}`).emit("presalesLeadCreated", lead);
    }

    if (lead.country) {
      io.to(`country_${lead.country}`).emit("presalesLeadCreated", lead);
    }

    io.to("all_leads").emit("presalesLeadCreated", lead);
  });
};

export default presalesSocket;
