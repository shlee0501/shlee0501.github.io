const ME = "Sanghyeon Lee";

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderAuthors(authors) {
  return (authors || []).map(author =>
    author === ME ? `<span class="me">${esc(author)}</span>` : esc(author)
  ).join(", ");
}

function sortByDateDesc(a, b) {
  return Number(b.year ?? 0) - Number(a.year ?? 0) || Number(b.month ?? 0) - Number(a.month ?? 0);
}

async function loadPublications() {
  const list = document.getElementById("pub-list");
  const count = document.getElementById("publication-count");

  try {
    const response = await fetch("data/publications.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const publications = (await response.json()).publications.slice().sort(sortByDateDesc);
    count.textContent = `${publications.length} publications`;

    list.innerHTML = publications.map(publication => {
      const links = publication.links || {};
      const paper = links.paper_pdf || links.paper;
      const action = paper
        ? `<a class="publication-link" href="${esc(paper)}">Paper</a>`
        : links.paper_label ? `<span class="publication-link unavailable" aria-disabled="true">Paper</span>` : "";

      return `<article class="publication-row">
        <div class="publication-year">${esc(publication.year)}</div>
        <div>
          <h3 class="publication-title">${esc(publication.title)}</h3>
          <div class="publication-authors">${renderAuthors(publication.authors)}</div>
          <div class="publication-venue">${esc(publication.venue)}</div>
        </div>
        ${action}
      </article>`;
    }).join("");
  } catch (error) {
    console.error("Unable to load publications:", error);
    list.innerHTML = `<p class="loading">Unable to load publications.</p>`;
  }
}

loadPublications();
