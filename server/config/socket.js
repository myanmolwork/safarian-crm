let io;

export const setIo = (socketServer) => {
  io = socketServer;
};

export const getIo = () => io;
