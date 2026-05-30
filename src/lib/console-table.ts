export function estimate_page_count(page: number, limit: number, items_length: number) {
  return items_length < limit ? page : page + 1;
}
