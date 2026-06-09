import { useEffect } from "react";

import socket
from "./services/socket";

import { BrowserRouter }
from "react-router-dom";

import AppRoutes
from "./routes/AppRoutes";

import useAuthStore
from "./store/authStore";

import { getCurrentUser }
from "./services/authService";

function App() {

  const {
    token,
    setAuth,
    logout,
  } = useAuthStore();

  useEffect(() => {

    const fetchUser =
      async () => {

        try {

          if (!token) return;

          const response =
            await getCurrentUser();

          setAuth(
            response.data,
            token
          );

          if (
            response.data._id
          ) {

            socket.emit(
              "joinRoom",
              response.data._id
            );

          }

        } catch {

          logout();

        }
      };

    fetchUser();

  }, [logout, setAuth, token]);

  return (

    <BrowserRouter>

      {/* Background Glow Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">

        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 blur-3xl rounded-full" />

        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-3xl rounded-full" />

      </div>

      <AppRoutes />

    </BrowserRouter>
  );
}

export default App;
