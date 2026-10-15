import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function useListParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryKey = searchParams.toString();

  const params = useMemo(() => Object.fromEntries(new URLSearchParams(queryKey)), [queryKey]);
  const page = Math.max(parseInt(params.page, 10) || 1, 1);

  // changes: { department: 'QA' }. An empty value removes the key from the URL.
  // Any change except "page" sends the user back to page 1.
  const updateParams = useCallback(
    (changes) => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        Object.entries(changes).forEach(([key, value]) => {
          if (value === '' || value === undefined || value === null) next.delete(key);
          else next.set(key, value);
        });
        if (!('page' in changes)) next.delete('page');
        return next;
      });
    },
    [setSearchParams]
  );

  const clearParams = useCallback(() => setSearchParams({}), [setSearchParams]);

  return { params, page, queryKey, updateParams, clearParams };
}