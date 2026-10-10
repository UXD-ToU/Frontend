document.addEventListener('DOMContentLoaded', () => {

  const $ = (s) => document.querySelector(s);

  const DB = 'present-detail-products-v1';

  const STORE = 'products';

  const id = new URLSearchParams(location.search).get('id') || 'demo-1';

  const friends = ['유진', '은수', '지민'];

  const demo = { id: 'demo-1', name: '상품 이름', brand: '', price: '', friends: ['유진'], memo: '', date: '2026.10.10', images: [] };

  let product = null;

  let working = null;

  let editing = false;

  let urls = [];

  let toastTimer;

  let friendSlots = [];

  let nextFriendKey = 1;

  let activeFriendKey = null;

  function openDB() {

    return new Promise((resolve, reject) => {

      const req = indexedDB.open(DB, 1);

      req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });

      req.onsuccess = () => resolve(req.result);

      req.onerror = () => reject(req.error);

    });

  }

  async function dbAction(mode, operation) {

    const db = await openDB();

    try { return await new Promise((resolve, reject) => {

      const tx = db.transaction(STORE, mode);

      const req = operation(tx.objectStore(STORE));

      let result;

      if (req) { req.onsuccess = () => { result = req.result; }; }

      tx.oncomplete = () => resolve(result);

      tx.onerror = () => reject(tx.error);

      tx.onabort = () => reject(tx.error);

    }); } finally { db.close(); }

  }

  const load = () => dbAction('readonly', s => s.get(id));

  const save = data => dbAction('readwrite', s => s.put(data));

  const remove = () => dbAction('readwrite', s => s.delete(id));

  const goList = () => { location.href = './home.html'; };

  const goBack = () => { if (history.length > 1) history.back(); else goList(); };

  function toast(message) {

    const el = $('#toast'); clearTimeout(toastTimer); el.textContent = message;

    el.classList.add('show'); toastTimer = setTimeout(() => el.classList.remove('show'), 2100);

  }

  function releaseURLs() { urls.forEach(URL.revokeObjectURL); urls = []; }

  function imageURL(file) { if (typeof file === 'string') return file; const url = URL.createObjectURL(file); urls.push(url); return url; }

  function renderGallery(data) {

    releaseURLs(); const gallery = $('#photoGallery'); gallery.replaceChildren();

    if (!data.images?.length) { const placeholder = document.createElement('div'); placeholder.className = 'photo-placeholder'; gallery.append(placeholder); return; }

    data.images.forEach(file => { const img = document.createElement('img'); img.alt = '상품 이미지'; img.src = imageURL(file); gallery.append(img); });

  }

  function render() {

    $('#displayName').textContent = product.name || '상품 이름';

    $('#savedDate').textContent = product.date || '';

    $('#displayBrand').textContent = product.brand || '-';

    $('#displayPrice').textContent = product.price ? `${Number(String(product.price).replace(/\D/g, '')).toLocaleString('ko-KR')}` : '-';

    const list = $('#displayFriends'); list.replaceChildren();

    (product.friends || []).forEach(name => { const chip = document.createElement('span'); chip.className = 'friend-chip'; chip.textContent = name; list.append(chip); });

    $('#memoBox').hidden = !product.memo?.trim(); $('#memoBox').textContent = product.memo || '';

    renderGallery(product);

  }

  function showEdit(flag) {

    editing = flag;

    ['displayName', 'displayFriends', 'displayBrand', 'displayPrice', 'memoBox'].forEach(id => { if (id === 'memoBox') { if (flag) $('#' + id).hidden = true; else $('#' + id).hidden = !product.memo?.trim(); } else $('#' + id).hidden = flag; });

    ['inputName', 'editFriends', 'inputBrand', 'inputPrice', 'memoEditWrap', 'editActions', 'editPhotos'].forEach(id => $('#' + id).hidden = !flag);

    $('#menuButton').disabled = flag;

    $('#galleryAddButton').hidden = !flag;

    if (!flag) closeFriendDropdown();

    $('.recommendations').hidden = flag;

  }

  function closeFriendDropdown() {

    $('#friendDropdown').hidden = true;

    activeFriendKey = null;

    $('#addFriendButton').setAttribute('aria-expanded', 'false');

    $('#friendChips').querySelectorAll('.friend-toggle').forEach(btn => btn.setAttribute('aria-expanded', 'false'));

  }

  function renderFriendEditor() {

    const chips = $('#friendChips'); chips.replaceChildren();

    friendSlots.forEach(slot => {

      const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'friend-toggle';

      btn.setAttribute('aria-label', slot.name ? `${slot.name} 선택 변경` : '친구 선택');

      btn.setAttribute('aria-expanded', String(!$('#friendDropdown').hidden && activeFriendKey === slot.key));

      const name = document.createElement('span'); name.className = 'friend-summary'; name.textContent = slot.name || '';

      const caret = document.createElement('span'); caret.className = 'friend-caret'; caret.setAttribute('aria-hidden', 'true');

      btn.append(name, caret); btn.addEventListener('click', () => toggleFriendDropdown(slot.key, btn)); chips.append(btn);

    });

    working.friends = friendSlots.map(slot => slot.name).filter(Boolean);

  }

  function toggleFriendDropdown(key, trigger) {

    const dropdown = $('#friendDropdown');

    if (!dropdown.hidden && activeFriendKey === key) { closeFriendDropdown(); return; }

    activeFriendKey = key; dropdown.replaceChildren();

    const slot = friendSlots.find(item => item.key === key);

    const taken = new Set(friendSlots.map(item => item.name).filter(Boolean));

    [...new Set([...friends, ...(product.friends || [])])].forEach(name => {

      if (taken.has(name) && slot?.name !== name) return;

      const option = document.createElement('button'); option.type = 'button'; option.className = 'friend-option';

      option.textContent = name; option.setAttribute('aria-pressed', String(slot?.name === name));

      option.addEventListener('click', () => {

        if (key === 'add') friendSlots.push({ key: nextFriendKey++, name });

        else if (slot) {

          if (slot.name === name) {

            if (slot.key === 0) slot.name = null;

            else friendSlots.splice(friendSlots.indexOf(slot), 1);

          } else slot.name = name;

        }

        closeFriendDropdown(); renderFriendEditor();

      }); dropdown.append(option);

    });

    if (!dropdown.childElementCount) {

      const empty = document.createElement('span'); empty.className = 'friend-empty-message'; empty.textContent = '추가할 친구가 없습니다'; dropdown.append(empty);

    }

    const rect = $('#editFriends').getBoundingClientRect(), tr = trigger.getBoundingClientRect();

    dropdown.style.left = `${Math.max(0, Math.min(tr.left - rect.left, rect.width - 132))}px`;

    dropdown.hidden = false; $('#addFriendButton').setAttribute('aria-expanded', String(key === 'add'));

    $('#friendChips').querySelectorAll('.friend-toggle').forEach((btn, i) => btn.setAttribute('aria-expanded', String(friendSlots[i].key === key)));

  }

  $('#addFriendButton').addEventListener('click', () => toggleFriendDropdown('add', $('#addFriendButton')));

  document.addEventListener('pointerdown', event => {

    if (!$('#editFriends').contains(event.target)) closeFriendDropdown();

  });

  function renderPhotoEditor() {

    const el = $('#photoEditor'); el.replaceChildren();

    working.images.forEach((file, i) => {

      const box = document.createElement('div'); box.className = 'photo-edit-item';

      const img = document.createElement('img'); img.src = imageURL(file); img.alt = '선택한 사진';

      const del = document.createElement('button'); del.textContent = '×'; del.type = 'button'; del.setAttribute('aria-label', '사진 삭제');

      del.addEventListener('click', () => { working.images.splice(i, 1); renderPhotoEditor(); });

      box.append(img, del); el.append(box);

    });

  }

  function startEdit() {

    closeMenu(); working = { ...product, friends: [...(product.friends || [])], images: [...(product.images || [])] };

    $('#inputName').value = working.name || ''; $('#inputBrand').value = working.brand || '';

    $('#inputPrice').value = working.price || ''; $('#inputMemo').value = working.memo || '';

    $('#memoCount').textContent = `${$('#inputMemo').value.length}/100`;

    friendSlots = [{ key: 0, name: working.friends[0] || null }, ...working.friends.slice(1).map(name => ({ key: nextFriendKey++, name }))];

    showEdit(true); renderFriendEditor(); renderPhotoEditor();

  }

  function closeMenu() { $('#actionMenu').hidden = true; $('#menuButton').setAttribute('aria-expanded', 'false'); }

  $('#backButton').addEventListener('click', goBack);

  $('#homeButton').addEventListener('click', () => { location.href = './home.html'; });

  $('#menuButton').addEventListener('click', () => { const menu = $('#actionMenu'); menu.hidden = !menu.hidden; $('#menuButton').setAttribute('aria-expanded', String(!menu.hidden)); });

  document.addEventListener('click', e => { if (!e.target.closest('.header-right')) closeMenu(); });

  $('#editButton').addEventListener('click', startEdit);

  $('#cancelEditButton').addEventListener('click', () => { working = null; showEdit(false); render(); });

  $('#inputMemo').addEventListener('input', () => { $('#memoCount').textContent = `${$('#inputMemo').value.length}/100`; });

  $('#inputPrice').addEventListener('input', () => { $('#inputPrice').value = $('#inputPrice').value.replace(/\D/g, ''); });

  $('#galleryAddButton').addEventListener('click', () => $('#photoInput').click());

  $('#photoInput').addEventListener('change', e => { const chosen = [...e.target.files].filter(f => f.type.startsWith('image/')); working.images.push(...chosen); e.target.value = ''; renderPhotoEditor(); });

  $('#saveEditButton').addEventListener('click', async () => {

    const name = $('#inputName').value.trim();

    if (!name) { toast('상품명을 입력해 주세요.'); return; }

    if (!working.friends.length) { toast('친구를 한 명 이상 선택해 주세요.'); return; }

    const next = { ...working, name, brand: $('#inputBrand').value.trim(), price: $('#inputPrice').value.replace(/\D/g, ''), memo: $('#inputMemo').value.trim() };

    $('#saveEditButton').disabled = true;

    try { await save(next); product = next; working = null; showEdit(false); render(); toast('수정이 완료되었습니다.'); }

    catch (error) { console.error(error); toast('저장하지 못했습니다. 다시 시도해 주세요.'); }

    finally { $('#saveEditButton').disabled = false; }

  });

  function openDelete() { closeMenu(); $('#deleteModal').classList.add('open'); $('#deleteModal').setAttribute('aria-hidden', 'false'); $('.delete-dialog').focus(); }

  function closeDelete() { $('#deleteModal').classList.remove('open'); $('#deleteModal').setAttribute('aria-hidden', 'true'); }

  $('#deleteButton').addEventListener('click', openDelete);

  $('#cancelDeleteButton').addEventListener('click', closeDelete);

  $('#deleteModal').addEventListener('click', e => { if (e.target === $('#deleteModal')) closeDelete(); });

  $('#confirmDeleteButton').addEventListener('click', async () => {

    $('#confirmDeleteButton').disabled = true;

    try { await remove(); goList(); }

    catch (error) { console.error(error); toast('삭제하지 못했습니다.'); $('#confirmDeleteButton').disabled = false; }

  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeFriendDropdown(); closeMenu(); if ($('#deleteModal').classList.contains('open')) closeDelete(); } });

  document.querySelectorAll('.recommend-add').forEach(btn => btn.addEventListener('click', () => toast('상품이 추가되었습니다.')));

  window.addEventListener('beforeunload', releaseURLs);

  (async () => { try { product = await load(); if (!product) { if (id !== demo.id) { toast('해당 상품을 찾을 수 없습니다.'); return; } else { product = demo; } } } catch (error) { console.error(error); product = demo; toast('저장된 정보를 불러오지 못했습니다.'); } render(); })();

});
