const leadSocket = (socket, io) => {

  // ✅ Join PreSales Room
  socket.on("join_presales_room", (presalesId) => {
    socket.join(`presales_${presalesId}`);
    console.log(`Joined Room: presales_${presalesId}`);
  });

  // ✅ Lead Create - Sender ko bhi dikhega
  socket.on("lead:create", (data) => {
    const presalesId = data.presalesId;

    // ✅ Room ke SABKO emit karega (sender bhi included)
    io.to(`presales_${presalesId}`).emit("leadCreated", data);
  });

};

export default leadSocket;