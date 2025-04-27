import {
  EditorConfig,
  LexicalNode,
  DecoratorNode,
  NodeKey,
  Spread,
  SerializedLexicalNode,
  LexicalEditor,
} from "lexical";
import { ArxivId } from "./arxiv-utils";
import { ArxivComp } from "./arxiv-component";
import { ReactNode } from "react";

export type SerializedArxivNode = Spread<
  {
    arxivId: ArxivId | null;
    title: string;
  },
  SerializedLexicalNode
>;

export class ArxivNode extends DecoratorNode<ReactNode | null> {
  __arxivId: ArxivId | null = null;
  mojtitl = "";
  selected = false;

  static getType(): "arxiv" {
    return "arxiv";
  }

  setSelected(selected: boolean): void {
    this.getWritable().selected = selected;
  }

  static clone(node: ArxivNode): ArxivNode {
    return new ArxivNode(node.__arxivId, node.mojtitl, node.__key);
  }

  constructor(arxivId: ArxivId | null, title: string, key?: NodeKey) {
    super(key);
    this.__arxivId = arxivId;
    this.mojtitl = title;
  }

  static importJSON(serializedNode: SerializedArxivNode): ArxivNode {
    const node = $createArxivNode(serializedNode.arxivId, serializedNode.title);
    return node;
  }

  exportJSON(): SerializedArxivNode {
    return {
      arxivId: this.__arxivId,
      title: this.mojtitl,
      type: "arxiv",
      version: 1,
    };
  }

  getTextContent(): string {
    return this.__arxivId ?? "";
  }

  createDOM(config: EditorConfig): HTMLElement {
    // const dom = super.createDOM(config);
    // dom.className = this.__className;
    // return dom;
    return document.createElement("span");
  }

  updateDOM(prevNode: ArxivNode): boolean {
    // If the inline property changes, replace the element
    return (
      this.__arxivId !== prevNode.__arxivId || this.mojtitl !== prevNode.mojtitl
    );
  }

  decorate(editor: LexicalEditor, config: EditorConfig): ReactNode | null {
    return (
      <ArxivComp
        id={this.__arxivId}
        title={this.mojtitl}
        selected={this.selected}
        onChange={(id, title) => {
          editor.update(() => {
            const writable = this.getWritable();
            writable.__arxivId = id;
            writable.mojtitl = title;
          });
        }}
      />
    );
  }
}

export function $isArxivNode(
  node: LexicalNode | null | undefined,
): node is ArxivNode {
  return node instanceof ArxivNode;
}

export function $createArxivNode(arxivId: ArxivId | null, title: string) {
  return new ArxivNode(arxivId, title);
}
