import { ReactNode, useMemo } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { EXAMPLE_THEME } from "./themes/ExampleTheme";
import { SerializedEditorState } from "lexical";
import { ToolbarUpdater } from "./Toolbar";
import { Placeholder } from "./Placeholder";
import { CLAMP_STYLE } from "./constants";
export { EMPTY_EDITOR_STATE } from "./constants";
export type { SerializedEditorState } from "lexical";
export { Toolbar, ToolbarProvider } from "./Toolbar";
// plugins and nodes
import { TreeViewPlugin } from "./plugins/TreeViewPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { MarkdownPlugin } from "./plugins/MarkdownPlugin";
import { ListMaxIndentLevelPlugin } from "./plugins/ListMaxIndentLevelPlugin";
import { PagebreakPlugin } from "./plugins/PagebreakPlugin";
import { AutoLinkPlugin } from "./plugins/AutoLinkPlugin";
import {
  MentionNode,
  MentionsPluginProps,
  MentionsPlugin,
} from "./plugins/MentionPlugin";
import { SlashMenuPlugin } from "./plugins/SlashMenuPlugin";
// import './themes/editor.css';

const EDITOR_CONFIG = {
  namespace: "n3p-editor-namespace",
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    HorizontalRuleNode,
    CodeHighlightNode,
    CodeNode,
    LinkNode,
    AutoLinkNode,
    MentionNode,
  ],
  onError(error: Error) {
    throw error;
  },
  theme: EXAMPLE_THEME,
} as const satisfies React.ComponentProps<
  typeof LexicalComposer
>["initialConfig"];

type Props<MentionItem extends { id: string }> = {
  onChange?: (value: SerializedEditorState) => void;
  initialContent?: SerializedEditorState | string;
  debug?: true;
  readonly?: true;
  onPagebreak?: (below: SerializedEditorState) => void;
  clamped?: true;
  mentions?: MentionsPluginProps<MentionItem>;
};

export const Editor = <MentionItem extends { id: string }>(
  props: Props<MentionItem>,
): ReactNode => {
  const config = useMemo(
    () => ({ ...EDITOR_CONFIG, editable: !props.readonly }),
    [props.readonly],
  );
  return (
    <LexicalComposer initialConfig={config}>
      <div
        className="editor-container"
        onMouseEnter={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="editor-inner" style={props.clamped ? CLAMP_STYLE : {}}>
          {/* --- META --- */}
          <ToolbarUpdater
            initialContent={props.initialContent}
            onChange={props.onChange}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          {props.debug && <TreeViewPlugin />}
          {/* ...slash autocomplete */}
          {/* ...blocks */}
          {props.mentions && <MentionsPlugin {...props.mentions} />}
          <SlashMenuPlugin />
          {/* ...refs from the paper */}

          {/* --- RTE --- */}
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <MarkdownPlugin />
          <HorizontalRulePlugin />
          {props.onPagebreak && (
            <PagebreakPlugin onPagebreak={props.onPagebreak} />
          )}
          {/* ...FloatingTextFormatToolbarPlugin */}

          {/* --- LINKS --- */}
          <LinkPlugin />
          <ClickableLinkPlugin />
          <AutoLinkPlugin />
          {/* <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} /> */}

          {/* --- LISTS --- */}
          <ListPlugin />
          <CheckListPlugin />
          <TabIndentationPlugin />
          <ListMaxIndentLevelPlugin maxDepth={7} />

          {/* --- FILES & IMAGES --- */}
          {/* <DragDropPaste /> */}
          {/* <ImagesPlugin /> */}
          {/* <InlineImagePlugin /> */}
          {/* ...files and folder uploader */}

          {/* --- CODE --- */}
          {/* <CodeHighlightPlugin /> */}

          {/* --- LATEX --- */}
          {/* <EquationsPlugin /> */}

          {/* --- ANNOTATIONS --- */}
          {/* ...annotations */}

          {/* --- TABLES --- */}
          {/* ...nodes: table, table cell, table row */}
          {/* ...md transformers */}

          {/* --- ACADEMIC --- */}
          {/* <ArxivPlugin /> */}
        </div>
      </div>
    </LexicalComposer>
  );
};
