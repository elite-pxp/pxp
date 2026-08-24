document.addEventListener('DOMContentLoaded', () => {
  const gate = document.querySelector('.beta-gate');
  const gateForm = document.querySelector('.beta-gate-form');
  const passwordInput = document.querySelector('#beta-password');
  const passwordToggle = document.querySelector('.beta-password-toggle');
  const gateError = document.querySelector('.beta-gate-error');
  const protectedSections = document.querySelectorAll('body > .site-header, body > main, body > footer');
  const unlockKey = 'pxp-page-2-unlocked';

  const hasAccess = () => {
    try {
      return window.sessionStorage.getItem(unlockKey) === 'true';
    } catch {
      return false;
    }
  };

  const unlockPage = () => {
    try {
      window.sessionStorage.setItem(unlockKey, 'true');
    } catch {
      // The page remains usable even if private browsing blocks session storage.
    }
    document.documentElement.classList.remove('beta-locked');
    gate?.setAttribute('hidden', '');
    protectedSections.forEach(section => { section.inert = false; });
  };

  if (hasAccess()) {
    unlockPage();
  } else {
    protectedSections.forEach(section => { section.inert = true; });
    window.setTimeout(() => passwordInput?.focus(), 0);
  }

  gateForm?.addEventListener('submit', event => {
    event.preventDefault();
    if (passwordInput?.value === '1111') {
      if (gateError) gateError.textContent = '';
      unlockPage();
      return;
    }
    if (gateError) gateError.textContent = 'Incorrect password. Please try again.';
    passwordInput?.select();
  });

  passwordToggle?.addEventListener('click', () => {
    if (!passwordInput) return;
    const showing = passwordInput.type === 'text';
    passwordInput.type = showing ? 'password' : 'text';
    passwordToggle.textContent = showing ? 'Show' : 'Hide';
    passwordToggle.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
    passwordInput.focus();
  });

  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  }));

  const seriesModalTriggers = document.querySelectorAll('[data-series-modal]');
  let openStudyNotePreview = () => {};
  const monthlySeries = {
    january: { name:'January', series:'RESET', theme:'Start Fresh. Begin Again.', videos:[
      ['-O99Y4kILG8','Reset, Realign, Go Forth with Shantal Long','January 6, 2026','Release old patterns, pray with confidence, and move forward with spiritual clarity.'],
      ['1oi5xAgYyu4','Wednesday Session: Building a Consistent Prayer Life','January 13, 2026','Learn simple, scriptural habits that help you stay rooted in daily prayer.'],
      ['MlWYBkHROXc',"Thursday Session: Discovering God\u2019s Purpose Through Scripture",'January 20, 2026',"Explore biblical insight that helps you discern purpose and live aligned with God\u2019s calling."],
      ['frqOolLffs8','Friday Session: Strengthening Spiritual Resilience','January 27, 2026','Receive biblical encouragement to stand firm in faith through pressure and uncertainty.'] ]},
    february: { name:'February', series:'RELEASE', theme:'Let Go. Move Forward.', videos:[
      ['Hu5gbtZsbcg','BREATHE AGAIN','February 3, 2026','Reflect on the grace of God through prayer, biblical truth, and renewed devotion.'],
      ['jSADhcPqGpQ','Releasing Authority with Shantal Long','February 10, 2026',"Enter the week refreshed through worship, thankful prayer, and God\u2019s presence."],
      ['PlCeqAbGN9U','Release the Old Identity with Shantal Long','February 17, 2026','Release old labels and build a steady, gratitude-centered life of faith.'],
      ['mYiw0rO3qSo','Guard Your Release with Shantal Long','February 24, 2026','Discover how prayer, unity, and Christian community keep believers grounded in truth.'] ]},
    march: { name:'March', series:'REFOCUS', theme:'Realign Your Eyes on God.', videos:[
      ['aG4eU8LVzVU','WHO IS YOUR SOURCE?','March 3, 2026',"Strengthen your confidence in prayer by standing on God\u2019s promises."],
      ['MZAiZZcdrZ4','Stop Looking In The Wrong Places.','March 10, 2026',"Return to peace through God\u2019s Word and steady prayer."],
      ['QOqeESjDzmA','Refocus: Live From the Throne','March 17, 2026','Remain steady through uncertainty with biblical perspective and spiritual strength.'],
      ['t2BAf6_z_zk','The Activation Moment - Decree & Move','March 25, 2026',"Release burdens, celebrate God\u2019s goodness, and move forward in faith."],
      ['ZBJrPorLCyc','He Thought He Had Me... But Heaven Was Already There','March 31, 2026',"Settle anxious thoughts and restore quiet confidence in God\u2019s care."] ]},
    april: { name:'April', series:'REALIGN', theme:'Get Back in Divine Position.', videos:[
      ['I7DZerTI9hg','Preparing Your Life to Walk in the Supernatural','April 7, 2026',"Align your decisions, attitude, and focus with God\u2019s wisdom."],
      ['CGpM9zMOX50','WHAT ARE YOU BUILDING ON?','April 14, 2026','Build spiritual resilience by anchoring your heart in scripture.'],
      ['7zyTup1sU2U',"IT'S TIME. I AM DOING A NEW THING - STEP OUT OF THE WINEPRESS",'April 21, 2026','Grow deeper in faith through shared prayer, worship, and truth.'],
      ['aDlh_6UYVWY',"Victory Lap: Closing The Realignment Series With Joseph's Story",'April 28, 2026',"Reflect on God\u2019s mercy and grace with humility, gratitude, and trust."] ]},
    may: { name:'May', series:'REBUILD', theme:'Build Strong. Build Right.', videos:[
      ['Jva-mSBFc9k','R E B U I L D | A Series on Purpose, Process & the Build God Assigned','May 5, 2026','Move from burden to action through lessons from Nehemiah 1–2.'],
      ['Zv4tzmP2OfI','Did You Count the Cost?','May 12, 2026','A timely biblical word and a call to count the cost in your walk with God.'],
      ['Vz-MnpmWfl8','They Will Talk When You Start Building','May 19, 2026','Reconnect, realign, and rebuild what God has assigned you to build.'],
      ['VZygVRaDCUI','The Wall Is Up, Now Fill the City','May 26, 2026','Build beyond the wall and fill the city with faith, prayer, and purpose.'] ]},
    june: { name:'June', series:'RESTORE', theme:'Healing. Restoration. Wholeness.', videos:[
      ['QogDKTsxzUk','Name What the Locust Ate','June 9, 2026','A message from Shantal Long on naming what was lost and believing God for restoration.'],
      ['blfU1dO9p94','You Still Have a Seed | DAY 2 OF RESTORE IS HERE!','June 16, 2026','Believe for restoration over finances, identity, and every place of loss.'],
      ['9lBcgWMiE7g','A New Name “Restore Series”','June 23, 2026','Release the labels from the hard season and receive the new name God is giving.'],
      ['v-QutT_sr9k','Restoration Is Not a Return. It Is an Arrival Beyond the Point of Loss.','June 30, 2026','Discover restoration beyond the point of loss and what God is bringing you into next.'] ]},
    july: { name:'July', series:'REIGN', theme:'Walk in Authority. Live on Purpose.', videos:[
      ['O6oe-i_SrSo','NEW SERIES REIGN | Episode One: The Garden','July 6, 2026','Return to God’s presence and cultivate what He has placed in your hands.'],
      ['JLywR5fLXGI','Reign From the Source','July 14, 2026','Remain planted, drink deep from God’s presence, and reign daily.'],
      ['6z2EkeMtUyg','The Serpent Is Under Your Feet','July 21, 2026','Recognize the enemy’s tactics and walk in the authority Christ has given you.'],
      ['Vy6zqh8eZIc','Reign in the Spirit','July 28, 2026','Let the Holy Spirit lead, sharpen your discernment, and teach you to reign through Christ.'] ]},
    august: { name:'August', series:'REFLECT', theme:'See Clearly. Live Intentionally.', videos:[
      ['fDxOYQK8YJg','The Mirror, Seeing Yourself the Way God Sees You','August 4, 2026',"Look into the mirror of God\u2019s Word and allow the Holy Spirit to transform your heart."],
      ['cs00kGDEXew','REFLECT Week 2: REVEAL — Who Am I Really?','August 11, 2026',"Replace earthly labels with Heaven's language and receive your identity in Christ."],
      ['ZukSJ5lNPkQ','Every Stage Is Preparing You','August 18, 2026',"The Weight of His Glory is a call to look at the process differently. The pressure, the pain, the waiting, and the hidden places are not wasted when God is forming something eternal in you."] ]}
  };
  let activeSeriesModal = null;
  let seriesModalOpener = null;

  const closeSeriesModal = () => {
    if (!activeSeriesModal) return;
    activeSeriesModal.querySelectorAll('iframe').forEach(frame => {
      frame.src = frame.src;
    });
    activeSeriesModal.hidden = true;
    document.body.classList.remove('series-modal-open');
    seriesModalOpener?.focus();
    activeSeriesModal = null;
    seriesModalOpener = null;
  };

  seriesModalTriggers.forEach(trigger => trigger.addEventListener('click', event => {
    const modal = document.getElementById(trigger.dataset.seriesModal);
    if (!modal) return;
    event.preventDefault();
    const month = monthlySeries[trigger.dataset.seriesMonth];
    if (month) {
      const coverImage = trigger.querySelector('img')?.currentSrc || trigger.querySelector('img')?.src || '';
      modal.style.setProperty('--series-cover', `url("${coverImage}")`);
      const coverArt = modal.querySelector('.series-modal-art');
      if (coverArt) {
        coverArt.src = coverImage;
        coverArt.alt = `${month.name} ${month.series} series cover`;
      }
      modal.querySelector('.series-modal-header .kicker').textContent = `365 Days of Transformation · ${month.name}`;
      modal.querySelector('.series-modal-header h2').textContent = `${month.series}: ${month.theme}`;
      modal.querySelector('.series-modal-header div>p:last-child').textContent = `Watch every ${month.name} live session in the ${month.series} series.`;
      modal.querySelector('.series-live-grid').innerHTML = month.videos.map(([id,title,date,description]) => {
        const noteIndex = studyNotes.findIndex(note => note[1] === date);
        const note = studyNotes[noteIndex];
        const noteAction = note
          ? `<button class="series-study-notes" type="button" data-note-index="${noteIndex}">Preview Study Notes</button>`
          : '<span class="series-study-notes-unavailable">Study notes unavailable</span>';
        return `<article class="series-live-card"><iframe src="https://www.youtube.com/embed/${id}" title="${title.replace(/"/g,'&quot;')}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe><div><h3>${title}</h3><p class="series-live-date">${date}</p><p>${description}</p></div></article>`;
      }).join('');
      modal.querySelectorAll('.series-study-notes').forEach(button => button.addEventListener('click', () => {
        const note = studyNotes[Number(button.dataset.noteIndex)];
        if (!note) return;
        closeSeriesModal();
        openStudyNotePreview(note);
      }));
    }
    activeSeriesModal = modal;
    seriesModalOpener = trigger;
    modal.hidden = false;
    document.body.classList.add('series-modal-open');
    modal.querySelector('.series-modal-panel')?.focus();
  }));

  document.querySelectorAll('[data-series-modal-close]').forEach(control => {
    control.addEventListener('click', closeSeriesModal);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && activeSeriesModal) closeSeriesModal();
  });

  const shopModal = document.querySelector('#shop-category-modal');
  const shopModalTitle = shopModal?.querySelector('#shop-modal-title');
  const shopModalGrid = shopModal?.querySelector('.shop-modal-grid');
  const productModal = document.querySelector('#apparel-product-modal');
  const productModalTitle = productModal?.querySelector('#product-modal-title');
  const apparelProductImages = [
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a8760d4ad59e6cfed695ad5.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a875e2ecdd4b797a35ee536.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a875a044219e7772eb0807d.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a875a04cdd4b797a3574ccf.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a875a03ad59e6cfed5d1f04.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a875a038f3f0ab510ff44e1.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a875a02e6501a951823f627.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a875a02ad59e6cfed5d1ed8.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a875a00e6501a951823f5f3.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a8759ff22c06f5dae84d1d5.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a8759ff4219e7772eb0795f.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a8759fecdd4b797a3574bb3.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a8759fe22c06f5dae84cb63.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a8759fe4c7d004c0fa32376.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a873a230f27290fb067770e.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a873a228f3f0ab510ca4faf.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a873a21e6501a9518e56c48.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a873a21994ded095acc7a8f.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a873a21cdd4b797a31cfb85.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a873a1fe6501a9518e565c9.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a873a1f8f3f0ab510ca441b.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a873a1ce6501a9518e55796.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a873a1ccdd4b797a31cf334.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a873a1ccdd4b797a31cf33e.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a873a1a8f3f0ab510ca2c2b.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a873a1aad59e6cfed27ebd7.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a8c2535ad59e6cfede2d7c2.png',
  ];
  const ebooksProductImages = [
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a85b91c1447bf72d964f602.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a85b91c949d6f49c3238903.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a85b91c8bea83db8de4c06f.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a85b91c62d760a82d19a940.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a85b91cb3a1bcf4fa84f019.png',
  ];
  const ebooksDetails = {
    0: { title: 'The Process', desc: 'A faith-driven guide to personal transformation. Discover the spiritual principles that lead you from where you are to where God is taking you.', link: 'https://go.poweredxprayers.com/product-details/product/theprocess', type: 'ebook' },
    1: { title: 'Stop Wishing, Start Building Wealth', desc: 'Biblical wisdom and practical strategy to help you build, manage, and multiply Gods resources. Stop waiting and start building.', link: 'https://go.poweredxprayers.com/product-details/product/thewealthroom', type: 'ebook' },
    2: { title: 'Stop Wishing, Start Working (With Power!)', desc: 'A 40-day prayer strategy binder that turns your prayers into profitable action. Build, position, and prepare to exit with purpose.', link: 'https://go.poweredxprayers.com/product-details/product/6928982fcd500e536d818a98', type: 'both' },
    3: { title: 'The Story of David', desc: 'A brave and inspiring journey through the life of David. Learn about courage, faith, and trusting God through every season.', link: 'https://go.poweredxprayers.com/product-details/product/693aeeed6850553ebe2600b3', type: 'ebook' },
    4: { title: 'AI in Action', desc: 'Shaping tomorrows success with todays technology. A practical guide to leveraging AI for kingdom impact and personal growth.', link: 'https://go.poweredxprayers.com/product-details/product/6928980790b2c4352e2261e8', type: 'ebook' }
  };
  const trainingsProductImages = [
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/699cc567d0716b216f4ad50b.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/699cc39ad0716b76214a3d3e.png',
  ];
  const trainingsDetails = {
    0: { title: 'A Guide to Launching Your Childcare Center', desc: 'Launch your dream childcare center with confidence and clarity. This comprehensive guide walks you through every step from planning to opening.', link: 'https://go.poweredxprayers.com/product-details/product/aguidetolaunchingyourchildcarecenter' },
    1: { title: 'The Wealth Room Next Level Now!', desc: 'Build, scale, and position to exit. The Wealth Room is your roadmap to financial growth and kingdom wealth building.', link: 'https://go.poweredxprayers.com/product-details/product/thewealthroom' }
  };
  let shopModalOpener = null;
  let productModalOpener = null;
  let apparelSubcatOpener = null;

  const hoodieIndices = [0,1,2,3,4,5,6,7,8,9,26];
  const tshirtIndices = [15,16,17,18,19,20,21,22,23,24];
  const hoodieImages = hoodieIndices.map(i => apparelProductImages[i]);
  const tshirtImages = tshirtIndices.map(i => apparelProductImages[i]);

  const openApparelSubcategory = (subcat) => {
    if (!shopModalGrid) return;
    const isHoodies = subcat === 'Hoodies';
    const images = isHoodies ? hoodieImages : tshirtImages;
    const labels = isHoodies ? hoodieIndices : tshirtIndices;
    shopModalTitle.textContent = subcat;
    // Show back button
    const backBtn = shopModal.querySelector('.apparel-back-btn');
    if (backBtn) backBtn.style.display = '';
    shopModalGrid.innerHTML = '<div class="apparel-subcategory-grid">' +
      images.map((img, i) => {
        const idx = labels[i];
        const detail = apparelDetails[idx];
        const productName = detail ? detail.title : 'Product ' + String(idx + 1).padStart(2, '0');
        const productDesc = detail ? detail.desc : 'Details coming soon';
        return '<article class="shop-template-card" data-product-index="' + idx + '" data-product-image="' + img + '" onclick="openProductFromCard(this)">' +
          '<img src="' + img + '" alt="' + productName + '" loading="lazy">' +
          '<div><small>' + subcat + '</small><h3>' + productName + '</h3><span>View product details</span></div>' +
        '</article>';
      }).join('') + '</div>';
    shopModalGrid.querySelectorAll('.shop-template-card').forEach(card => {
      card.addEventListener('click', () => openProductFromCard(card));
    });
  };

  const openProductFromCard = (card) => {
    const idx = Number.parseInt(card.dataset.productIndex, 10);
    const img = card.dataset.productImage;
    const detail = apparelDetails[idx];
    const productName = detail ? detail.title : 'Product ' + String(idx + 1).padStart(2, '0');
    const productDesc = detail ? detail.desc : 'Details coming soon';
    if (productModal && productModalTitle) {
      productModalTitle.textContent = productName;
      const productKicker = productModal.querySelector('.product-detail-copy .kicker');
      if (productKicker) productKicker.textContent = 'Powered X Prayer Apparel';
      const productDescEl = productModal.querySelector('.product-description');
      if (productDescEl) productDescEl.textContent = productDesc;
      const productImage = productModal.querySelector('.product-detail-media img');
      if (productImage) { productImage.src = img; productImage.alt = productName; }
      productModalOpener = card;
      productModal.hidden = false;
      document.body.classList.add('series-modal-open');
      productModal.querySelector('.product-modal-panel')?.focus();
    }
  };


  const closeProductModal = () => {
    if (!productModal || productModal.hidden) return;
    productModal.hidden = true;
    productModalOpener?.focus();
    productModalOpener = null;
  };

  const defaultProductDesc = 'A faith-forward hoodie created as a wearable reminder that God restores what life tried to destroy. Final fabric, fit, and care details will be added before checkout activated.';

  const openProductModal = productCard => {
    if (!productModal || !productModalTitle) return;
    const productNumber = Number.parseInt(productCard.dataset.productIndex,10) + 1;
    const cardTitle = productCard.querySelector('h3')?.textContent || `Product ${String(productNumber).padStart(2,'0')}`;
    const detail = apparelDetails[productNumber - 1];
    productModalTitle.textContent = cardTitle;
    const productKicker = productModal.querySelector('.product-detail-copy .kicker');
    if (productKicker) productKicker.textContent = `Powered X Prayer Apparel · Product ${String(productNumber).padStart(2,'0')}`;
    const productDescEl = productModal.querySelector('.product-description');
    if (productDescEl) productDescEl.textContent = detail ? detail.desc : defaultProductDesc;
    const productImage = productModal.querySelector('.product-detail-media img');
    if (productImage) {
      productImage.src = productCard.dataset.productImage;
      productImage.alt = cardTitle;
    }
    productModalOpener = productCard;
    productModal.hidden = false;
    productModal.querySelector('.product-modal-panel')?.focus();
  };

  const closeShopModal = () => {
    if (!shopModal || shopModal.hidden) return;
    closeProductModal();
    shopModal.hidden = true;
    document.body.classList.remove('series-modal-open');
    shopModalOpener?.focus();
    shopModalOpener = null;
  };

    const apparelDetails = {
    0: { title: 'Pray Hoodie', desc: 'A faith-forward hoodie created as a wearable reminder that God restores what life tried to destroy. Final fabric, fit, and care details will be added before checkout is activated.' },
    1: { title: 'Build Hoodie', desc: 'A daily reminder to see yourself the way God sees you. Let His Word reflect truth over your identity, replacing every lie with the promise of who you are in Christ.' },
    2: { title: 'Restored by Jesus Hoodie', desc: 'Wear the word of God as a declaration of spiritual authority. Featuring "REIGN IN THE SPIRIT DAILY" with Romans 5:17, this hoodie is a daily reminder that through Christ we reign in life and walk in the power of the Holy Spirit.' },
    3: { title: 'The Word Is My Mirror Hoodie', desc: 'Carry the fire of the Spirit wherever you go. This flame-edition hoodie displays "REIGN IN THE SPIRIT DAILY" alongside Romans 5:17 with a bold flame graphic \u2014 a declaration of faith, passion, and the life-giving power of Christ.' },
    4: { title: 'Not My Power But His Power Hoodie', desc: 'Your identity begins with your Creator. This tree-root design pairs "ROOTED IN CHRIST" with the declaration "My Identity Begins With My Creator" \u2014 a reminder to stay grounded in faith and anchored in who God says you are.' },
    5: { title: 'Pray Hoodie — Black & White', desc: 'Purpose meets faith. The Driven Hoodie is a bold declaration that your steps are ordered by God and every move is fueled by faith, prayer, and divine purpose.' },
    6: { title: 'Reign in the Spirit Daily Hoodie', desc: 'Walk in spiritual authority every day. This hoodie displays \"REIGN IN THE SPIRIT DAILY\" with Romans 5:17 \u2014 a reminder that through Christ we reign in life.' },
    7: { title: 'Faith Sees Beyond the Visible Hoodie', desc: 'See with the eyes of faith. The Faith Sees Beyond the Visible Hoodie is a declaration that what God has spoken over your life is greater than what your eyes can see.' },
    8: { title: 'Cultivated Hoodie', desc: 'A reminder to take it to God first. The Let Me Pray About It Hoodie represents a lifestyle of prayer, faith, and seeking God before making your next move.' },
    9: { title: 'Rooted in Christ Hoodie', desc: 'Before the answer, the decision, or the response, pray about it. This Powered X Prayer crewneck is a simple reminder to seek God first and let prayer lead the way.' },
    10: { title: 'Let Me Pray About It Hoodie Black', desc: 'A bold black edition of the Let Me Pray About It Hoodie. A lifestyle of prayer, faith, and seeking God before making your next move.' },
    11: { title: 'Reign in the Spirit Daily Hoodie Cream', desc: 'Walk in spiritual authority with this cream-colored edition. Featuring REIGN IN THE SPIRIT DAILY with Romans 5:17.' },
    12: { title: 'Reign in the Spirit Daily Hoodie Grey', desc: 'A grey edition declaring REIGN IN THE SPIRIT DAILY with Romans 5:17. A daily reminder that through Christ we reign in life.' },
    13: { title: 'Restored by Jesus Hoodie Black', desc: 'A black edition hoodie created as a wearable reminder that God restores what life tried to destroy.' },
    14: { title: 'Let Me Pray About It T-Shirt', desc: 'A simple reminder to seek God first. This Powered X Prayer tee declares that prayer leads the way.' },
    15: { title: 'Restored by Jesus T-Shirt', desc: 'Purpose meets faith. The Driven T-Shirt declares that your steps are ordered by God and every move is fueled by faith, prayer, and divine purpose.' },
    16: { title: 'The Word Is My Mirror T-Shirt', desc: 'Choose faith over fear every single day. This tee is a reminder that God has not given us a spirit of fear but of power, love, and a sound mind.' },
    17: { title: 'Restored by Jesus T-Shirt — White', desc: 'Your identity in Christ is priceless. This tee declares that you are chosen, redeemed, and valued beyond measure by the King of Kings.' },
    18: { title: 'Prayer Room T-Shirt', desc: 'It is not by might nor by power, but by my Spirit, says the Lord. This tee is a declaration that everything you do flows from His strength.' },
    19: { title: 'Not My Power But His Power T-Shirt', desc: 'Build your life on the solid rock. This tee is a call to kingdom builders who trust God\u2019s plan and build with faith, wisdom, and purpose.' },
    20: { title: 'Build T-Shirt', desc: 'Prayer changes everything. This tee is a bold reminder to bring every situation to God and let faith lead the way.' },
    21: { title: 'Pray T-Shirt', desc: 'Stay grounded in faith. This tree-root design pairs \u2018ROOTED IN CHRIST\u2019 with the declaration that your identity begins with your Creator.' },
    22: { title: 'Rooted in Christ T-Shirt', desc: 'Walk in spiritual authority every day. Featuring \u2018REIGN IN THE SPIRIT DAILY\u2019 with Romans 5:17, this tee declares that through Christ we reign in life.' },
    23: { title: 'The Word Is My Mirror T-Shirt — Burgundy', desc: 'See with the eyes of faith. What God has spoken over your life is greater than what your eyes can see. This tee is a declaration of supernatural vision.' },
    24: { title: 'Faith Sees Beyond the Visible T-Shirt', desc: 'Carry the fire of spiritual authority. This black edition displays REIGN IN THE SPIRIT DAILY with Romans 5:17.' },
    25: { title: 'Faith Over Fear Black T-Shirt', desc: 'Choose faith over fear every day. This black edition is a reminder that God has not given us a spirit of fear' },
    26: { title: 'Prayer Room Hoodie', desc: 'A faith-forward hoodie created for those who meet with God in the secret place and carry a life of prayer everywhere they go.' },
  };

  const openShopModal = categoryCard => {
    if (!shopModal || !shopModalTitle || !shopModalGrid) return;
    const category = categoryCard.dataset.shopCategory;
    const count = Number.parseInt(categoryCard.dataset.shopCount,10) || 5;
    const isApparel = category === 'Apparel';
    const isEbooks = category === 'E-Books';
    const isTrainings = category === 'Trainings & Courses';
    const displayCategory = isEbooks ? 'E-Book / Physical Book' : category;
    shopModalTitle.textContent = displayCategory;
    const backBtn = shopModal.querySelector('.apparel-back-btn');
    if (backBtn) backBtn.style.display = 'none';
    if (isApparel) {
      shopModalGrid.innerHTML = '<div class="apparel-subcategory-grid">' +
        '<button class="apparel-subcategory-card" type="button" data-subcat="Hoodies">' +
          '<span class="apparel-subcategory-img"><img src="https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a82dd84a6a03cda067ac87d.png" alt="Hoodies"></span>' +
          '<div><h3>HOODIES</h3><span>' + hoodieImages.length + ' Products</span></div>' +
        '</button>' +
        '<button class="apparel-subcategory-card" type="button" data-subcat="T-Shirts">' +
          '<span class="apparel-subcategory-img"><img src="https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a873a23cdd4b797a31d0a61.png" alt="T-Shirts"></span>' +
          '<div><h3>T-SHIRTS</h3><span>' + tshirtImages.length + ' Products</span></div>' +
        '</button>' +
        '<div class="apparel-subcategory-card coming-soon">' +
          '<div class="coming-soon-icon"><svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="8" width="48" height="48" rx="8" stroke="#b48129" stroke-width="2"/><path d="M20 24h24v4H20zM20 32h24v4H20zM20 40h16v4H20z" fill="#b48129" opacity=".5"/></svg></div>' +
          '<div><h3>Coming Soon</h3></div>' +
        '</div>' +
        '<div class="apparel-subcategory-card coming-soon">' +
          '<div class="coming-soon-icon"><svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="24" stroke="#b48129" stroke-width="2"/><path d="M24 28c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#b48129" stroke-width="2"/><path d="M22 38h20" stroke="#b48129" stroke-width="2" opacity=".5"/></svg></div>' +
          '<div><h3>Coming Soon</h3></div>' +
        '</div>' +
      '</div>';
      shopModalGrid.querySelectorAll('.apparel-subcategory-card').forEach(card => {
        card.addEventListener('click', () => openApparelSubcategory(card.dataset.subcat));
      });
    } else {
      const thumbnail = categoryCard.querySelector('img')?.src;
      shopModalGrid.innerHTML = Array.from({length:count},(_,index) => {
        const productImage = isEbooks ? (ebooksProductImages[index] || ebooksProductImages[0]) : isTrainings ? (trainingsProductImages[index] || trainingsProductImages[0]) : thumbnail;
        const detail = isEbooks ? ebooksDetails[index] : isTrainings ? trainingsDetails[index] : null;
        const productLink = detail?.link || null;
        const productType = detail?.type || null;
        const cardLabel = isEbooks ? (productType === 'both' ? 'E-Book / Physical Book' : 'E-Book') : displayCategory;
        const productName = detail ? detail.title : `Product ${String(index + 1).padStart(2,'0')}`;
        return `<button class="shop-template-card" type="button" data-product-index="${index}" data-product-image="${productImage}"${productLink ? ` data-product-link="${productLink}"` : ''}><img src="${productImage}" alt="${productName}" loading="lazy"><div><small>${isEbooks ? cardLabel : displayCategory}</small><h3>${productName}</h3><span>${productLink ? 'Get Your Copy' : 'Details coming soon'}</span></div></button>`;
      }).join('');
      shopModalGrid.querySelectorAll('.shop-template-card').forEach(card => {
        const link = card.dataset.productLink;
        if (link) card.addEventListener('click', () => window.open(link, '_blank'));
      });
    }
    apparelSubcatOpener = isApparel ? categoryCard : apparelSubcatOpener;
    shopModalOpener = categoryCard;
    shopModal.hidden = false;
    document.body.classList.add('series-modal-open');
    shopModal.querySelector('.shop-modal-panel')?.focus();
  };

  document.querySelectorAll('.shop-category-trigger').forEach(card => {
    card.dataset.shopFallbackBound = 'true';
    card.addEventListener('click', event => {
      event.preventDefault();
      openShopModal(card);
    });
    card.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      openShopModal(card);
    });
  });

  document.querySelectorAll('[data-shop-modal-close]').forEach(control => control.addEventListener('click', closeShopModal));
  document.querySelectorAll('[data-product-modal-close]').forEach(control => control.addEventListener('click', closeProductModal));
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (productModal && !productModal.hidden) closeProductModal();
    else if (shopModal && !shopModal.hidden) closeShopModal();
  });

  const studyNotes = [
    ['August','August 11, 2026','REFLECT Week 2: REVEAL — Who Am I Really?','https://drive.google.com/file/d/1TJTP-IK-wGJQOzXS4IqQY9BlSdrWgM3Y/view?usp=sharing'],
    ['August','August 4, 2026','The Mirror, Seeing Yourself the Way God Sees You','https://drive.google.com/file/d/1YodpipZeqqhbV_l5WMWSmVbvOJJ0jk1F/view?usp=sharing'],
    ['July','July 28, 2026','Reign in the Spirit','https://drive.google.com/file/d/1FYj0DpvOhXgV7advKmaU78ND6MDeZP5g/view?usp=sharing'],
    ['July','July 21, 2026','The Serpent Is Under Your Feet','https://drive.google.com/file/d/1GKhamlN0dtFaSRSF2tdKXUskvTE0FSJp/view?usp=sharing'],
    ['July','July 14, 2026','Reign From the Source','https://drive.google.com/file/d/1HCPzmhWcaZ7gyz9808AoQkK4fgf05v5o/view?usp=sharing'],
    ['July','July 6, 2026','REIGN | Episode One: The Garden','https://drive.google.com/file/d/1ZwfYq0BI0KumfR6WrfNe0Dg3mrIxkQUl/view?usp=sharing'],
    ['June','June 30, 2026','Restoration Is Not a Return. It Is an Arrival Beyond the Point of Loss.','https://drive.google.com/file/d/1AJMpuNKH4BxO65d96GzEuZpbtYv4ymgF/view?usp=sharing'],
    ['June','June 23, 2026','A New Name — Restore Series','https://drive.google.com/file/d/1hdS4DZeWYUFHx_bOVYAZQrFC0cT8erTx/view?usp=sharing'],
    ['June','June 16, 2026','You Still Have a Seed | Day 2 of Restore','https://drive.google.com/file/d/1WE4GbXCxkfpFxXlmAYxyjxc6-EElXz7D/view?usp=drive_link'],
    ['June','June 9, 2026','Name What the Locust Ate','https://drive.google.com/file/d/1-V2vcY8TrdoinGM1pGhoS8S35_gv4jUL/view?usp=sharing'],
    ['May','May 26, 2026','The Wall Is Up, Now Fill the City','https://drive.google.com/file/d/1AU4r3qAmzNDas3B6ZSVmHToU1VKnQ7a8/view?usp=sharing'],
    ['May','May 19, 2026','They Will Talk When You Start Building','https://drive.google.com/file/d/1_FjV8gHA8wT3PuarWWfvSWhPb7NnxdPi/view?usp=sharing'],
    ['May','May 12, 2026','Did You Count the Cost?','https://drive.google.com/uc?export=download&id=1LCIsrskVxvef33XEBmbb6RQ1c6p_zHh7'],
    ['May','May 5, 2026','REBUILD | Purpose, Process & the Build God Assigned','https://drive.google.com/file/d/1AJMpuNKH4BxO65d96GzEuZpbtYv4ymgF/view?usp=sharing'],
    ['April','April 28, 2026',"Victory Lap: Closing Realignment With Joseph's Story",'#'],
    ['April','April 21, 2026',"IT'S TIME. I AM DOING A NEW THING",'#'],
    ['April','April 14, 2026','WHAT ARE YOU BUILDING ON?','#'],
    ['April','April 7, 2026','Preparing Your Life to Walk in the Supernatural','#'],
    ['March','March 31, 2026','He Thought He Had Me... But Heaven Was Already There','https://drive.google.com/uc?export=download&id=1J3fBz0AZKNjZXxWXgTSemdSEeQqZ5Odt'],
    ['March','March 25, 2026','The Activation Moment — Decree & Move','https://drive.google.com/uc?export=download&id=1WTW2OZtogO9SZR0M5U5tN0n9NibcoRx1'],
    ['March','March 17, 2026','Refocus: Live From the Throne','https://drive.google.com/uc?export=download&id=1-ECjYUQ8gubX4RRZQ_QH9ekypcSO1q1s'],
    ['March','March 10, 2026','Stop Looking In The Wrong Places.','https://drive.google.com/uc?export=download&id=101uPt9Z1diznGWtctxKxRjyBrVSK7hXp'],
    ['March','March 3, 2026','WHO IS YOUR SOURCE?','https://drive.google.com/uc?export=download&id=1pKFYjcXCWHf6bd7iU2dqwwHVluiJuzhy'],
    ['February','February 24, 2026','Guard Your Release with Shantal Long','https://drive.google.com/uc?export=download&id=1gK87AXffTQoEjW0TPSH_7O9hGktPhoH4'],
    ['February','February 17, 2026','Release the Old Identity with Shantal Long','https://drive.google.com/uc?export=download&id=1pe_Aclxwe8HvvZAz_I9jZZ4ir0wKi3vr'],
    ['February','February 10, 2026','Releasing Authority with Shantal Long','https://drive.google.com/uc?export=download&id=1GBv-a-P-rjiCHT0pmwAdJ5MzwHELHnl3'],
    ['February','February 3, 2026','BREATHE AGAIN','https://drive.google.com/uc?export=download&id=1I5AvwxAb0mNBzNNh4hiTCE29BLIAvkrb'],
    ['January','January 27, 2026','Friday Session: Strengthening Spiritual Resilience','https://drive.google.com/drive/folders/1s9LAyfQf4uSKVNu2kULm0DUGdhHjxtlN?usp=sharing'],
    ['January','January 20, 2026',"Thursday Session: Discovering God\u2019s Purpose Through Scripture",'https://drive.google.com/drive/folders/1s9LAyfQf4uSKVNu2kULm0DUGdhHjxtlN?usp=sharing'],
    ['January','January 13, 2026','Wednesday Session: Building a Consistent Prayer Life','https://drive.google.com/drive/folders/1s9LAyfQf4uSKVNu2kULm0DUGdhHjxtlN?usp=sharing'],
    ['January','January 6, 2026','Reset, Realign, Go Forth with Shantal Long','https://drive.google.com/uc?export=download&id=1LyHUPEO-xrRe6R-xDYBQ5IZMPZiYJdc4']
  ];
  const libraryModal = document.querySelector('#study-notes-library');
  const libraryGrid = libraryModal?.querySelector('.library-grid');
  const libraryFilters = libraryModal?.querySelector('.library-filters');
  const libraryTrigger = document.querySelector('.study-library-trigger');
  const flipbookStage = libraryModal?.querySelector('.flipbook-stage');
  const communityStudyNotesUrl = 'https://login.poweredxprayers.com/communities/groups/the-collective-prayer-room/home?invite=6a82d31338ca505fc7fade77';
  let activeLibraryMonth = 'January';
  let selectedStudyNote = null;

  const selectStudyNote = note => {
    selectedStudyNote = note;
    if (flipbookStage) flipbookStage.hidden = false;
    libraryModal.querySelector('#reader-title').textContent = note[2];
    libraryModal.querySelector('.flipbook-date').textContent = note[1];
    const openLink = libraryModal.querySelector('.flipbook-open');
    openLink.href = communityStudyNotesUrl;
    openLink.textContent = 'Open Study Notes';
    openLink.classList.remove('is-disabled');
    libraryGrid.querySelectorAll('.library-card').forEach(card => card.classList.toggle('active',Number(card.dataset.noteIndex) === studyNotes.indexOf(note)));
    window.dispatchEvent(new CustomEvent('pxp:study-note-selected',{detail:{month:note[0],date:note[1],title:note[2],source:note[3]}}));
  };

  const renderStudyNotes = () => {
    const filtered = studyNotes.filter(note => note[0] === activeLibraryMonth);
    libraryModal.querySelector('.library-result-count').textContent = `${filtered.length} resources`;
    const collectionTitle = libraryModal.querySelector('.library-collection-heading h3');
    if (collectionTitle) collectionTitle.textContent = `${activeLibraryMonth} Study Notes`;
    libraryGrid.innerHTML = filtered.map(note => {
      const index = studyNotes.indexOf(note);
      return `<a class="library-card" href="${communityStudyNotesUrl}" target="_blank" rel="noopener noreferrer" data-note-index="${index}"><span class="library-card-cover"><small>Powered X Prayer</small><strong>${note[0]}</strong><em>Study Notes</em></span><span class="library-card-body"><h4>${note[2]}</h4><small>${note[1]}</small><span>Open in community</span></span></a>`;
    }).join('');
    selectStudyNote(filtered[0] || studyNotes[0]);
  };

  if (libraryModal && libraryGrid && libraryFilters && libraryTrigger) {
    ['January','February','March','April','May','June','July','August'].forEach(month => {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = month; button.classList.toggle('active',month === activeLibraryMonth);
      button.addEventListener('click',() => { activeLibraryMonth = month; libraryFilters.querySelectorAll('button').forEach(item => item.classList.toggle('active',item === button)); renderStudyNotes(); });
      libraryFilters.append(button);
    });
    const resourcesHome = libraryModal.querySelector('.resources-home');
    const studyDashboard = libraryModal.querySelector('.library-dashboard');
    const showResourcesHome = () => { resourcesHome.hidden = false; studyDashboard.hidden = true; libraryModal.querySelector('#library-title').textContent = 'Resources Dashboard'; };
    const showStudyNotes = () => { resourcesHome.hidden = true; studyDashboard.hidden = false; libraryModal.querySelector('#library-title').textContent = 'Study Notes Library'; renderStudyNotes(); };
    const openLibrary = event => { event?.preventDefault(); showResourcesHome(); libraryModal.hidden = false; document.body.classList.add('series-modal-open'); libraryModal.querySelector('.library-shell').focus(); };
    const closeLibrary = () => { libraryModal.hidden = true; document.body.classList.remove('series-modal-open'); libraryTrigger.focus(); };
    openStudyNotePreview = note => {
      showStudyNotes();
      libraryModal.hidden = false;
      document.body.classList.add('series-modal-open');
      selectStudyNote(note);
      libraryModal.querySelector('.library-shell').focus();
    };
    libraryTrigger.addEventListener('click',openLibrary);
    libraryTrigger.addEventListener('keydown',event => { if (event.key === 'Enter' || event.key === ' ') openLibrary(event); });
    libraryModal.querySelectorAll('[data-library-close]').forEach(control => control.addEventListener('click',closeLibrary));
    libraryModal.querySelector('.resource-type-study')?.addEventListener('click',showStudyNotes);
    libraryModal.querySelector('.library-back')?.addEventListener('click',showResourcesHome);
    document.addEventListener('keydown',event => { if (event.key === 'Escape' && !libraryModal.hidden) closeLibrary(); });
  }

  document.querySelectorAll('.prayer-request-trigger').forEach(trigger => {
    trigger.addEventListener('click', event => {
      event.preventDefault();
      const formId = 'xNAkyNruR5LibqfWRvXy';
      const instanceId = `popup-${formId}-${Date.now()}`;
      document.querySelectorAll(`iframe[id^="popup-${formId}"]`).forEach(frame => frame.remove());
      document.getElementById('pxp-prayer-popup-script')?.remove();
      const iframe = document.createElement('iframe');
      iframe.src = `https://link.poweredxprayers.com/widget/form/${formId}`;
      iframe.style.cssText = 'display:none;width:100%;height:100%;border:none;border-radius:3px';
      iframe.id = instanceId;
      Object.assign(iframe.dataset,{layout:"{'id':'POPUP'}",triggerType:'alwaysShow',triggerValue:'',activationType:'alwaysActivated',activationValue:'',deactivationType:'neverDeactivate',deactivationValue:'',formName:'Prayer Request',height:'undefined',layoutIframeId:instanceId,formId,modalHeight:'500'});
      iframe.title = 'Prayer Request';
      document.body.appendChild(iframe);
      const script = document.createElement('script');
      script.id = 'pxp-prayer-popup-script';
      script.src = `https://link.poweredxprayers.com/js/form_embed.js?v=${Date.now()}`;
      script.async = true;
      document.body.appendChild(script);
    });
  });

  const seriesMarquee = document.querySelector('.series-marquee');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointerQuery = window.matchMedia('(pointer: fine)');
  let seriesFrame;
  let resumeTimer;
  let loopWidth = 0;
  let manualMaxScroll = 0;
  let autoSeriesEnabled = false;
  let previousFrameTime = 0;
  let dragStartX = 0;
  let dragStartScroll = 0;
  let isSeriesDragging = false;
  let didSeriesDrag = false;

  const runSeriesLoop = () => {
    // Auto-scroll disabled — manual scrolling only
  };

  const pauseSeriesLoopForInteraction = () => {
    autoSeriesEnabled = false;
    seriesMarquee?.classList.remove('is-auto-moving');
    if (seriesMarquee && loopWidth && seriesMarquee.scrollLeft > manualMaxScroll) {
      seriesMarquee.scrollLeft = Math.min(manualMaxScroll, Math.max(0, seriesMarquee.scrollLeft - loopWidth));
    }
    window.clearTimeout(resumeTimer);
    // Auto-scroll permanently disabled
  };

  ['pointerdown', 'touchstart', 'wheel'].forEach(eventName =>
    seriesMarquee?.addEventListener(eventName, pauseSeriesLoopForInteraction, { passive: true })
  );

  seriesMarquee?.addEventListener('pointerdown', event => {
    if (!finePointerQuery.matches || event.button !== 0) return;
    isSeriesDragging = true;
    didSeriesDrag = false;
    dragStartX = event.clientX;
    dragStartScroll = seriesMarquee.scrollLeft;
    seriesMarquee.classList.add('is-dragging');

  });

  seriesMarquee?.addEventListener('pointermove', event => {
    if (!isSeriesDragging) return;
    const distance = event.clientX - dragStartX;
    if (Math.abs(distance) > 4) didSeriesDrag = true;
    seriesMarquee.scrollLeft = dragStartScroll - distance;
    event.preventDefault();
  });

  const endSeriesDrag = event => {
    if (!isSeriesDragging) return;
    isSeriesDragging = false;
    seriesMarquee.classList.remove('is-dragging');

  };

  seriesMarquee?.addEventListener('pointerup', endSeriesDrag);
  seriesMarquee?.addEventListener('pointercancel', endSeriesDrag);

  seriesMarquee?.addEventListener('dragstart', event => event.preventDefault());
  seriesMarquee?.addEventListener('click', event => {
    if (!didSeriesDrag) return;
    event.preventDefault();
    event.stopPropagation();
    didSeriesDrag = false;
  }, true);

  if (seriesMarquee) {
    const track = seriesMarquee.querySelector('.series-track');
    track?.querySelectorAll('.series-set[aria-hidden="true"]').forEach(set => set.remove());
    if (track) {
      track.querySelectorAll('.series-set[aria-hidden="true"]').forEach(set => set.remove());
      seriesMarquee.scrollLeft = 0;
    }
  }


  /* ---- Scroll position hints for series marquee ---- */
  if (seriesMarquee) {
    const updateScrollHints = () => {
      const maxScroll = seriesMarquee.scrollWidth - seriesMarquee.clientWidth;
      seriesMarquee.classList.toggle('scroll-left', seriesMarquee.scrollLeft <= 5);
      seriesMarquee.classList.toggle('scroll-right', seriesMarquee.scrollLeft >= maxScroll - 5);
    };
    seriesMarquee.addEventListener('scroll', updateScrollHints, { passive: true });
    updateScrollHints();
  }

  /* ---- Hero video: fetch latest upload via YouTube Data API ---- */
  const heroIframe = document.querySelector('.hero-video-panel iframe');
  if (heroIframe) {
    const ytApiKey = 'AIzaSyAWqLX8uRQUhzGTruyCnE5l5-0pcsfd6VY';
    const uploadsPlaylistId = 'UU1qFfHXbdgzy188ILJFw68Q';
    fetch('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=' + uploadsPlaylistId + '&maxResults=5&key=' + ytApiKey)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.items || !data.items.length) return;
        for (var i = 0; i < data.items.length; i++) {
          var item = data.items[i];
          var title = item.snippet.title || '';
          if (title.toLowerCase().includes('#shorts')) continue;
          var videoId = item.snippet.resourceId ? item.snippet.resourceId.videoId : null;
          if (videoId) {
            heroIframe.src = 'https://www.youtube.com/embed/' + videoId;
            var dateEl = document.querySelector('.hero-video-panel span');
            if (dateEl && item.snippet.publishedAt) {
              var d = new Date(item.snippet.publishedAt);
              dateEl.textContent = 'Latest Upload \u2014 ' + d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            }
            return;
          }
        }
      })
      .catch(function () {});
  }

});
