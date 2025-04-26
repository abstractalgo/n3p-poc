import { CSSProperties } from "react";
import { SerializedEditorState } from "lexical";

export const EMPTY_EDITOR_STATE = {
  root: {
    children: [
      {
        children: [],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
    ],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
} as unknown as SerializedEditorState;

export const CLAMP_STYLE = ((lines: number): CSSProperties => {
  return {
    display: "-webkit-box",
    lineClamp: lines,
    WebkitLineClamp: `${lines}`,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
    // maxHeight: `${lines}rem`,
  };
})(2);
