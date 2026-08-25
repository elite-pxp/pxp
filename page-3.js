document.addEventListener('DOMContentLoaded', () => {
  const media = 'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/';
  const product = (title, image, link, kind) => ({ title, image: media + image, link, kind });
  const checkout = id => `https://go.poweredxprayers.com/product-details/product/${id}`;
  const collections = {
    hoodies: [
      product('Pray Hoodie', '6a8760d4ad59e6cfed695ad5.png', checkout('6a874c8628fb07750d30a3f1'), 'Hoodie'),
      product('Build Hoodie', '6a875e2ecdd4b797a35ee536.png', checkout('6a8765afdc2a3afc942b823c'), 'Hoodie'),
      product('Restored by Jesus Hoodie', '6a875a044219e7772eb0807d.png', checkout('6a8751d258536b67d4f1bac4'), 'Hoodie'),
      product('The Word Is My Mirror Hoodie', '6a875a04cdd4b797a3574ccf.png', checkout('6a875471722ac3e8e84b0244'), 'Hoodie'),
      product('Not My Power But His Power Hoodie', '6a875a03ad59e6cfed5d1f04.png', checkout('6a8751b3867fdcb3218cd550'), 'Hoodie'),
      product('Pray Hoodie — Black & White', '6a875a038f3f0ab510ff44e1.png', checkout('6a874b7dd377ef4abb0e09b8'), 'Hoodie'),
      product('Reign in the Spirit Daily Hoodie', '6a875a02e6501a951823f627.png', checkout('6a87518233e47869c69adbb1'), 'Hoodie'),
      product('Faith Sees Beyond the Visible Hoodie', '6a875a02ad59e6cfed5d1ed8.png', checkout('6a8751403d596796d0ad1b29'), 'Hoodie'),
      product('Cultivated Hoodie', '6a875a00e6501a951823f5f3.png', checkout('6a875241d93e1268080cf4c5'), 'Hoodie'),
      product('Rooted in Christ Hoodie', '6a8759ff22c06f5dae84d1d5.png', checkout('6a8752244c7762db1b0c26ee'), 'Hoodie'),
      product('Prayer Room Hoodie', '6a8c2535ad59e6cfede2d7c2.png', checkout('6a87525da9904c4e9a45d9b1'), 'Hoodie')
    ],
    tshirts: [
      product('Restore by Jesus T-Shirt', '6a873a228f3f0ab510ca4faf.png', checkout('6a872e64d93e1268080acdbf'), 'T-Shirt'),
      product('The Word Is My Mirror T-Shirt', '6a873a21e6501a9518e56c48.png', checkout('6a872e3fdc2a3afc94281676'), 'T-Shirt'),
      product('Restore by Jesus T-Shirt — White', '6a873a21994ded095acc7a8f.png', checkout('6a872dc1d377ef4abb0c60cc'), 'T-Shirt'),
      product('Prayer Room T-Shirt', '6a873a21cdd4b797a31cfb85.png', checkout('6a872d75eba69a757e525654'), 'T-Shirt'),
      product('Prayer Led T-Shirt', '6a873a1fe6501a9518e565c9.png', checkout('6a872ccb58536b67d4ef61bc'), 'T-Shirt'),
      product('Build T-Shirt', '6a873a1f8f3f0ab510ca441b.png', 'https://go.poweredxprayers.com/shop', 'T-Shirt'),
      product('Pray T-Shirt', '6a873a1ce6501a9518e55796.png', checkout('6a872b8f04c3021571006b94'), 'T-Shirt'),
      product('Rooted T-Shirt', '6a873a1ccdd4b797a31cf334.png', checkout('6a872d3aef79b113e57c86e6'), 'T-Shirt'),
      product('The Word Is My Mirror T-Shirt', '6a8c54c9cdd4b797a32eb2ba.png', checkout('6a872e3fdc2a3afc94281676'), 'T-Shirt'),
      product('Faith Sees T-Shirt', '6a873a1a8f3f0ab510ca2c2b.png', checkout('6a872ca9d6701e5bc25cb1d1'), 'T-Shirt')
    ],
    books: [
      product('The Process', '6a85b91c1447bf72d964f602.png', checkout('theprocess'), 'E-Book'),
      product('Stop Wishing, Start Building Wealth', '6a85b91c949d6f49c3238903.png', checkout('thewealthroom'), 'E-Book'),
      product('Stop Wishing, Start Working (With Power!)', '6a85b91c8bea83db8de4c06f.png', checkout('6928982fcd500e536d818a98'), 'E-Book / Physical Book'),
      product('The Story of David', '6a85b91c62d760a82d19a940.png', checkout('693aeeed6850553ebe2600b3'), 'E-Book'),
      product('AI in Action', '6a85b91cb3a1bcf4fa84f019.png', checkout('6928980790b2c4352e2261e8'), 'E-Book')
    ],
    training: [
      product('A Guide to Launching Your Childcare Center', '699cc567d0716b216f4ad50b.png', checkout('aguidetolaunchingyourchildcarecenter'), 'Training Course'),
      product('The Wealth Room Next Level Now!', '699cc39ad0716b76214a3d3e.png', checkout('thewealthroom'), 'Training Course')
    ]
  };
  const labels = { hoodies: 'Hoodies', tshirts: 'T-Shirts', books: 'Books', training: 'Training Courses' };
  const track = document.querySelector('[data-product-track]');
  const title = document.querySelector('#catalog-title');
  const tabs = [...document.querySelectorAll('[data-category]')];
  const previous = document.querySelector('[data-carousel-prev]');
  const next = document.querySelector('[data-carousel-next]');
  const searchToggle = document.querySelector('.search-toggle');
  const searchForm = document.querySelector('.shop-search');
  const searchInput = document.querySelector('#product-search');
  const searchClear = document.querySelector('.search-clear');
  const searchSuggestions = document.querySelector('.search-suggestions');
  let active = 'hoodies';
  let searchTerm = '';

  const searchMatches = () => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    return Object.entries(collections).flatMap(([category, products]) => products
      .filter(item => `${item.title} ${item.kind}`.toLowerCase().includes(normalizedTerm))
      .map(item => ({ ...item, category })));
  };

  const renderSuggestions = () => {
    const term = searchTerm.trim();
    if (!term) {
      searchSuggestions.hidden = true;
      searchSuggestions.innerHTML = '';
      return;
    }
    const matches = searchMatches();
    const visibleMatches = matches.slice(0, 6);
    const categories = [...new Set(matches.map(item => item.category))];
    const category = categories.length === 1 ? categories[0] : null;
    const moreLabel = category ? `Show all ${labels[category]}` : `Show all ${matches.length} results`;
    searchSuggestions.hidden = false;
    searchSuggestions.innerHTML = visibleMatches.length
      ? `<p class="search-results-label">${matches.length} matching product${matches.length === 1 ? '' : 's'}</p>${visibleMatches.map(item => `<a href="${item.link}" target="_blank" rel="noopener noreferrer"><span>${item.kind}</span><strong>${item.title}</strong></a>`).join('')}<button class="search-show-more" type="button" data-search-category="${category || ''}">${moreLabel} →</button>`
      : `<p class="search-no-results">No products found for “${term}”. Try hoodie, T-shirt, book, or training.</p>`;
    searchSuggestions.querySelector('.search-show-more')?.addEventListener('click', event => {
      const categoryKey = event.currentTarget.dataset.searchCategory;
      if (categoryKey) {
        active = categoryKey;
        searchTerm = '';
        searchInput.value = '';
      }
      render();
      renderSuggestions();
      searchForm.hidden = true;
      searchToggle.setAttribute('aria-expanded', 'false');
      document.querySelector('#shop')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const render = (direction = 'next') => {
    track.classList.remove('slide-next', 'slide-prev');
    void track.offsetWidth;
    const products = searchTerm.trim() ? searchMatches() : collections[active];
    track.innerHTML = products.length
      ? products.map(item => `<article class="shop-product-card"><img src="${item.image}" alt="${item.title}" loading="lazy"><div><small>${item.kind}</small><h3>${item.title}</h3><a href="${item.link}" target="_blank" rel="noopener noreferrer">View product</a></div></article>`).join('')
      : `<p class="search-empty">No products found for “${searchTerm.trim()}”. Try hoodie, T-shirt, book, or training.</p>`;
    track.classList.add(direction === 'prev' ? 'slide-prev' : 'slide-next');
    title.textContent = searchTerm.trim() ? `Search results for “${searchTerm.trim()}”` : labels[active];
    tabs.forEach(tab => { const selected = !searchTerm.trim() && tab.dataset.category === active; tab.classList.toggle('selected', selected); tab.setAttribute('aria-selected', String(selected)); });
    track.scrollTo({ left: 0, behavior: 'auto' });
  };
  tabs.forEach(tab => tab.addEventListener('click', () => {
    active = tab.dataset.category;
    searchTerm = '';
    if (searchInput) searchInput.value = '';
    render();
  }));
  previous.addEventListener('click', () => track.scrollBy({ left: -Math.max(260, track.clientWidth * .82), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: Math.max(260, track.clientWidth * .82), behavior: 'smooth' }));
  if (searchToggle && searchForm && searchInput && searchClear && searchSuggestions) {
    searchToggle.addEventListener('click', () => {
      const isOpen = !searchForm.hidden;
      searchForm.hidden = isOpen;
      searchToggle.setAttribute('aria-expanded', String(!isOpen));
      if (!isOpen) searchInput.focus();
    });
    searchForm.addEventListener('submit', event => event.preventDefault());
    searchInput.addEventListener('input', () => { searchTerm = searchInput.value; renderSuggestions(); });
    searchClear.addEventListener('click', () => { searchInput.value = ''; searchTerm = ''; renderSuggestions(); searchInput.focus(); });
  }
  render();
});
