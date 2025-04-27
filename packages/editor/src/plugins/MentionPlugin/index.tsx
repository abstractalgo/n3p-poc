/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { TextNode } from "lexical";
import {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { $createMentionNode } from "./mention-node";
import { getPossibleQueryMatch } from "./utils";
import { SUGGESTION_LIST_LENGTH_LIMIT } from "./config";
export { MentionNode } from "./mention-node";

class MentionTypeaheadOption<
  MentionItem extends { id: string },
> extends MenuOption {
  item: MentionItem;

  constructor(item: MentionItem) {
    super(item.id);
    this.item = item;
  }
}

type MentionsTypeaheadMenuItemComponent<MentionItem extends { id: string }> =
  FC<{
    index: number;
    isSelected: boolean;
    onClick: () => void;
    onMouseEnter: () => void;
    option: MentionTypeaheadOption<MentionItem>;
  }>;

type MentionsLookupFn<MentionItem> = (
  query: null | string,
) => Promise<MentionItem[]>;

export type MentionsPluginProps<MentionItem extends { id: string }> = {
  lookupFn: MentionsLookupFn<MentionItem>;
  itemRenderer: MentionsTypeaheadMenuItemComponent<MentionItem>;
  itemText: (item: MentionItem) => string;
};

export const MentionsPlugin = <MentionItem extends { id: string }>({
  lookupFn,
  itemRenderer: MenuItem,
  itemText,
}: MentionsPluginProps<MentionItem>): ReactNode => {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);

  const [results, setResults] = useState<MentionItem[]>([]);
  const checkForSlashTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  });

  useEffect(() => {
    if (!queryString) {
      setResults([]);
      return;
    }

    lookupFn(queryString).then((newResults) => {
      setResults(newResults);
    });
  }, [queryString, lookupFn]);

  const options = useMemo(
    () =>
      results
        .map((result) => new MentionTypeaheadOption(result))
        .slice(0, SUGGESTION_LIST_LENGTH_LIMIT),
    [results],
  );

  const onSelectOption = useCallback(
    (
      selectedOption: MentionTypeaheadOption<MentionItem>,
      nodeToReplace: TextNode | null,
      closeMenu: () => void,
    ) => {
      editor.update(() => {
        const mentionNode = $createMentionNode(
          itemText(selectedOption.item),
          selectedOption.item.id,
        );
        if (nodeToReplace) {
          nodeToReplace.replace(mentionNode);
        }
        // mentionNode.select();
        closeMenu();
      });
    },
    [editor, itemText],
  );

  const checkForMentionMatch = useCallback(
    (text: string) => {
      const slashMatch = checkForSlashTriggerMatch(text, editor);
      if (slashMatch !== null) {
        return null;
      }
      return getPossibleQueryMatch(text);
    },
    [checkForSlashTriggerMatch, editor],
  );

  return (
    <LexicalTypeaheadMenuPlugin<MentionTypeaheadOption<MentionItem>>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForMentionMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
      ) =>
        anchorElementRef.current && results.length
          ? createPortal(
              <div className="typeahead-popover mentions-menu">
                <ul>
                  {options.map((option, i) => (
                    <MenuItem
                      index={i}
                      isSelected={selectedIndex === i}
                      onClick={() => {
                        setHighlightedIndex(i);
                        selectOptionAndCleanUp(option);
                      }}
                      onMouseEnter={() => {
                        setHighlightedIndex(i);
                      }}
                      key={option.key}
                      option={option}
                    />
                  ))}
                </ul>
              </div>,
              anchorElementRef.current,
            )
          : null
      }
    />
  );
};
