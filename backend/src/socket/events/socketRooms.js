import { hrmsPool } from "../../config/mySqlDB.js";

const socketRooms = (socket, io) => {
  socket.on("joinRooms", async (user) => {
    socket.join(`user_${user.id}`);

    if (user.role_id) {
      socket.join(`role_${user.role_id}`);
    }

    if (user.region_ids?.length) {
      user.region_ids.forEach((regionId) => {
        socket.join(`region_${regionId}`);
      });
    }

    if (user.zone_ids?.length) {
      user.zone_ids.forEach((zoneId) => {
        socket.join(`zone_${zoneId}`);
      });
    }

    if (user.city_ids?.length) {
      user.city_ids.forEach((cityId) => {
        socket.join(`city_${cityId}`);
      });
    }

    socket.join("all_leads");

    socket.userId = user.id;
    socket.cityIds = user.city_ids;

    try {
      await hrmsPool.query("UPDATE users SET is_online = 1 WHERE id = ?", [
        user.id,
      ]);

      // Jis city ka advisor hai, usi city room ko realtime update bhejo
      if (user.city_ids?.length) {
        user.city_ids.forEach((cityId) => {
          io.to(`city_${cityId}`).emit("advisor_status_changed", {
            advisorId: user.id,
            isOnline: true,
          });
        });
      }
    } catch (err) {
      console.error("Error setting advisor online:", err);
    }
    // -------------------------------

    socket.on("disconnect", async () => {
      try {
        if (!socket.userId) return;

        await hrmsPool.query("UPDATE users SET is_online = 0 WHERE id = ?", [
          socket.userId,
        ]);

        if (socket.cityIds?.length) {
          socket.cityIds.forEach((cityId) => {
            io.to(`city_${cityId}`).emit("advisor_status_changed", {
              advisorId: socket.userId,
              isOnline: false,
            });
          });
        }

        console.log(`❌ User ${socket.userId} disconnected, marked offline`);
      } catch (err) {
        console.error("Error setting advisor offline:", err);
      }
    });

    console.log(`✅ ${user.fullName} joined rooms`);
  });
};

export default socketRooms;
