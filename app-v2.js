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
      ['MlWYBkHROXc',"Thursday Session: Discovering God's Purpose Through Scripture",'January 20, 2026',"Explore biblical insight that helps you discern purpose and live aligned with God's calling."],
      ['frqOolLffs8','Friday Session: Strengthening Spiritual Resilience','January 27, 2026','Receive biblical encouragement to stand firm in faith through pressure and uncertainty.'] ]},
    february: { name:'February', series:'RELEASE', theme:'Let Go. Move Forward.', videos:[
      ['Hu5gbtZsbcg','BREATHE AGAIN','February 3, 2026','Reflect on the grace of God through prayer, biblical truth, and renewed devotion.'],
      ['jSADhcPqGpQ','Releasing Authority with Shantal Long','February 10, 2026',"Enter the week refreshed through worship, thankful prayer, and God's presence."],
      ['PlCeqAbGN9U','Release the Old Identity with Shantal Long','February 17, 2026','Release old labels and build a steady, gratitude-centered life of faith.'],
      ['mYiw0rO3qSo','Guard Your Release with Shantal Long','February 24, 2026','Discover how prayer, unity, and Christian community keep believers grounded in truth.'] ]},
    march: { name:'March', series:'REFOCUS', theme:'Realign Your Eyes on God.', videos:[
      ['aG4eU8LVzVU','WHO IS YOUR SOURCE?','March 3, 2026',"Strengthen your confidence in prayer by standing on God's promises."],
      ['MZAiZZcdrZ4','Stop Looking In The Wrong Places.','March 10, 2026',"Return to peace through God's Word and steady prayer."],
      ['QOqeESjDzmA','Refocus: Live From the Throne','March 17, 2026','Remain steady through uncertainty with biblical perspective and spiritual strength.'],
      ['t2BAf6_z_zk','The Activation Moment - Decree & Move','March 25, 2026',"Release burdens, celebrate God's goodness, and move forward in faith."],
      ['ZBJrPorLCyc','He Thought He Had Me... But Heaven Was Already There','March 31, 2026',"Settle anxious thoughts and restore quiet confidence in God's care."] ]},
    april: { name:'April', series:'REALIGN', theme:'Get Back in Divine Position.', videos:[
      ['I7DZerTI9hg','Preparing Your Life to Walk in the Supernatural','April 7, 2026',"Align your decisions, attitude, and focus with God's wisdom."],
      ['CGpM9zMOX50','WHAT ARE YOU BUILDING ON?','April 14, 2026','Build spiritual resilience by anchoring your heart in scripture.'],
      ['7zyTup1sU2U',"IT'S TIME. I AM DOING A NEW THING - STEP OUT OF THE WINEPRESS",'April 21, 2026','Grow deeper in faith through shared prayer, worship, and truth.'],
      ['aDlh_6UYVWY',"Victory Lap: Closing The Realignment Series With Joseph's Story",'April 28, 2026',"Reflect on God's mercy and grace with humility, gratitude, and trust."] ]},
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
      ['fDxOYQK8YJg','The Mirror, Seeing Yourself the Way God Sees You','August 4, 2026',"Look into the mirror of God's Word and allow the Holy Spirit to transform your heart."],
      ['cs00kGDEXew','REFLECT Week 2: REVEAL — Who Am I Really?','August 11, 2026',"Replace earthly labels with Heaven's language and receive your identity in Christ."] ]}
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
        return `<article class="series-live-card"><iframe src="https://www.youtube.com/embed/${id}" title="${title.replace(/"/g,'&quot;')}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe><div><span class="series-week-folder">${month.name} Study Notes</span><h3>${title}</h3><p class="series-live-date">${date}</p><p>${description}</p><div class="series-card-actions"><a href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener">Watch Teaching</a>${noteAction}</div></div></article>`;
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
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a82dd84a6a03cda067ac87d.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a8389c1a6a03cda06aead34.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a84532afcf70e5609352a0d.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a84532296d2b224d32e0555.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a845322d07034adc2b19e8e.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a844d3dd07034adc2aac1e2.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a844d3dd1abe28fc92d6d8f.png',
    'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a844d3d7998683b3c7443b8.png',
  ];
  let shopModalOpener = null;
  let productModalOpener = null;

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
    2: { title: 'Reign in the Spirit Daily Hoodie', desc: 'Wear the word of God as a declaration of spiritual authority. Featuring "REIGN IN THE SPIRIT DAILY" with Romans 5:17, this hoodie is a daily reminder that through Christ we reign in life and walk in the power of the Holy Spirit.' },
    3: { title: 'Reign in the Spirit Daily Flame Hoodie', desc: 'Carry the fire of the Spirit wherever you go. This flame-edition hoodie displays "REIGN IN THE SPIRIT DAILY" alongside Romans 5:17 with a bold flame graphic \u2014 a declaration of faith, passion, and the life-giving power of Christ.' },
    4: { title: 'Rooted in Christ Hoodie', desc: 'Your identity begins with your Creator. This tree-root design pairs "ROOTED IN CHRIST" with the declaration "My Identity Begins With My Creator" \u2014 a reminder to stay grounded in faith and anchored in who God says you are.' }
  };

  const openShopModal = categoryCard => {
    if (!shopModal || !shopModalTitle || !shopModalGrid) return;
    const category = categoryCard.dataset.shopCategory;
    const count = Number.parseInt(categoryCard.dataset.shopCount,10) || 5;
    const isApparel = category === 'Apparel';
    const thumbnail = isApparel ? 'https://assets.cdn.filesafe.space/CS4NGSgWYVqwkUR4I0Zh/media/6a82dd84a6a03cda067ac87d.png' : categoryCard.querySelector('img')?.src;
    shopModalTitle.textContent = category;
    shopModalGrid.innerHTML = Array.from({length:count},(_,index) => {
      const productImage = isApparel ? (apparelProductImages[index] || apparelProductImages[0]) : thumbnail;
      const detail = isApparel && apparelDetails[index];
      const productName = detail ? detail.title : `Product ${String(index + 1).padStart(2,'0')}`;
      return `<button class="shop-template-card${isApparel ? ' is-apparel' : ''}" type="button" data-product-index="${index}" data-product-image="${productImage}"><img src="${productImage}" alt="${productName}" loading="lazy"><div><small>${category}</small><h3>${productName}</h3><span>${isApparel ? 'View product details' : 'Details coming soon'}</span></div></button>`;
    }).join('');
    if (isApparel) shopModalGrid.querySelectorAll('.shop-template-card').forEach(card => card.addEventListener('click',() => openProductModal(card)));
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
    ['January','January 20, 2026',"Thursday Session: Discovering God's Purpose Through Scripture",'https://drive.google.com/drive/folders/1s9LAyfQf4uSKVNu2kULm0DUGdhHjxtlN?usp=sharing'],
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
  let autoSeriesEnabled = true;
  let previousFrameTime = 0;
  let dragStartX = 0;
  let dragStartScroll = 0;
  let isSeriesDragging = false;
  let didSeriesDrag = false;

  const runSeriesLoop = time => {
    if (autoSeriesEnabled && !reducedMotionQuery.matches && previousFrameTime) {
      seriesMarquee.classList.add('is-auto-moving');
      seriesMarquee.scrollLeft += Math.min(1.15, (time - previousFrameTime) * .04);
      if (loopWidth && seriesMarquee.scrollLeft >= loopWidth) seriesMarquee.scrollLeft -= loopWidth;
    }
    previousFrameTime = time;
    seriesFrame = window.requestAnimationFrame(runSeriesLoop);
  };

  const pauseSeriesLoopForInteraction = () => {
    autoSeriesEnabled = false;
    seriesMarquee?.classList.remove('is-auto-moving');
    if (seriesMarquee && loopWidth && seriesMarquee.scrollLeft > manualMaxScroll) {
      seriesMarquee.scrollLeft = Math.min(manualMaxScroll, Math.max(0, seriesMarquee.scrollLeft - loopWidth));
    }
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(() => { autoSeriesEnabled = true; }, 3000);
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
    seriesMarquee.setPointerCapture(event.pointerId);
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
    if (seriesMarquee.hasPointerCapture(event.pointerId)) {
      seriesMarquee.releasePointerCapture(event.pointerId);
    }
  };

  seriesMarquee?.addEventListener('pointerup', endSeriesDrag);
  seriesMarquee?.addEventListener('pointercancel', endSeriesDrag);
  seriesMarquee?.addEventListener('scroll', () => {
    if (!autoSeriesEnabled && seriesMarquee.scrollLeft > manualMaxScroll) seriesMarquee.scrollLeft = manualMaxScroll;
  }, { passive: true });
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
      const primarySet = track.querySelector('.series-set');
      const loopClone = primarySet?.cloneNode(true);
      if (primarySet && loopClone) {
        loopClone.classList.add('is-loop-clone');
        loopClone.setAttribute('aria-hidden','true');
        loopClone.querySelectorAll('a').forEach(link => {
          link.setAttribute('tabindex','-1');
          link.addEventListener('click', event => {
            event.preventDefault();
            primarySet.querySelector(`[data-series-month="${link.dataset.seriesMonth}"]`)?.click();
          });
        });
        track.append(loopClone);
        const measureSeries = () => {
          loopWidth = primarySet.getBoundingClientRect().width + 14;
          manualMaxScroll = Math.max(0, loopWidth - 14 - seriesMarquee.clientWidth);
        };
        measureSeries();
        window.addEventListener('resize', measureSeries);
      }
      seriesMarquee.scrollLeft = 0;
      seriesFrame = window.requestAnimationFrame(runSeriesLoop);
    }
  }
});
