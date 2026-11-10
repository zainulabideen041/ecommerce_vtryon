// The admin API returns 50 records by default. Keep a full order book for the
// overview and client-side filters, and never turn a failed later page into
// a misleading empty-history result.
export async function collectAdminOrderPages(fetchPage) {
  let first;
  try {
    first = await fetchPage(1);
  } catch (error) {
    if (error.response?.status === 404) return { success: true, data: [] };
    throw error;
  }
  if (!first.success) return first;
  const pages = Math.max(
    1,
    Number.parseInt(first.pagination?.totalPages, 10) || 1,
  );
  const data = [...(first.data || [])];
  for (let page = 2; page <= pages; page++) {
    const next = await fetchPage(page);
    if (!next.success) throw new Error("An order page could not be loaded.");
    data.push(...(next.data || []));
  }
  return { ...first, data };
}
