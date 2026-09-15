(() => {
  // The allowed access codes are deliberately stored as slow, salted derived values
  // rather than readable text. This avoids exposing them in the deployed source.
  const accessCodeSalt = 'pxp-study-notes-v1-5f9c2e8d';
  const accessCodeHashes = new Set([
    '0ec6b7b6445db7a08da8a904b565fb2bde876a8c66ad8dd206b4326a07639ecf',
    'c89f2dce50e7d908078f24870f1a937ad4f37050bf789e2938442ebd1f1c4606',
    '08ce642850b66cbeed8002586fae958162129b620bfa16577fd91a1d769b57e4',
    '06d666b70f0ae6ef9e113f822206daf205b8576bdb0688dd3050b08aa75ea13c',
    '1c2bc7b47fe2f19f107accb6ed1499a27fc91478bb5f6958330ff6498d009149',
    '6ac8d42467e74598b3b0f9a12bc52a69a9ecb254bb64e9a49bd4d074d3e81488',
    '180364ad41315f27ff719e6c1e6a9dfc06f9fe4ae24f5c83921bd9bbb260ba3b',
    'be76e8977d4538b7216829c40b7bc03231912de00258a88374565771e97267ef',
    '98230082f839009847accf1951207a6e013893dafce8b438b7ce1704dff88db7',
    'cb5bc7ecb5b167b47215e3619b799d8a1df3838256b90fa4a2e788925d1673fe',
    '798f635fbe70288d809c752d490970440b911a15f7cd762ed827e7305c8bfee2',
    'f92a6832341ec1a1624d75896e20fa081f9d5f476c9a1050f63f28fba3bb8f3c',
    '0a49b88b9478b2cdad1e6aeeec3d78c4795ff10594f3656e9b7fd4632a2f67b9'
  ]);
  const encodeHex = bytes => [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  const deriveAccessCode = async code => {
    const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(code), 'PBKDF2', false, ['deriveBits']);
    return encodeHex(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(accessCodeSalt), iterations: 250000, hash: 'SHA-256' }, keyMaterial, 256));
  };
  const gate = document.querySelector('#access-gate');
  const unlock = () => { document.body.classList.remove('access-locked'); gate.hidden = true; gate.style.display = 'none'; };
  document.body.classList.add('access-locked');
  document.querySelector('#access-gate-form').addEventListener('submit', async event => {
    event.preventDefault();
    const code = document.querySelector('#access-code').value.trim().toUpperCase().replace(/\s/g, '');
    const error = document.querySelector('#access-gate-error');
    try {
      if (accessCodeHashes.has(await deriveAccessCode(code))) {
        unlock();
      } else {
        error.hidden = false;
      }
    } catch {
      error.textContent = 'Unable to verify the access code. Please refresh and try again.';
      error.hidden = false;
    }
  });
  const bookIcon = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v16H6.5A2.5 2.5 0 0 0 4 21Z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v16h5.5A2.5 2.5 0 0 1 20 21Z"/></svg>';
  const lockIcon = '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';
  const months = [
    ['January','Reset',['-O99Y4kILG8','1oi5xAgYyu4','MlWYBkHROXc','frqOolLffs8'],['January 6|Heaven on Earth: Reset, Realign, and Go Forth','January 13|RESET: Foundation & Alignment','January 20|Why Heaven Cares About Alignment','January 27|RESET: Walking in New Identity']],
    ['February','Release',['Hu5gbtZsbcg','jSADhcPqGpQ','PlCeqAbGN9U','mYiw0rO3qSo'],['February 3|BREATHE AGAIN','February 10|Releasing Authority with Shantal Long','February 17|Release the Old Identity','February 24|Guard Your Release with Shantal Long']],
    ['March','Refocus',['aG4eU8LVzVU','MZAiZZcdrZ4','QOqeESjDzmA','t2BAf6_z_zk','ZBJrPorLCyc'],['March 3|WHO IS YOUR SOURCE?','March 10|Stop Looking In The Wrong Places.','March 17|Refocus: Live From the Throne','March 25|The Activation Moment — Decree & Move','March 31|He Thought He Had Me... But Heaven Was Already There']],
    ['April','Realign',['I7DZerTI9hg','CGpM9zMOX50','7zyTup1sU2U','aDlh_6UYVWY'],['April 7|Preparing Your Life to Walk in the Supernatural','April 14|WHAT ARE YOU BUILDING ON?','April 21|IT’S TIME. I AM DOING A NEW THING','April 28|Victory Lap: Closing Realignment With Joseph’s Story']],
    ['May','Rebuild',['Jva-mSBFc9k','Zv4tzmP2OfI','Vz-MnpmWfl8','VZygVRaDCUI'],['May 5|REBUILD | Purpose, Process & the Build God Assigned','May 12|Did You Count the Cost?','May 19|They Will Talk When You Start Building','May 26|The Wall Is Up, Now Fill the City']],
    ['June','Restore',['QogDKTsxzUk','blfU1dO9p94','9lBcgWMiE7g','v-QutT_sr9k'],['June 9|Name What the Locust Ate','June 16|You Still Have a Seed','June 23|A New Name — Restore Series','June 30|Restoration Is Not a Return']],
    ['July','Reign',['O6oe-i_SrSo','JLywR5fLXGI','6z2EkeMtUyg','Vy6zqh8eZIc'],['July 6|REIGN | Episode One: The Garden','July 14|Reign From the Source','July 21|The Serpent Is Under Your Feet','July 28|Reign in the Spirit']],
    ['August','Reflect',['fDxOYQK8YJg','cs00kGDEXew','ZukSJ5lNPkQ','8-37F-5YOIQ'],['August 4|The Mirror, Seeing Yourself the Way God Sees You','August 11|REFLECT Week 2: REVEAL — Who Am I Really?','August 18|Every Stage Is Preparing You','August 25|From Reflection to Representation']],
    ['September','Recognized',['vS9xvaB029s','ScQ8JHiAB-w','IXsXKhZGepE'],['September 1|Recognize the Battle: What Is Really Operating?','September 8|What you keep reacting to may only be the fruit. God wants to show you the root.','September 15|RECOGNIZE Week 3: Renounce & Resist | Break the Agreement, Take Your Stand']],['October','Coming Soon',[],[]],['November','Coming Soon',[],[]],['December','Coming Soon',[],[]]
  ];
  const grid = document.querySelector('#month-grid'); const dialog = document.querySelector('#month-dialog'); const close = dialog.querySelector('.dialog-close'); const noteDialog = document.querySelector('#note-dialog');
  const sources = {'January 6':'https://drive.google.com/uc?export=download&id=1LyHUPEO-xrRe6R-xDYBQ5IZMPZiYJdc4','February 3':'https://drive.google.com/uc?export=download&id=1I5AvwxAb0mNBzNNh4hiTCE29BLIAvkrb','March 3':'https://drive.google.com/uc?export=download&id=1pKFYjcXCWHf6bd7iU2dqwwHVluiJuzhy','May 5':'https://drive.google.com/file/d/1AJMpuNKH4BxO65d96GzEuZpbtYv4ymgF/view?usp=sharing','June 9':'https://drive.google.com/file/d/1-V2vcY8TrdoinGM1pGhoS8S35_gv4jUL/view?usp=sharing','July 6':'https://drive.google.com/file/d/1ZwfYq0BI0KumfR6WrfNe0Dg3mrIxkQUl/view?usp=sharing','August 4':'https://drive.google.com/file/d/1YodpipZeqqhbV_l5WMWSmVbvOJJ0jk1F/view?usp=sharing','August 11':'https://drive.google.com/file/d/1TJTP-IK-wGJQOzXS4IqQY9BlSdrWgM3Y/view?usp=sharing'};
  const videoSources = {'-O99Y4kILG8':sources['January 6'],'1oi5xAgYyu4':'https://drive.google.com/file/d/1lAzRUtpEwzuzxansQvQ9jzd30T5f77WO/view?usp=drive_link',MlWYBkHROXc:'https://drive.google.com/file/d/1zPRkUQ0n7cMzWsPFbulv_HBXnrCEOw0j/view?usp=drive_link',frqOolLffs8:'https://drive.google.com/file/d/1jbeVO3QWQnGbQYloVurRSL0gTU-pLndp/view?usp=sharing',Hu5gbtZsbcg:sources['February 3'],jSADhcPqGpQ:'https://drive.google.com/uc?export=download&id=1GBv-a-P-rjiCHT0pmwAdJ5MzwHELHnl3',PlCeqAbGN9U:'https://drive.google.com/uc?export=download&id=1pe_Aclxwe8HvvZAz_I9jZZ4ir0wKi3vr',mYiw0rO3qSo:'https://drive.google.com/uc?export=download&id=1gK87AXffTQoEjW0TPSH_7O9hGktPhoH4',aG4eU8LVzVU:sources['March 3'],MZAiZZcdrZ4:'https://drive.google.com/uc?export=download&id=101uPt9Z1diznGWtctxKxRjyBrVSK7hXp',QOqeESjDzmA:'https://drive.google.com/uc?export=download&id=1-ECjYUQ8gubX4RRZQ_QH9ekypcSO1q1s',t2BAf6_z_zk:'https://drive.google.com/uc?export=download&id=1WTW2OZtogO9SZR0M5U5tN0n9NibcoRx1',ZBJrPorLCyc:'https://drive.google.com/uc?export=download&id=1J3fBz0AZKNjZXxWXgTSemdSEeQqZ5Odt',I7DZerTI9hg:'https://drive.google.com/file/d/1jXTc2pWNGPJ3Pi7CCrPJ3kG0JAzkd0GM/view?usp=sharing',CGpM9zMOX50:'https://drive.google.com/drive/folders/1Jwt70wfCazmUoWpXVsFlXw8KS1hIcWoz?usp=drive_link','7zyTup1sU2U':'https://drive.google.com/file/d/1GIsqYW5Bl1JKub1xs_PPNlSWSufFCX8R/view?usp=drive_link',aDlh_6UYVWY:'https://drive.google.com/file/d/1engIMXYPZm5dUpwcYNSNNHnHaw_Km9G5/view?usp=sharing','Jva-mSBFc9k':'https://drive.google.com/uc?export=download&id=1q4WbAewxnPmCbDpr7897iqqE1Vxwteca',Zv4tzmP2OfI:'https://drive.google.com/uc?export=download&id=1LCIsrskVxvef33XEBmbb6RQ1c6p_zHh7','Vz-MnpmWfl8':'https://drive.google.com/file/d/1_FjV8gHA8wT3PuarWWfvSWhPb7NnxdPi/view?usp=sharing',VZygVRaDCUI:'https://drive.google.com/file/d/1AU4r3qAmzNDas3B6ZSVmHToU1VKnQ7a8/view?usp=sharing',QogDKTsxzUk:sources['June 9'],blfU1dO9p94:'https://drive.google.com/file/d/1WE4GbXCxkfpFxXlmAYxyjxc6-EElXz7D/view?usp=drive_link','9lBcgWMiE7g':'https://drive.google.com/file/d/1AJMpuNKH4BxO65d96GzEuZpbtYv4ymgF/view?usp=sharing','v-QutT_sr9k':'https://drive.google.com/file/d/1AJMpuNKH4BxO65d96GzEuZpbtYv4ymgF/view?usp=sharing','O6oe-i_SrSo':sources['July 6'],'JLywR5fLXGI':'https://drive.google.com/file/d/1HCPzmhWcaZ7gyz9808AoQkK4fgf05v5o/view?usp=drive_link','6z2EkeMtUyg':'https://drive.google.com/file/d/1GKhamlN0dtFaSRSF2tdKXUskvTE0FSJp/view?usp=sharing',Vy6zqh8eZIc:'https://drive.google.com/file/d/1FYj0DpvOhXgV7advKmaU78ND6MDeZP5g/view?usp=sharing',fDxOYQK8YJg:sources['August 4'],cs00kGDEXew:sources['August 11'],'8-37F-5YOIQ':'https://drive.google.com/file/d/1QzixRn8BwkpfJK7DxejM9VUPMGowthPM/view?usp=sharing',vS9xvaB029s:'https://drive.google.com/file/d/1YhmBVuJxxzzzqoFwPaxZw2KbHBfGnPO5/view?usp=sharing'};
  grid.innerHTML = months.map((month,index) => { const available = month[2].length > 0; return `<button class="month-card${available ? '' : ' is-coming'}" type="button" data-month="${index}" ${available ? '' : 'disabled'}><span class="month-card-top"><span class="month-name">${month[0]}</span><span class="month-icon">${available ? bookIcon : lockIcon}</span></span><span class="month-series">${month[1]}</span><span class="month-count">${available ? `${month[3].length} study notes` : 'Coming Soon'}</span></button>`; }).join('');
  const openMonth = index => { const [name,series,videos,notes] = months[index],folder='https://drive.google.com/drive/folders/1s9LAyfQf4uSKVNu2kULm0DUGdhHjxtlN?usp=sharing'; dialog.querySelector('#dialog-month-title').textContent = name; dialog.querySelector('#dialog-count').textContent = `· ${notes.length} entries`; dialog.querySelector('#dialog-series').textContent = `${series.toUpperCase()} — select a study note to open its full preview.`; dialog.querySelector('#session-grid').innerHTML = videos.map((id,i) => `<article class="session-card"><iframe src="https://www.youtube.com/embed/${id}" title="${name} session ${i + 1}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe><span>${notes[i]?.split('|')[0] || `${name} session`}</span></article>`).join(''); dialog.querySelector('#note-grid').innerHTML = notes.map((note,i) => { const [date,title] = note.split('|'),url=videoSources[videos[i]]||sources[date]||folder; return `<button class="note-card" type="button" data-date="${date}" data-title="${title}" data-url="${url}"><small>${date}</small><strong>${title}</strong></button>`; }).join(''); dialog.showModal(); close.focus(); };
  grid.addEventListener('click', event => { const card = event.target.closest('[data-month]'); if (card && !card.disabled) openMonth(Number(card.dataset.month)); });
  document.querySelector('#note-grid').addEventListener('click', event => { const card = event.target.closest('[data-url]'); if (!card) return; const url=card.dataset.url,id=new URL(url).searchParams.get('id')||url.match(/\/file\/d\/([^/]+)/)?.[1]||url.match(/\/folders\/([^/]+)/)?.[1],preview=url.includes('/folders/')?`https://drive.google.com/embeddedfolderview?id=${id}#list`:`https://drive.google.com/file/d/${id}/preview`; document.querySelector('#note-dialog-date').textContent=`← Back · ${card.dataset.date}`; document.querySelector('#note-dialog-title').textContent=card.dataset.title; document.querySelector('#note-preview').src=preview; document.querySelector('#note-download').href=url; noteDialog.showModal(); });
  close.addEventListener('click', () => dialog.close()); dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  noteDialog.querySelector('.dialog-close').addEventListener('click', () => { document.querySelector('#note-preview').src='about:blank'; noteDialog.close(); });
})();
