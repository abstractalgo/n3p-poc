import { createRoot } from "react-dom/client";
import typescriptLogo from "/typescript.svg";
import { Header, Counter } from "@repo/ui";
import { Editor } from "@repo/editor";

import "@repo/editor/style.css";

const App = () => (
  <div>
    <Editor
      mentions={{
        itemRenderer: ({
          // index,
          // isSelected,
          // onClick,
          // onMouseEnter,
          option,
        }) => <div key={option.item.id}>Item {option.item.id}</div>,
        itemText: ({ id }) => `Item ${id}`,
        lookupFn: async (query) => {
          const items = [{ id: "1" }, { id: "2" }];
          if (!query) {
            return items;
          }
          return items.filter((i) => i.id.match(query));
        },
      }}
    />
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
