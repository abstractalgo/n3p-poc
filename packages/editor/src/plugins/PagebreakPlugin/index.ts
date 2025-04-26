import { useCallback, useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { toggleLink } from "@lexical/link";
import { mergeRegister, $splitNode } from "@lexical/utils";
import {
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  $isRootNode,
  $setSelection,
  SerializedEditorState,
} from "lexical";
import { EMPTY_EDITOR_STATE } from "../../constants";

type PagebreakPluginProps = {
  onPagebreak?: (below: SerializedEditorState) => void;
};

export const PagebreakPlugin = ({
  onPagebreak,
}: PagebreakPluginProps): null => {
  const [editor] = useLexicalComposerContext();

  const keydownHandler = useCallback(
    (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "Enter") {
        editor.update(() => {
          const selection = $getSelection();

          if ($isRangeSelection(selection)) {
            const p = selection.insertParagraph();

            if (p) {
              const [rootNode] = p.getParents();
              if ($isRootNode(rootNode)) {
                console.log("bla");
                const idx = p.getIndexWithinParent();
                const childrenCnt = rootNode.getChildrenSize();
                const jsonBefore = editor.getEditorState().toJSON();
                const jsonAfter = JSON.parse(
                  JSON.stringify(jsonBefore),
                ) as typeof jsonBefore;

                jsonBefore.root.children.splice(idx, childrenCnt - idx);
                jsonAfter.root.children.splice(0, idx + 1);

                // editor.setEditorState(editor.parseEditorState(jsonBefore));
                // $setSelection()

                onPagebreak?.(jsonAfter);
              }
            }
          }
        });
      }
    },
    [editor, onPagebreak],
  );

  useEffect(() => {
    return mergeRegister(
      editor.registerRootListener((rootElement, prevRootElement) => {
        if (prevRootElement !== null) {
          prevRootElement.removeEventListener("keydown", keydownHandler);
        }
        if (rootElement !== null) {
          rootElement.addEventListener("keydown", keydownHandler);
        }
      }),
    );
  }, [editor, keydownHandler]);

  return null;
};
