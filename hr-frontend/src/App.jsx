
// function App() {
//   return <AppRoutes />;
// }

// export default App;


import AppRoutes from "./routes/AppRoutes.jsx";
import { useEffect, useState } from "react";
import { getAccessToken, me } from "../src/services/apiClient"

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function bootstrap() {
      if (getAccessToken()) {
        try {
          const profile = await me();
          setUser(profile);
        } catch {
          // token might be invalid/expired; stay logged out
          setUser(null);
        }
      }
    }
    bootstrap();
  }, []);

  // Provide `user` via context or pass as prop
  return <AppRoutes />;
}

export default App;
