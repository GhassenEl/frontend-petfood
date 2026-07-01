/** Filtres avancés — avis client */

export const DEFAULT_REVIEW_ADVANCED = {
  productId: 'all',
  dateFrom: '',
  dateTo: '',
  minRating: 1,
  maxRating: 5,
  sentiment: 'all',
  sortBy: 'date-desc',
  withCommentOnly: false,
  aiOnly: false,
};

const productOf = (r) => r?.product || r?.productId;

const reviewDate = (r) => {
  const d = r?.createdAt || r?.updatedAt;
  return d ? new Date(d) : null;
};

const pidOf = (r) => {
  const p = productOf(r);
  return p?.id || p?._id || r?.productId || '';
};

export const countActiveReviewFilters = (advanced, { search, filter, emotionFilter } = {}) => {
  let n = 0;
  if (search?.trim()) n += 1;
  if (filter !== 'all') n += 1;
  if (emotionFilter !== 'all') n += 1;
  if (!advanced) return n;
  if (advanced.productId !== 'all') n += 1;
  if (advanced.dateFrom || advanced.dateTo) n += 1;
  if (advanced.minRating > 1 || advanced.maxRating < 5) n += 1;
  if (advanced.sentiment !== 'all') n += 1;
  if (advanced.withCommentOnly) n += 1;
  if (advanced.aiOnly) n += 1;
  if (advanced.sortBy !== 'date-desc') n += 1;
  return n;
};

export const filterAndSortReviews = (
  reviews,
  {
    search = '',
    filter = 'all',
    emotionFilter = 'all',
    advanced = DEFAULT_REVIEW_ADVANCED,
    emotions = [],
  } = {},
) => {
  let list = [...reviews];

  if (filter !== 'all' && filter.startsWith('star-')) {
    const n = Number(filter.replace('star-', ''));
    list = list.filter((r) => r.rating === n);
  } else if (filter === 'ai') {
    list = list.filter((r) => r.aiSuggested);
  }

  if (emotionFilter !== 'all') {
    list = list.filter((r) => (r.emotion || 'neutral') === emotionFilter);
  }

  if (advanced.productId !== 'all') {
    list = list.filter((r) => String(pidOf(r)) === String(advanced.productId));
  }

  if (advanced.minRating > 1 || advanced.maxRating < 5) {
    list = list.filter((r) => {
      const rating = Number(r.rating) || 0;
      return rating >= advanced.minRating && rating <= advanced.maxRating;
    });
  }

  if (advanced.sentiment !== 'all') {
    list = list.filter((r) => (r.sentiment || 'neutral') === advanced.sentiment);
  }

  if (advanced.withCommentOnly) {
    list = list.filter((r) => String(r.comment || '').trim().length > 0);
  }

  if (advanced.aiOnly) {
    list = list.filter((r) => r.aiSuggested);
  }

  if (advanced.dateFrom) {
    const from = new Date(advanced.dateFrom);
    from.setHours(0, 0, 0, 0);
    list = list.filter((r) => {
      const d = reviewDate(r);
      return d && d >= from;
    });
  }

  if (advanced.dateTo) {
    const to = new Date(advanced.dateTo);
    to.setHours(23, 59, 59, 999);
    list = list.filter((r) => {
      const d = reviewDate(r);
      return d && d <= to;
    });
  }

  const q = search.trim().toLowerCase();
  if (q) {
    list = list.filter((r) => {
      const p = productOf(r);
      const em = emotions.find((e) => e.id === (r.emotion || 'neutral'));
      const hay = `${p?.name || ''} ${r.comment || ''} ${em?.label || ''} ${r.sentiment || ''}`.toLowerCase();
      return q.split(/\s+/).every((w) => hay.includes(w));
    });
  }

  const sortBy = advanced.sortBy || 'date-desc';
  list.sort((a, b) => {
    if (sortBy === 'rating-desc') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'rating-asc') return (a.rating || 0) - (b.rating || 0);
    const da = reviewDate(a)?.getTime() || 0;
    const db = reviewDate(b)?.getTime() || 0;
    return sortBy === 'date-asc' ? da - db : db - da;
  });

  return list;
};

export const resetReviewAdvanced = () => ({ ...DEFAULT_REVIEW_ADVANCED });
