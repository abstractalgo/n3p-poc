import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { mergeRegister } from "@lexical/utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  SerializedEditorState,
  UNDO_COMMAND,
} from "lexical";
import { INSERT_ARXIV_COMMAND } from "./plugins/ArxivPlugin";

type ToolbarState = {
  canUndo: boolean;
  canRedo: boolean;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  editor: LexicalEditor;
};

const ToolbarCtx = createContext<{
  state: ToolbarState | null;
  setState: (
    stateUpdates: Partial<Omit<ToolbarState, "editor">> & {
      editor: ToolbarState["editor"];
    },
  ) => void;
} | null>(null);

export const useToolbar = () => useContext(ToolbarCtx);

/*
convert to...
insert... (+ slash cmd /)
layout: align, columns
b, i, u, s, sup, sub, code, link, highlight
font: family, size, color, background
*/

export const ToolbarProvider: FC<{ children?: ReactNode }> = ({ children }) => {
  const [currentToolbar, setCurrentToolbar] = useState<ToolbarState | null>(
    null,
  );

  return (
    <ToolbarCtx.Provider
      value={{
        state: currentToolbar,
        setState: (stateUpdates) => {
          setCurrentToolbar((prevState) => {
            if (!prevState) {
              return {
                canUndo: false,
                canRedo: false,
                isBold: false,
                isItalic: false,
                isUnderline: false,
                isStrikethrough: false,
                ...stateUpdates,
              };
            }
            return {
              ...prevState,
              ...stateUpdates,
            };
          });
        },
      }}
    >
      {children}
    </ToolbarCtx.Provider>
  );
};

const LowPriority = 1;

type ToolbarUpdaterProps = {
  onChange?: (value: SerializedEditorState) => void;
  initialContent?: SerializedEditorState | string;
};

export const ToolbarUpdater: FC<ToolbarUpdaterProps> = ({
  onChange,
  initialContent,
}) => {
  const [editor] = useLexicalComposerContext();
  const ctx = useToolbar();

  useEffect(() => {
    if (initialContent) {
      editor.setEditorState(editor.parseEditorState(initialContent));
    }
  }, [editor, initialContent]);

  // const updateToolbar = useCallback(() => {
  //   const selection = $getSelection();
  //   if ($isRangeSelection(selection)) {
  //     ctx.setState({
  //       isBold: selection.hasFormat('bold'),
  //       isItalic: selection.hasFormat('italic'),
  //       isUnderline: selection.hasFormat('underline'),
  //       isStrikethrough: selection.hasFormat('strikethrough'),
  //       editor,
  //     });
  //   }
  // }, []);

  useEffect(() => {
    if (!ctx) {
      if (!onChange) {
        return;
      }

      return mergeRegister(
        editor.registerUpdateListener(({ editorState }) => {
          editorState.read(() => {
            onChange?.(editorState.toJSON());
          });
        }),
      );
    }

    const updateToolbar = () => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        ctx.setState({
          isBold: selection.hasFormat("bold"),
          isItalic: selection.hasFormat("italic"),
          isUnderline: selection.hasFormat("underline"),
          isStrikethrough: selection.hasFormat("strikethrough"),
          editor,
        });
      }
    };

    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          onChange?.(editorState.toJSON());
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (/* _payload, newEditor */) => {
          updateToolbar();
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          ctx.setState({
            canUndo: payload,
            editor,
          });
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          ctx.setState({
            canRedo: payload,
            editor,
          });
          return false;
        },
        LowPriority,
      ),
    );
  }, [editor, ctx, onChange]);

  return null;
};

export const Toolbar: FC = () => {
  const toolbarRef = useRef(null);
  const toolbar = useToolbar();

  if (!toolbar || !toolbar.state) {
    return <div>no current editor</div>;
  }

  const {
    canUndo,
    canRedo,
    isBold,
    isItalic,
    isUnderline,
    isStrikethrough,
    editor,
  } = toolbar.state;

  return (
    <div className="toolbar" ref={toolbarRef}>
      <button
        onClick={() => {
          editor.dispatchCommand(INSERT_ARXIV_COMMAND, undefined);
        }}
      >
        ARXIV
      </button>
      <button
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        className="toolbar-item spaced"
        aria-label="Undo"
      >
        <i className="format undo" />
      </button>
      <button
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        className="toolbar-item"
        aria-label="Redo"
      >
        <i className="format redo" />
      </button>
      <div className="divider" />
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
        className={"toolbar-item spaced " + (isBold ? "active" : "")}
        aria-label="Format Bold"
      >
        <i className="format bold" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
        className={"toolbar-item spaced " + (isItalic ? "active" : "")}
        aria-label="Format Italics"
      >
        <i className="format italic" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
        className={"toolbar-item spaced " + (isUnderline ? "active" : "")}
        aria-label="Format Underline"
      >
        <i className="format underline" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
        }}
        className={"toolbar-item spaced " + (isStrikethrough ? "active" : "")}
        aria-label="Format Strikethrough"
      >
        <i className="format strikethrough" />
      </button>
      <div className="divider" />
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
        }}
        className="toolbar-item spaced"
        aria-label="Left Align"
      >
        <i className="format left-align" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
        }}
        className="toolbar-item spaced"
        aria-label="Center Align"
      >
        <i className="format center-align" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
        }}
        className="toolbar-item spaced"
        aria-label="Right Align"
      >
        <i className="format right-align" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
        }}
        className="toolbar-item"
        aria-label="Justify Align"
      >
        <i className="format justify-align" />
      </button>{" "}
    </div>
  );
};
