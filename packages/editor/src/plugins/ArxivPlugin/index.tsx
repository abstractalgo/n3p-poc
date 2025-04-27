import { FC, useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils";
import {
  LexicalCommand,
  createCommand,
  $insertNodes,
  $isRootOrShadowRoot,
  $createParagraphNode,
  COMMAND_PRIORITY_EDITOR,
  $getSelection,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { $isArxivNode, $createArxivNode, ArxivNode } from "./arxiv-node";

export { $isArxivNode, $createArxivNode, ArxivNode } from "./arxiv-node";

export const INSERT_ARXIV_COMMAND: LexicalCommand<void> = createCommand(
  "INSERT_ARXIV_COMMAND",
);

export const ArxivPlugin: FC = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([ArxivNode])) {
      throw new Error("ArxivPlugin: ArxivNode not registered on editor");
    }

    return mergeRegister(
      editor.registerCommand(
        INSERT_ARXIV_COMMAND,
        (/* _payload, _editor */) => {
          const node = $createArxivNode(null, "");

          $insertNodes([node]);
          if ($isRootOrShadowRoot(node.getParentOrThrow())) {
            $wrapNodeInElement(node, $createParagraphNode).selectEnd();
          }

          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          const selection = $getSelection();
          // const sel =$isNodeSelection(selection);
          const node = selection?.getNodes()?.[0];

          if (node && $isArxivNode(node)) {
            editor.update(() => {
              node.setSelected(true);
            });
            // console.log('bjuk');
          } else {
            // TODO deselect
            // const prevSel = $getPreviousSelection();
            // const node = prevSel?.getNodes()?.[0];
            // if (node && $isArxivNode(node)) {
            //   editor.update(() => {
            //     node.setSelected(false);
            //   });
            // }
          }
          return false;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    );
  }, [editor]);

  return null;
};
