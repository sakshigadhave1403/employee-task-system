const getPageNumbers = (page, totalPages) => {
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  const pages = [];
  for (let number = start; number <= end; number += 1) pages.push(number);
  return pages;
};

export default function Pagination({ page, totalPages, total, limit, itemLabel = 'items', onPageChange }) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="table-footer">
      <span>
        Showing {from}-{to} of {total} {itemLabel}
      </span>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            className="pagination__btn"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            &lsaquo;
          </button>

          {getPageNumbers(page, totalPages).map((number) => (
            <button
              key={number}
              type="button"
              className={
                number === page ? 'pagination__btn pagination__btn--active' : 'pagination__btn'
              }
              onClick={() => onPageChange(number)}
            >
              {number}
            </button>
          ))}

          <button
            type="button"
            className="pagination__btn"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            &rsaquo;
          </button>
        </div>
      )}
    </div>
  );
}