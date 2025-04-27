import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $applyNodeReplacement,
  $getSelection,
  $isNodeSelection,
  DecoratorNode,
  type EditorConfig,
  LexicalEditor,
  type LexicalNode,
  type NodeKey,
  SerializedLexicalNode,
  type Spread,
} from "lexical";
import { FC, ReactNode, useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

export type SerializedMentionNode = Spread<
  {
    label: string;
    mentionId: string;
  },
  SerializedLexicalNode
>;

// function $convertMentionElement(
//   domNode: HTMLElement
// ): DOMConversionOutput | null {
//   const textContent = domNode.textContent;

//   if (textContent !== null) {
//     const node = $createMentionNode(textContent, );
//     return {
//       node,
//     };
//   }

//   return null;
// }

type Label = string & { __brand: "Label" };
type MentionId = string & { __brand: "MentiondId" };
type ID = string & { __brand: "ID" };

export class MentionNode extends DecoratorNode<ReactNode> {
  __label: Label;
  __mentionId: MentionId;
  id: ID;

  static getType(): "mention" {
    return "mention";
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__label, node.__mentionId, node.__key);
  }
  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    const node = $createMentionNode(
      serializedNode.label,
      serializedNode.mentionId,
    );
    return node;
  }

  constructor(label: Label, mentionId: MentionId, key?: NodeKey) {
    super(key);
    this.id = uuid() as ID;
    this.__mentionId = mentionId;
    this.__label = label;
  }

  createDOM(config: EditorConfig): HTMLElement {
    // dummy
    return document.createElement("span");
  }

  isKeyboardSelectable(): boolean {
    return true;
  }

  getTextContent(): string {
    return this.__label;
  }

  exportJSON(): SerializedMentionNode {
    return {
      type: "mention",
      mentionId: this.__mentionId,
      label: this.__label,
      version: 1,
    };
  }

  updateDOM(prevNode: MentionNode): boolean {
    // If the inline property changes, replace the element
    return this.__label !== prevNode.__label;
  }

  decorate(editor: LexicalEditor, config: EditorConfig): ReactNode {
    return (
      <code data-mention-id={this.__mentionId} id={this.id}>
        {this.__label}
      </code>
    );
    // return (
    //   <MentionNodeComp
    //     label={this.__label}
    //     mentiondId={this.__mentionId}
    //     nodeKey={this.__key}
    //     id={this.id}
    //   />
    // );
  }
}

// const MentionNodeComp: FC<{
//   label: Label;
//   mentiondId: MentionId;
//   nodeKey: MentionNode["__key"];
//   id: string;
// }> = ({ label, mentiondId, nodeKey, id }) => {
//   const [editor] = useLexicalComposerContext();
//   const [isFocused, setIsFocused] = useState(false);

//   useEffect(() => {
//     return editor.registerUpdateListener(({ editorState }) => {
//       const isSelected = editorState.read(() => {
//         const selection = $getSelection();
//         return (
//           $isNodeSelection(selection) &&
//           selection.has(nodeKey) &&
//           selection.getNodes().length === 1
//         );
//       });
//       setIsFocused(isSelected);
//     });
//   }, [editor, nodeKey]);

//   return (
//     <code
//       data-mention-id={mentiondId}
//       id={id}
//       style={{
//         border: `1px solid ${isFocused ? "red" : "transparent"}`,
//       }}
//     >
//       {label}
//     </code>
//   );
// };

export function $createMentionNode(
  label: string,
  mentionId: string,
): MentionNode {
  const mentionNode = new MentionNode(label as Label, mentionId as MentionId);
  return $applyNodeReplacement(mentionNode);
}

export function $isMentionNode(
  node: LexicalNode | null | undefined,
): node is MentionNode {
  return node instanceof MentionNode;
}
