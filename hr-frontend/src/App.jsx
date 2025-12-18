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
          setUser(null);
        }
      }
    }
    bootstrap();
  }, []);

  return <AppRoutes />;
}

export default App;
