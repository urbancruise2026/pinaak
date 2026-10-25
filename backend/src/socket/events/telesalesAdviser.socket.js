const telesalesAdviserSocket = (socket, io) => {
  socket.on("adviserLeadAssigned", (lead) => {
    io.to(`user_${lead.adviserId}`).emit("adviserLeadAssigned", lead);

    if (lead.city) {
      io.to(`city_${lead.city}`).emit("adviserLeadAssigned", lead);
    }

    if (lead.zone) {
      io.to(`zone_${lead.zone}`).emit("adviserLeadAssigned", lead);
    }

    if (lead.region) {
      io.to(`region_${lead.region}`).emit("adviserLeadAssigned", lead);
    }

    if (lead.country) {
      io.to(`country_${lead.country}`).emit("adviserLeadAssigned", lead);
    }

    io.to("all_leads").emit("adviserLeadAssigned", lead);
  });
};

export default telesalesAdviserSocket;
