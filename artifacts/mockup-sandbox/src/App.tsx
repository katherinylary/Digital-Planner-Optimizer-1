import { useEffect } from "react";
import "./index.css";

function App() {
  useEffect(() => {
    document.title = "Planner";
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui",
      background: "#f5f5f5"
    }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 600 }}>
          Meu Planner
        </h1>
        <p style={{ marginTop: "10px", color: "#666" }}>
          Site funcionando ✔️
        </p>
      </div>
    </div>
  );
}

export default App;
