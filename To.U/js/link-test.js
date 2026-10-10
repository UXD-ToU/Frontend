document.addEventListener("DOMContentLoaded", () => {

  const $ = (selector) => document.querySelector(selector);

  const backBtn = $("#backBtn");

  const albumBtn = $("#albumBtn");

  const albumInput = $("#albumInput");

  const imageRow = $("#imageRow");

  const productName = $("#productName");

  const friendChips = $("#friendChips");

  const friendDropdown = $("#friendDropdown");

  const friendControl = $("#friendControl");

  const addFriendBtn = $("#addFriendBtn");

  const brandInput = $("#brandInput");

  const priceInput = $("#priceInput");

  const memoInput = $("#memoInput");

  const memoCount = $("#memoCount");

  const saveBtn = $("#saveBtn");

  const toast = $("#toast");

  const cancelOverlay = $("#cancelOverlay");

  const draftSaveBtn = $("#draftSaveBtn");

  const discardBtn = $("#discardBtn");

  const cancelDialog = cancelOverlay.querySelector(".cancel-dialog");



  // 첫 번째 회색 실선 상자는 디자인상 기본 이미지 자리입니다.

  // 실제 이미지 파일은 전달받지 않았으므로 서버 전송 데이터에는 포함하지 않습니다.

  const addedImages = [];

  let toastTimer = null;



  // 예시 데이터. 실제 친구 데이터가 연결되면 교체합니다.

  const friends = [

    { id: "demo-yujin", name: "유진" },

    { id: "demo-eunsu", name: "은수" },

    { id: "demo-jimin", name: "지민" }

  ];



  function navigateBack() {

  window.location.href = "./home.html";

}



  function openCancelDialog() {

    closeDropdown();

    cancelOverlay.classList.add("open");

    cancelOverlay.setAttribute("aria-hidden", "false");

    cancelDialog.focus();

  }

  function closeCancelDialog() {

    cancelOverlay.classList.remove("open");

    cancelOverlay.setAttribute("aria-hidden", "true");

    backBtn.focus();

  }

  function hasEnteredProductInfo() {

    return Boolean(

      productName.value.trim() ||

      brandInput.value.trim() ||

      priceInput.value.trim() ||

      memoInput.value.trim() ||

      addedImages.length > 0 ||

      slots.some(slot => slot.friendId)

    );

  }



  backBtn.addEventListener("click", () => {

    if (!hasEnteredProductInfo()) {

      navigateBack();

      return;

    }

    openCancelDialog();

  });

  cancelOverlay.addEventListener("click", (event) => {

    if (event.target === cancelOverlay) closeCancelDialog();

  });

  cancelOverlay.addEventListener("keydown", (event) => {

    if (event.key === "Escape") closeCancelDialog();

    if (event.key !== "Tab") return;

    const buttons = [draftSaveBtn, discardBtn].filter(btn => !btn.disabled);

    if (event.shiftKey && document.activeElement === buttons[0]) {

      event.preventDefault(); buttons[buttons.length - 1].focus();

    } else if (!event.shiftKey && document.activeElement === buttons[buttons.length - 1]) {

      event.preventDefault(); buttons[0].focus();

    }

  });

  discardBtn.addEventListener("click", navigateBack);



  // IndexedDB는 문자열 필드뿐 아니라 File 객체도 그대로 보관할 수 있습니다.

  const DRAFT_DB = "present-photo-drafts-v1";

  const DRAFT_KEY = "product-registration";

  function openDraftDatabase() {

    return new Promise((resolve, reject) => {

      if (!window.indexedDB) { reject(new Error("IndexedDB를 사용할 수 없습니다.")); return; }

      const request = indexedDB.open(DRAFT_DB, 1);

      request.onupgradeneeded = () => {

        const db = request.result;

        if (!db.objectStoreNames.contains("drafts")) db.createObjectStore("drafts");

      };

      request.onsuccess = () => resolve(request.result);

      request.onerror = () => reject(request.error);

      request.onblocked = () => reject(new Error("저장소가 다른 탭에서 사용 중입니다."));

    });

  }

  async function writeDraft(draft) {

    const db = await openDraftDatabase();

    try {

      await new Promise((resolve, reject) => {

        const tx = db.transaction("drafts", "readwrite");

        tx.objectStore("drafts").put(draft, DRAFT_KEY);

        tx.oncomplete = resolve;

        tx.onerror = () => reject(tx.error);

        tx.onabort = () => reject(tx.error || new Error("임시 저장이 중단되었습니다."));

      });

    } finally { db.close(); }

  }

  async function readDraft() {

    const db = await openDraftDatabase();

    try {

      return await new Promise((resolve, reject) => {

        const tx = db.transaction("drafts", "readonly");

        const request = tx.objectStore("drafts").get(DRAFT_KEY);

        request.onsuccess = () => resolve(request.result);

        request.onerror = () => reject(request.error);

      });

    } finally { db.close(); }

  }

  draftSaveBtn.addEventListener("click", async () => {

    draftSaveBtn.disabled = true;

    discardBtn.disabled = true;

    const draft = {

      productName: productName.value,

      brand: brandInput.value,

      price: priceInput.value,

      memo: memoInput.value,

      friendIds: slots.map(slot => slot.friendId),

      images: addedImages.map(({ file }) => file),

      savedAt: Date.now()

    };

    try {

      await writeDraft(draft);

      closeCancelDialog();

      showToast("임시 저장되었습니다.");

      setTimeout(navigateBack, 1100);

    } catch (error) {

      console.error("임시 저장 실패:", error);

      showToast("임시 저장에 실패했습니다. 다시 시도해주세요.");

    } finally {

      draftSaveBtn.disabled = false;

      discardBtn.disabled = false;

    }

  });



  albumBtn.addEventListener("click", () => albumInput.click());

  albumInput.addEventListener("change", (event) => {

    for (const file of Array.from(event.target.files || [])) addImage(file);

    albumInput.value = "";

  });



  function addImage(file) {

    if (!file.type.startsWith("image/")) {

      showToast("이미지 파일만 등록할 수 있어요.");

      return;

    }

    if (file.size > 10 * 1024 * 1024) {

      showToast("10MB 이하의 이미지를 선택해주세요.");

      return;

    }

    const url = URL.createObjectURL(file);

    const entry = { file, url };

    addedImages.push(entry);



    const card = document.createElement("div");

    card.className = "photo-preview";

    const img = document.createElement("img");

    img.className = "preview-image";

    img.src = url;

    img.alt = "추가한 상품 이미지";

    const remove = document.createElement("button");

    remove.type = "button";

    remove.className = "remove-photo-btn";

    remove.setAttribute("aria-label", "이 이미지 삭제");

    remove.textContent = "×";

    remove.addEventListener("click", () => {

      const index = addedImages.indexOf(entry);

      if (index !== -1) addedImages.splice(index, 1);

      URL.revokeObjectURL(url);

      card.remove();

    });

    card.append(img, remove);

    imageRow.insertBefore(card, albumBtn);

    // + 버튼은 항상 맨 오른쪽에 위치합니다.

    albumBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });

  }



  // 첫 번째 타원은 항상 존재하며, + 버튼은 새로운 친구 선택용입니다.

  // 각 타원에서 친구를 선택하면 그 타원의 값만 교체합니다.

  const slots = [{ key: 0, friendId: null }];

  let nextSlotKey = 1;

  let activeSlotKey = null; // "add" 또는 슬롯 key



  function selectedFriendIds() {

    return new Set(slots.map(slot => slot.friendId).filter(Boolean));

  }



  function renderFriendChips() {

    friendChips.replaceChildren();

    slots.forEach(slot => {

      const friend = friends.find(item => item.id === slot.friendId);

      const chip = document.createElement("button");

      chip.type = "button";

      chip.className = "friend-toggle";

      chip.setAttribute("aria-label", friend ? `${friend.name} 선택 변경` : "친구 선택");

      chip.setAttribute("aria-expanded", String(!friendDropdown.hidden && activeSlotKey === slot.key));

      const name = document.createElement("span");

      name.className = "friend-summary";

      name.textContent = friend?.name || "";

      const caret = document.createElement("span");

      caret.className = "caret";

      caret.setAttribute("aria-hidden", "true");

      chip.append(name, caret);

      chip.addEventListener("click", () => toggleDropdown(slot.key, chip));

      friendChips.append(chip);

    });

  }



  function closeDropdown() {

    friendDropdown.hidden = true;

    activeSlotKey = null;

    addFriendBtn.setAttribute("aria-expanded", "false");

    friendChips.querySelectorAll(".friend-toggle").forEach(chip => chip.setAttribute("aria-expanded", "false"));

  }



  function toggleDropdown(slotKey, trigger) {

    if (!friendDropdown.hidden && activeSlotKey === slotKey) {

      closeDropdown();

      return;

    }

    activeSlotKey = slotKey;

    friendDropdown.replaceChildren();

    const currentSlot = slots.find(slot => slot.key === slotKey);

    const taken = selectedFriendIds();

    friends.forEach(friend => {

      // 다른 타원에 이미 지정된 친구는 중복 지정하지 않습니다.

      if (taken.has(friend.id) && currentSlot?.friendId !== friend.id) return;

      const option = document.createElement("button");

      option.type = "button";

      option.className = "friend-option";

      option.textContent = friend.name;

      option.setAttribute("aria-pressed", String(currentSlot?.friendId === friend.id));

      option.addEventListener("click", () => {

        if (slotKey === "add") {

          slots.push({ key: nextSlotKey++, friendId: friend.id });

        } else if (currentSlot) {

          if (currentSlot.friendId === friend.id) {

            if (currentSlot.key === 0) currentSlot.friendId = null;

            else slots.splice(slots.indexOf(currentSlot), 1);

          } else {

            currentSlot.friendId = friend.id;

          }

        }

        closeDropdown();

        renderFriendChips();

        updateSaveButton();

      });

      friendDropdown.append(option);

    });

    if (!friendDropdown.childElementCount) {

      const message = document.createElement("span");

      message.className = "friend-empty-message";

      message.textContent = "추가할 친구가 없습니다";

      friendDropdown.append(message);

    }

    const controlRect = friendControl.getBoundingClientRect();

    const triggerRect = trigger.getBoundingClientRect();

    const left = Math.max(0, Math.min(triggerRect.left - controlRect.left, friendControl.clientWidth - 132));

    friendDropdown.style.left = `${left}px`;

    friendDropdown.hidden = false;

    addFriendBtn.setAttribute("aria-expanded", String(slotKey === "add"));

    renderFriendChips();

  }



  addFriendBtn.addEventListener("click", () => toggleDropdown("add", addFriendBtn));

  document.addEventListener("pointerdown", event => {

    if (!friendControl.contains(event.target)) closeDropdown();

  });

  document.addEventListener("keydown", event => {

    if (event.key === "Escape") closeDropdown();

  });



  priceInput.addEventListener("input", () => {

    const digits = priceInput.value.replace(/\D/g, "");

    priceInput.value = digits ? BigInt(digits).toLocaleString("ko-KR") : "";

  });

  memoInput.addEventListener("input", () => {

    memoCount.textContent = `${memoInput.value.length}/100`;

  });



  function updateSaveButton() {

    saveBtn.disabled = selectedFriendIds().size < 1;

  }

  // 상세 페이지와 동일한 IndexedDB 저장소를 사용합니다.
  const PRODUCT_DB = "present-detail-products-v1";
  const PRODUCT_STORE = "products";

  function saveProduct(product) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(PRODUCT_DB, 1);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(PRODUCT_STORE)) {
          db.createObjectStore(PRODUCT_STORE, { keyPath: "id" });
        }
      };

      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error("데이터베이스가 사용 중입니다."));
      request.onsuccess = () => {
        const db = request.result;
        try {
          const tx = db.transaction(PRODUCT_STORE, "readwrite");
          tx.objectStore(PRODUCT_STORE).put(product);
          tx.oncomplete = () => { db.close(); resolve(); };
          tx.onerror = () => { db.close(); reject(tx.error); };
          tx.onabort = () => { db.close(); reject(tx.error); };
        } catch (error) {
          db.close();
          reject(error);
        }
      };
    });
  }

  saveBtn.addEventListener("click", async () => {
    if (saveBtn.disabled || selectedFriendIds().size < 1) return;

    // 기본으로 보이는 link-test.png도 실제 File로 저장합니다.
    let defaultImageFile;
    try {
      const response = await fetch("../assets/images/link-test.png");
      if (!response.ok) throw new Error("기본 이미지 파일을 찾을 수 없습니다.");
      const blob = await response.blob();
      defaultImageFile = new File([blob], "link-test.png", {
        type: blob.type || "image/png"
      });
    } catch (error) {
      console.error("기본 이미지 불러오기 실패:", error);
      showToast("기본 이미지를 불러오지 못했습니다.");
      return;
    }

    const now = new Date();
    const product = {
      id: window.crypto?.randomUUID?.() || `product-${Date.now()}`,
      name: productName.value.trim(),
      brand: brandInput.value.trim(),
      price: priceInput.value.replace(/\D/g, ""),
      memo: memoInput.value.trim(),
      friends: friends
        .filter(friend => selectedFriendIds().has(friend.id))
        .map(friend => friend.name),
      images: [defaultImageFile, ...addedImages.map(({ file }) => file)],
      date: `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`
    };

    saveBtn.disabled = true;
    try {
      await saveProduct(product);
      setTimeout(() => {
        window.location.href = `./link-detail.html?id=${encodeURIComponent(product.id)}`;
      }, 600);
    } catch (error) {
      console.error("상품 저장 실패:", error);
      showToast("상품을 저장하지 못했습니다. 다시 시도해주세요.");
      updateSaveButton();
    }
  });

  function showToast(message) {

    clearTimeout(toastTimer);

    toast.textContent = message;

    toast.classList.add("show");

    toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);

  }

  window.addEventListener("beforeunload", () => {

    addedImages.forEach(({ url }) => URL.revokeObjectURL(url));

  });

  renderFriendChips();

  updateSaveButton();

  // 링크 시연 페이지: 입력값 기본 설정 (사용자가 수정할 수 있음)
  productName.value = productName.value || "K리그x산리오캐릭터즈 인형 키링 코로코로쿠리링";
  brandInput.value = brandInput.value || "K리그 × 산리오캐릭터즈";
  priceInput.value = priceInput.value || "20,000";

});
