import { createRoot } from "react-dom/client";
import "./style.css";
import "@repo/editor/style.css";
import typescriptLogo from "/typescript.svg";
import { Header, Counter } from "@repo/ui";
import { Editor } from "@repo/editor";

const App = () => (
  <div>
    <Editor />
    <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
      <img src="/vite.svg" className="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer">
      <img
        src={typescriptLogo}
        className="logo vanilla"
        alt="TypeScript logo"
      />
    </a>
    <Header title="Web" />
    <div className="card">
      <Counter />
    </div>
  </div>
);

createRoot(document.getElementById("app")!).render(<App />);
