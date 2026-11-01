const query = document.querySelector('#reading-query');
const state = document.querySelector('#reading-state');
const books = [...document.querySelectorAll('[data-book]')];
const normalize = text => text.normalize('NFKC').toLocaleLowerCase('ja').replace(/\s+/g, ' ').trim();
const searchable = new Map(books.map(book => [book, normalize(book.textContent)]));
function filterBooks() {
  const terms = normalize(query.value).split(' ').filter(Boolean);
  let count = 0;
  for (const book of books) {
    const visible = terms.every(term => searchable.get(book).includes(term)) && (!state.value || book.dataset.status.startsWith(state.value));
    book.hidden = !visible;
    if (visible) count++;
  }
  for (const section of document.querySelectorAll('[data-year-section]')) section.hidden = ![...section.querySelectorAll('[data-book]')].some(book => !book.hidden);
  document.querySelector('#reading-count').textContent = `${count}件 / 全${books.length}件の記録`;
  document.querySelector('#reading-empty').hidden = count !== 0;
}
query.addEventListener('input', filterBooks);
state.addEventListener('change', filterBooks);
