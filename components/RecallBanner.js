export default function RecallBanner({ matches }) {
  if (!matches?.length) return null;
  return (
    <section role="alert" className="mb-5 rounded-xl border-2 border-red-700 bg-red-600 p-4 text-white">
      <h2 className="text-lg font-bold">Possible recall: check {matches.length === 1 ? 'this item' : `these ${matches.length} items`}</h2>
      <ul className="mt-2 space-y-2 text-sm">
        {matches.slice(0, 5).map((m, i) => (
          <li key={i}>
            <span className="font-semibold">{m.itemName}</span> matches &ldquo;{m.title}&rdquo;. {m.hazard}{' '}
            <a href={m.url} target="_blank" rel="noopener noreferrer" className="font-semibold underline">Verify on Product Safety Australia</a>
          </li>
        ))}
      </ul>
      {matches.length > 5 && <p className="mt-2 text-sm">and {matches.length - 5} more.</p>}
    </section>
  );
}
