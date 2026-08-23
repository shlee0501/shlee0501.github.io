const ME = "Sanghyeon Lee";

function esc(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderAuthors(authors) {
  return (authors || [])
    .map(a => (a === ME ? `<span class="me">${esc(a)}</span>` : esc(a)))
    .join(", ");
}

function link(label, href) {
  if (!href) return "";
  return `<a href="${esc(href)}">${esc(label)}</a>`;
}

function unavailableLink(label) {
  return `<span class="pub-link-unavailable" aria-disabled="true">${esc(label)}</span>`;
}

function renderLinks(items) {
  const filtered = items.filter(Boolean);
  if (filtered.length === 0) return "";
  return `[${filtered.join(" | ")}]`;
}

/**
 * Sort newest first:
 *  - year (desc)
 *  - month (desc), month is 1–12
 */
function sortByDateDesc(a, b) {
  const ay = Number(a.year ?? 0);
  const by = Number(b.year ?? 0);
  if (by !== ay) return by - ay;

  const am = Number(a.month ?? 0);
  const bm = Number(b.month ?? 0);
  return bm - am;
}

async function loadPubs() {
  const container = document.getElementById("pub-list");
  const url = "data/publications.json";

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    let pubs = data.publications || [];
    pubs = pubs.slice().sort(sortByDateDesc);

    if (pubs.length === 0) {
      container.innerHTML = `<div class="muted body">No publications yet.</div>`;
      return;
    }

    container.innerHTML = pubs.map(p => {
      const L = p.links || {};

      const paper = L.paper_pdf || L.paper || null;
      const links = renderLinks([
        paper ? link("Paper", paper) : (L.paper_label ? unavailableLink("Paper") : ""),
        link("Slides", L.slides_pdf || null),
        link("Lightning", L.lightning_pdf || null),
        link("arXiv", L.arxiv || null),
        link("Code", L.code || null),
        link("DOI", L.doi || null),
      ]);

      const award = p.award
        ? `<div class="pub-award">${esc(p.award)}</div>`
        : "";
      const toAppear = p.published === false ? " (To Appear)" : "";
      console.log(p.title, toAppear)

      return `
        <div class="pub">
          <div class="pub-title">${esc(p.title)}</div>
          <div class="pub-authors">${renderAuthors(p.authors)}</div>
          <div class="pub-meta">
            <span class="pub-venue">${esc(p.venue)}</span><span class="pub-year">, ${esc(p.year)}</span><span class="pub-links">${links}</span><span class="pub-year">${esc(toAppear)}</span>
          </div>
          ${award}
        </div>
      `;
    }).join("");
  } catch (e) {
    console.error("loadPubs failed:", e);
    container.innerHTML = `<div class="muted body">Failed to load publications.json</div>`;
  }
}

loadPubs();
