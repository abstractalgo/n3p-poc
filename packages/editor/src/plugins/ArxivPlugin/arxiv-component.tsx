import { FC, KeyboardEventHandler, useEffect, useState } from "react";
import { ARXIV_API_METADATA_URL, ArxivId, extractArxivId } from "./arxiv-utils";

export const ArxivComp: FC<{
  id: ArxivId | null;
  title: string;
  onChange: (id: ArxivId | null, title: string) => void;
  selected: boolean;
}> = ({ id, title, onChange, selected }) => {
  const [text, setText] = useState<string>(id ?? "");
  const [status, setStatus] = useState<"idle" | "bad" | "good">("idle");

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const arxivId = extractArxivId(text);
      if (!arxivId) {
        setStatus("bad");
        return;
      }

      onChange(arxivId, "");
      setStatus("idle");
    }
    e.stopPropagation();
  };

  useEffect(() => {
    const fetchMeta = async () => {
      if (!id) {
        return;
      }
      try {
        const res = await fetch(ARXIV_API_METADATA_URL([id]));
        const text = await res.text();
        const data = new window.DOMParser().parseFromString(text, "text/xml");

        const title =
          data.children.item(0)?.children.item(7)?.children.item(3)
            ?.innerHTML ?? "";

        onChange(id, title);

        setStatus("good");
      } catch (e) {
        console.error(e);
        setStatus("bad");
      }
    };

    fetchMeta();
  }, [id, onChange]);

  return (
    <span
      className="relative"
      style={{
        // display: 'inline-block',
        // maxWidth: '300px',
        border: `1px solid ${selected ? "blue" : "#aa142d"}`,
        margin: "0 3px",
      }}
    >
      {/* <div className="absolute bottom-full left-0">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="ArXiv ID..."
        />
      </div> */}
      <span className="inline-flex gap-1 items-center">
        <img
          src={`https://www.google.com/s2/favicons?domain=${encodeURI("https://arxiv.org")}&sz=${32}`}
          width={16}
          height={16}
        />
        <span>{title}</span>
      </span>
    </span>
  );
};
