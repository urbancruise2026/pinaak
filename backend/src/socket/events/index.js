import presalesSocket from "./presales.socket.js";
import socketRooms from "./socketRooms.js";
import telesalesAdviserSocket from "./telesalesAdviser.socket.js";
// import tripBookingSocket from "./tripBooking.socket.js";

const registerSocketEvents = (socket, io) => {
  socketRooms(socket, io);

  presalesSocket(socket, io);
  // tripBookingSocket(socket, io);
  telesalesAdviserSocket(socket, io);
};

export default registerSocketEvents;
