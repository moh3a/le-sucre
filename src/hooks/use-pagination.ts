import { useCallback, useMemo, useState } from "react";

interface UsePaginationProps {
  total: number;
  initialPage?: number;
  initialPerPage?: number;
}

export function usePagination({ total, initialPage = 1, initialPerPage = 20 }: UsePaginationProps) {
  const [page, setPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / perPage)), [total, perPage]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const goTo = useCallback(
    (p: number) => setPage(Math.min(Math.max(1, p), totalPages)),
    [totalPages],
  );

  const goNext = useCallback(() => {
    if (canNext) setPage((p) => p + 1);
  }, [canNext]);

  const goPrev = useCallback(() => {
    if (canPrev) setPage((p) => p - 1);
  }, [canPrev]);

  const changePerPage = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
  }, []);

  const pageNumbers = useMemo(() => {
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      range.push(i);
    }
    if (page - delta > 2) range.unshift(-1); // left ellipsis
    if (page + delta < totalPages - 1) range.push(-1); // right ellipsis
    if (totalPages > 1) range.unshift(1);
    if (totalPages > 1) range.push(totalPages);
    return range;
  }, [page, totalPages]);

  return {
    page,
    perPage,
    totalPages,
    canPrev,
    canNext,
    goTo,
    goNext,
    goPrev,
    changePerPage,
    pageNumbers,
    offset: (page - 1) * perPage,
  };
}
