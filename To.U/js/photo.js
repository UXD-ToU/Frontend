
document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector) => document.querySelector(selector);

  const backBtn = $("#backBtn");
  const albumBtn = $("#albumBtn");
  const albumInput = $("#albumInput");
  const imageRow = $("#imageRow");

  const productName = $("#productName");
  const brandInput = $("#brandInput");
  const priceInput = $("#priceInput");
  const memoInput = $("#memoInput");
  const memoCount = $("#memoCount");

  const friendChips = $("#friendChips");
  const friendDropdown = $("#friendDropdown");
  const friendControl = $("#friendControl");
  const addFriendBtn = $("#addFriendBtn");

  const saveBtn = $("#saveBtn");
  const toast = $("#toast");

  const cancelOverlay = $("#cancelOverlay");
  const cancelDialog = cancelOverlay.querySelector(".cancel-dialog");
  const draftSaveBtn = $("#draftSaveBtn");
  const discardBtn = $("#discardBtn");

  const PRODUCT_DB = "present-detail-products-v1";
  const PRODUCT_STORE = "products";

  const DRAFT_DB = "present-photo-drafts-v1";
  const DRAFT_STORE = "drafts";
  const DRAFT_KEY = "product-registration";

  const friends = [
    { id: "demo-yujin", name: "유진" },
    { id: "demo-eunsu", name: "은수" },
    { id: "demo-jimin", name: "지민" },
  ];

  const addedImages = [];

  const slots = [{ key: 0, friendId: null }];
  let nextSlotKey = 1;
  let activeSlotKey = null;
  let toastTimer = null;
  let registering = false;

  // ========================================
  // 공통 IndexedDB
  // ========================================

  function openDatabase(name, storeName, options = {}) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(name, 1);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, options);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () =>
        reject(new Error("데이터베이스가 다른 탭에서 사용 중입니다."));
    });
  }

  async function databaseAction(
    name,
    storeName,
    mode,
    operation,
    options = {}
  ) {
    const db = await openDatabase(name, storeName, options);

    try {
      return await new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        const request = operation(store);

        let result;

        if (request) {
          request.onsuccess = () => {
            result = request.result;
          };
        }

        transaction.oncomplete = () => resolve(result);
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () =>
          reject(transaction.error || new Error("저장이 중단되었습니다."));
      });
    } finally {
      db.close();
    }
  }

  function saveProduct(product) {
    return databaseAction(
      PRODUCT_DB,
      PRODUCT_STORE,
      "readwrite",
      (store) => store.put(product),
      { keyPath: "id" }
    );
  }

  function saveDraft(draft) {
    return databaseAction(
      DRAFT_DB,
      DRAFT_STORE,
      "readwrite",
      (store) => store.put(draft, DRAFT_KEY)
    );
  }

  function readDraft() {
    return databaseAction(
      DRAFT_DB,
      DRAFT_STORE,
      "readonly",
      (store) => store.get(DRAFT_KEY)
    );
  }

  function deleteDraft() {
    return databaseAction(
      DRAFT_DB,
      DRAFT_STORE,
      "readwrite",
      (store) => store.delete(DRAFT_KEY)
    );
  }

  // ========================================
  // 토스트
  // ========================================

  function showToast(message) {
    clearTimeout(toastTimer);

    toast.textContent = message;
    toast.classList.add("show");

    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2500);
  }

  // ========================================
  // 페이지 이동 / 취소 모달
  // ========================================

  function navigateHome() {
    window.location.href = "./home.html";
  }

  function hasEnteredProductInfo() {
    return Boolean(
      productName.value.trim() ||
      brandInput.value.trim() ||
      priceInput.value.trim() ||
      memoInput.value.trim() ||
      addedImages.length > 0 ||
      slots.some((slot) => slot.friendId)
    );
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

  backBtn.addEventListener("click", () => {
    if (!hasEnteredProductInfo()) {
      navigateHome();
      return;
    }

    openCancelDialog();
  });

  cancelOverlay.addEventListener("click", (event) => {
    if (event.target === cancelOverlay) {
      closeCancelDialog();
    }
  });

  cancelOverlay.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCancelDialog();
    }

    if (event.key !== "Tab") return;

    const buttons = [draftSaveBtn, discardBtn].filter(
      (button) => !button.disabled
    );

    if (!buttons.length) return;

    if (
      event.shiftKey &&
      document.activeElement === buttons[0]
    ) {
      event.preventDefault();
      buttons[buttons.length - 1].focus();
    } else if (
      !event.shiftKey &&
      document.activeElement === buttons[buttons.length - 1]
    ) {
      event.preventDefault();
      buttons[0].focus();
    }
  });

  discardBtn.addEventListener("click", async () => {
    try {
      await deleteDraft();
    } catch (error) {
      console.warn("임시 저장 데이터 삭제 실패:", error);
    }

    navigateHome();
  });

  // ========================================
  // 이미지 추가 / 삭제
  // ========================================

  albumBtn.addEventListener("click", () => {
    albumInput.click();
  });

  albumInput.addEventListener("change", (event) => {
    const files = Array.from(event.target.files || []);

    files.forEach((file) => addImage(file));

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

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove-photo-btn";
    removeBtn.setAttribute("aria-label", "이 이미지 삭제");
    removeBtn.textContent = "×";

    removeBtn.addEventListener("click", () => {
      const index = addedImages.indexOf(entry);

      if (index !== -1) {
        addedImages.splice(index, 1);
      }

      URL.revokeObjectURL(url);
      card.remove();
    });

    card.append(img, removeBtn);
    imageRow.insertBefore(card, albumBtn);
  }

  // ========================================
  // 친구 선택
  // ========================================

  function selectedFriendIds() {
    return new Set(
      slots.map((slot) => slot.friendId).filter(Boolean)
    );
  }

  function renderFriendChips() {
    friendChips.replaceChildren();

    slots.forEach((slot) => {
      const friend = friends.find(
        (item) => item.id === slot.friendId
      );

      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "friend-toggle";

      chip.setAttribute(
        "aria-label",
        friend ? `${friend.name} 선택 변경` : "친구 선택"
      );

      chip.setAttribute(
        "aria-expanded",
        String(
          !friendDropdown.hidden &&
          activeSlotKey === slot.key
        )
      );

      const name = document.createElement("span");
      name.className = "friend-summary";
      name.textContent = friend?.name || "";

      const caret = document.createElement("span");
      caret.className = "caret";
      caret.setAttribute("aria-hidden", "true");

      chip.append(name, caret);

      chip.addEventListener("click", () => {
        toggleDropdown(slot.key, chip);
      });

      friendChips.append(chip);
    });
  }

  function closeDropdown() {
    friendDropdown.hidden = true;
    activeSlotKey = null;

    addFriendBtn.setAttribute("aria-expanded", "false");

    friendChips
      .querySelectorAll(".friend-toggle")
      .forEach((chip) => {
        chip.setAttribute("aria-expanded", "false");
      });
  }

  function toggleDropdown(slotKey, trigger) {
    if (
      !friendDropdown.hidden &&
      activeSlotKey === slotKey
    ) {
      closeDropdown();
      return;
    }

    activeSlotKey = slotKey;
    friendDropdown.replaceChildren();

    const currentSlot = slots.find(
      (slot) => slot.key === slotKey
    );

    const taken = selectedFriendIds();

    friends.forEach((friend) => {
      if (
        taken.has(friend.id) &&
        currentSlot?.friendId !== friend.id
      ) {
        return;
      }

      const option = document.createElement("button");
      option.type = "button";
      option.className = "friend-option";
      option.textContent = friend.name;

      option.setAttribute(
        "aria-pressed",
        String(currentSlot?.friendId === friend.id)
      );

      option.addEventListener("click", () => {
        if (slotKey === "add") {
          slots.push({
            key: nextSlotKey++,
            friendId: friend.id,
          });
        } else if (currentSlot) {
          if (currentSlot.friendId === friend.id) {
            if (currentSlot.key === 0) {
              currentSlot.friendId = null;
            } else {
              slots.splice(slots.indexOf(currentSlot), 1);
            }
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

    const left = Math.max(
      0,
      Math.min(
        triggerRect.left - controlRect.left,
        friendControl.clientWidth - 132
      )
    );

    friendDropdown.style.left = `${left}px`;
    friendDropdown.hidden = false;

    addFriendBtn.setAttribute(
      "aria-expanded",
      String(slotKey === "add")
    );

    renderFriendChips();
  }

  addFriendBtn.addEventListener("click", () => {
    toggleDropdown("add", addFriendBtn);
  });

  document.addEventListener("pointerdown", (event) => {
    if (!friendControl.contains(event.target)) {
      closeDropdown();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDropdown();
    }
  });

  // ========================================
  // 가격 / 메모 입력
  // ========================================

  priceInput.addEventListener("input", () => {
    const digits = priceInput.value.replace(/\D/g, "");

    priceInput.value = digits
      ? BigInt(digits).toLocaleString("ko-KR")
      : "";
  });

  memoInput.addEventListener("input", () => {
    memoCount.textContent = `${memoInput.value.length}/100`;
  });

  // ========================================
  // 등록 버튼 상태
  // ========================================

  function updateSaveButton() {
    saveBtn.disabled =
      registering || selectedFriendIds().size < 1;
  }

  // ========================================
  // 상품 등록
  // ========================================

  saveBtn.addEventListener("click", async () => {
    if (registering || selectedFriendIds().size < 1) {
      return;
    }

    const selectedFriends = friends
      .filter((friend) => selectedFriendIds().has(friend.id))
      .map((friend) => friend.name);

    const productId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `product-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 9)}`;

    const product = {
      id: productId,
      name: productName.value.trim(),
      brand: brandInput.value.trim(),
      price: priceInput.value.replace(/\D/g, ""),
      memo: memoInput.value.trim(),
      friends: selectedFriends,
      images: addedImages.map(({ file }) => file),
      date: new Date().toLocaleDateString("ko-KR"),
      createdAt: Date.now(),
    };

    registering = true;
    updateSaveButton();

    try {
      await saveProduct(product);

      try {
        await deleteDraft();
      } catch (error) {
        console.warn("임시 저장 정리 실패:", error);
      }

      window.location.href =
        `./detail.html?id=${encodeURIComponent(product.id)}`;
    } catch (error) {
      console.error("상품 등록 실패:", error);

      showToast("상품 등록에 실패했습니다.");

      registering = false;
      updateSaveButton();
    }
  });

  // ========================================
  // 임시 저장
  // ========================================

  draftSaveBtn.addEventListener("click", async () => {
    draftSaveBtn.disabled = true;
    discardBtn.disabled = true;

    const draft = {
      productName: productName.value,
      brand: brandInput.value,
      price: priceInput.value,
      memo: memoInput.value,
      friendIds: slots.map((slot) => slot.friendId),
      images: addedImages.map(({ file }) => file),
      savedAt: Date.now(),
    };

    try {
      await saveDraft(draft);

      closeCancelDialog();
      showToast("임시 저장되었습니다.");

      setTimeout(navigateHome, 1100);
    } catch (error) {
      console.error("임시 저장 실패:", error);

      showToast("임시 저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      draftSaveBtn.disabled = false;
      discardBtn.disabled = false;
    }
  });

  // ========================================
  // 임시 저장 복원
  // ========================================

  async function restoreDraft() {
    try {
      const draft = await readDraft();

      if (!draft) return;

      productName.value = draft.productName || "";
      brandInput.value = draft.brand || "";
      priceInput.value = draft.price || "";

      memoInput.value = (draft.memo || "").slice(0, 100);
      memoCount.textContent = `${memoInput.value.length}/100`;

      const restoredIds = Array.isArray(draft.friendIds)
        ? draft.friendIds
        : [];

      const validIds = [
        ...new Set(
          restoredIds.filter((id) =>
            friends.some((friend) => friend.id === id)
          )
        ),
      ];

      slots.splice(0, slots.length, {
        key: 0,
        friendId: validIds[0] || null,
      });

      validIds.slice(1).forEach((id) => {
        slots.push({
          key: nextSlotKey++,
          friendId: id,
        });
      });

      renderFriendChips();
      updateSaveButton();

      for (const file of draft.images || []) {
        if (file instanceof Blob) {
          addImage(file);
        }
      }
    } catch (error) {
      console.warn("임시 저장 복원 실패:", error);
    }
  }

  // ========================================
  // 정리 / 초기화
  // ========================================

  window.addEventListener("beforeunload", () => {
    addedImages.forEach(({ url }) => {
      URL.revokeObjectURL(url);
    });
  });

  renderFriendChips();
  updateSaveButton();

  // 시연용 photo-test.html에서는 초안을 복원하지 않음
  if (!window.location.pathname.endsWith("/photo-test.html")) {
    restoreDraft();
  }
});
