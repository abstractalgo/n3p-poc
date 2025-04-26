export type ArxivId = string & {
  __type: "ARXIV-ID";
};

export const ARXIV_API_METADATA_URL = (arxivIds: ArxivId[]) =>
  `http://export.arxiv.org/api/query?id_list=${arxivIds.join(",")}`;

export const extractArxivId = (text: string): ArxivId | null => {
  for (const regex of [
    /\d{4}\.\d{2,5}/, // new format id
    /\w+\-\w+\/\d+/, // old format id
  ]) {
    const matches = text.match(regex);
    if (matches) {
      return matches[0] as ArxivId;
    }
  }
  return null;
};
