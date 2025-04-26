import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { FC } from "react";

import { MD_TRANSFORMERS } from "./md-transformers";

export const MarkdownPlugin: FC = () => {
  return <MarkdownShortcutPlugin transformers={MD_TRANSFORMERS} />;
};
