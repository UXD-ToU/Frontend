
document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector) => document.querySelector(selector);

  // ========================================
  // DATABASE / STATE
  // ========================================

  const DB = "present-detail-products-v1";
  const STORE = "products";

  const id =
    new URLSearchParams(window.location.search).get("id") ||
    "demo-1";

  const friends = ["유진", "은수", "지민"];

  const demo = {
    id: "demo-1",
    name: "상품 이름",
    brand: "",
    price: "",
    friends: ["유진"],
    memo: "",
    date: "2026.10.10",
    images: [],
  };

  let product = null;
  let working = null;
  let editing = false;

  let urls = [];
  let toastTimer = null;

  let friendSlots = [];
  let nextFriendKey = 1;
  let activeFriendKey = null;

  // ========================================
  // INDEXEDDB
  // ========================================

  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB, 1);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, {
            keyPath: "id",
          });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () =>
        reject(new Error("데이터베이스가 다른 탭에서 사용 중입니다."));
    });
  }

  async function dbAction(mode, operation) {
    const db = await openDB();

    try {
      return await new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE, mode);
        const request = operation(
          transaction.objectStore(STORE)
        );

        let result;

        if (request) {
          request.onsuccess = () => {
            result = request.result;
          };
        }

        transaction.oncomplete = () => resolve(result);
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () =>
          reject(transaction.error || new Error("작업이 중단되었습니다."));
      });
    } finally {
      db.close();
    }
  }

  const load = () =>
    dbAction("readonly", (store) => store.get(id));

  const save = (data) =>
    dbAction("readwrite", (store) => store.put(data));

  const remove = () =>
    dbAction("readwrite", (store) => store.delete(id));

  // ========================================
  // NAVIGATION
  // ========================================

  function goList() {
    window.location.href = "./Present-List.html";
  }

  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      goList();
    }
  }

  $("#backButton").addEventListener("click", goBack);

  $("#homeButton").addEventListener("click", () => {
    window.location.href = "./home.html";
  });

  // ========================================
  // TOAST
  // ========================================

  function toast(message) {
    const element = $("#toast");

    clearTimeout(toastTimer);

    element.textContent = message;
    element.classList.add("show");

    toastTimer = setTimeout(() => {
      element.classList.remove("show");
    }, 2100);
  }

  // ========================================
  // IMAGE URL MANAGEMENT
  // ========================================

  function releaseURLs() {
    urls.forEach((url) => URL.revokeObjectURL(url));
    urls = [];
  }

  function imageURL(file) {
    if (typeof file === "string") {
      return file;
    }

    const url = URL.createObjectURL(file);
    urls.push(url);

    return url;
  }

  // ========================================
  // PRODUCT IMAGE GALLERY
  // ========================================

  function renderGallery(data) {
    releaseURLs();

    const gallery = $("#photoGallery");
    gallery.replaceChildren();

    if (!data.images?.length) {
      const placeholder = document.createElement("div");
      placeholder.className = "photo-placeholder";

      gallery.append(placeholder);
      return;
    }

    data.images.forEach((file) => {
      const img = document.createElement("img");

      img.alt = "상품 이미지";
      img.src = imageURL(file);

      gallery.append(img);
    });
  }

  // ========================================
  // PRODUCT INFORMATION RENDER
  // ========================================

  function render() {
    if (!product) return;

    $("#displayName").textContent =
      product.name || "상품 이름";

    $("#savedDate").textContent =
      product.date || "";

    $("#displayBrand").textContent =
      product.brand || "-";

    const digits = String(product.price || "")
      .replace(/\D/g, "");

    $("#displayPrice").textContent = digits
      ? `${BigInt(digits).toLocaleString("ko-KR")}원`
      : "-";

    const friendList = $("#displayFriends");
    friendList.replaceChildren();

    (product.friends || []).forEach((name) => {
      const chip = document.createElement("span");

      chip.className = "friend-chip";
      chip.textContent = name;

      friendList.append(chip);
    });

    const memoBox = $("#memoBox");

    memoBox.hidden = !product.memo?.trim();
    memoBox.textContent = product.memo || "";

    renderGallery(product);
  }

  // ========================================
  // EDIT MODE
  // ========================================

  function showEdit(flag) {
    editing = flag;

    [
      "displayName",
      "displayFriends",
      "displayBrand",
      "displayPrice",
      "memoBox",
    ].forEach((elementId) => {
      const element = document.getElementById(elementId);

      if (elementId === "memoBox") {
        element.hidden = flag
          ? true
          : !product.memo?.trim();
      } else {
        element.hidden = flag;
      }
    });

    [
      "inputName",
      "editFriends",
      "inputBrand",
      "inputPrice",
      "memoEditWrap",
      "editActions",
      "editPhotos",
    ].forEach((elementId) => {
      document.getElementById(elementId).hidden = !flag;
    });

    $("#menuButton").disabled = flag;
    $("#galleryAddButton").hidden = !flag;

    if (!flag) {
      closeFriendDropdown();
    }

    $(".recommendations").hidden = flag;
  }

  function startEdit() {
    if (!product) return;

    closeMenu();

    working = {
      ...product,
      friends: [...(product.friends || [])],
      images: [...(product.images || [])],
    };

    $("#inputName").value = working.name || "";
    $("#inputBrand").value = working.brand || "";

    $("#inputPrice").value = working.price || "";
    $("#inputMemo").value = working.memo || "";

    $("#memoCount").textContent =
      `${$("#inputMemo").value.length}/100`;

    friendSlots = [
      {
        key: 0,
        name: working.friends[0] || null,
      },
      ...working.friends.slice(1).map((name) => ({
        key: nextFriendKey++,
        name,
      })),
    ];

    showEdit(true);
    renderFriendEditor();
    renderPhotoEditor();
  }

  // ========================================
  // FRIEND SELECTOR
  // ========================================

  function closeFriendDropdown() {
    $("#friendDropdown").hidden = true;
    activeFriendKey = null;

    $("#addFriendButton").setAttribute(
      "aria-expanded",
      "false"
    );

    $("#friendChips")
      .querySelectorAll(".friend-toggle")
      .forEach((button) => {
        button.setAttribute("aria-expanded", "false");
      });
  }

  function renderFriendEditor() {
    const chips = $("#friendChips");
    chips.replaceChildren();

    friendSlots.forEach((slot) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "friend-toggle";

      button.setAttribute(
        "aria-label",
        slot.name
          ? `${slot.name} 선택 변경`
          : "친구 선택"
      );

      button.setAttribute(
        "aria-expanded",
        String(
          !$("#friendDropdown").hidden &&
          activeFriendKey === slot.key
        )
      );

      const name = document.createElement("span");
      name.className = "friend-summary";
      name.textContent = slot.name || "";

      const caret = document.createElement("span");
      caret.className = "friend-caret";
      caret.setAttribute("aria-hidden", "true");

      button.append(name, caret);

      button.addEventListener("click", () => {
        toggleFriendDropdown(slot.key, button);
      });

      chips.append(button);
    });

    working.friends = friendSlots
      .map((slot) => slot.name)
      .filter(Boolean);
  }

  function toggleFriendDropdown(key, trigger) {
    const dropdown = $("#friendDropdown");

    if (
      !dropdown.hidden &&
      activeFriendKey === key
    ) {
      closeFriendDropdown();
      return;
    }

    activeFriendKey = key;
    dropdown.replaceChildren();

    const slot = friendSlots.find(
      (item) => item.key === key
    );

    const taken = new Set(
      friendSlots.map((item) => item.name).filter(Boolean)
    );

    const availableFriends = [
      ...new Set([
        ...friends,
        ...(product.friends || []),
      ]),
    ];

    availableFriends.forEach((name) => {
      if (taken.has(name) && slot?.name !== name) {
        return;
      }

      const option = document.createElement("button");

      option.type = "button";
      option.className = "friend-option";
      option.textContent = name;

      option.setAttribute(
        "aria-pressed",
        String(slot?.name === name)
      );

      option.addEventListener("click", () => {
        if (key === "add") {
          friendSlots.push({
            key: nextFriendKey++,
            name,
          });
        } else if (slot) {
          if (slot.name === name) {
            if (slot.key === 0) {
              slot.name = null;
            } else {
              friendSlots.splice(
                friendSlots.indexOf(slot),
                1
              );
            }
          } else {
            slot.name = name;
          }
        }

        closeFriendDropdown();
        renderFriendEditor();
      });

      dropdown.append(option);
    });

    if (!dropdown.childElementCount) {
      const empty = document.createElement("span");

      empty.className = "friend-empty-message";
      empty.textContent = "추가할 친구가 없습니다";

      dropdown.append(empty);
    }

    const controlRect =
      $("#editFriends").getBoundingClientRect();

    const triggerRect =
      trigger.getBoundingClientRect();

    dropdown.style.left = `${Math.max(
      0,
      Math.min(
        triggerRect.left - controlRect.left,
        controlRect.width - 132
      )
    )}px`;

    dropdown.hidden = false;

    $("#addFriendButton").setAttribute(
      "aria-expanded",
      String(key === "add")
    );

    $("#friendChips")
      .querySelectorAll(".friend-toggle")
      .forEach((button, index) => {
        button.setAttribute(
          "aria-expanded",
          String(friendSlots[index].key === key)
        );
      });
  }

  $("#addFriendButton").addEventListener("click", () => {
    toggleFriendDropdown(
      "add",
      $("#addFriendButton")
    );
  });

  document.addEventListener("pointerdown", (event) => {
    if (!$("#editFriends").contains(event.target)) {
      closeFriendDropdown();
    }
  });

  // ========================================
  // PHOTO EDITOR
  // ========================================

  function renderPhotoEditor() {
    const editor = $("#photoEditor");
    editor.replaceChildren();

    working.images.forEach((file, index) => {
      const box = document.createElement("div");
      box.className = "photo-edit-item";

      const img = document.createElement("img");
      img.src = imageURL(file);
      img.alt = "선택한 사진";

      const removeBtn = document.createElement("button");

      removeBtn.type = "button";
      removeBtn.textContent = "×";
      removeBtn.setAttribute("aria-label", "사진 삭제");

      removeBtn.addEventListener("click", () => {
        working.images.splice(index, 1);
        renderPhotoEditor();
      });

      box.append(img, removeBtn);
      editor.append(box);
    });
  }

  $("#galleryAddButton").addEventListener("click", () => {
    $("#photoInput").click();
  });

  $("#photoInput").addEventListener("change", (event) => {
    if (!working) return;

    const chosen = Array.from(event.target.files || [])
      .filter((file) => file.type.startsWith("image/"));

    working.images.push(...chosen);

    event.target.value = "";
    renderPhotoEditor();
  });

  // ========================================
  // MENU
  // ========================================

  function closeMenu() {
    $("#actionMenu").hidden = true;

    $("#menuButton").setAttribute(
      "aria-expanded",
      "false"
    );
  }

  $("#menuButton").addEventListener("click", () => {
    if (editing) return;

    const menu = $("#actionMenu");

    menu.hidden = !menu.hidden;

    $("#menuButton").setAttribute(
      "aria-expanded",
      String(!menu.hidden)
    );
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".header-right")) {
      closeMenu();
    }
  });

  $("#editButton").addEventListener("click", startEdit);

  // ========================================
  // EDIT INPUTS
  // ========================================

  $("#inputMemo").addEventListener("input", () => {
    $("#memoCount").textContent =
      `${$("#inputMemo").value.length}/100`;
  });

  $("#inputPrice").addEventListener("input", () => {
    const digits = $("#inputPrice").value.replace(/\D/g, "");

    $("#inputPrice").value = digits
      ? BigInt(digits).toLocaleString("ko-KR")
      : "";
  });

  // ========================================
  // CANCEL EDIT
  // ========================================

  $("#cancelEditButton").addEventListener("click", () => {
    working = null;

    showEdit(false);
    render();
  });

  // ========================================
  // SAVE EDIT
  // ========================================

  $("#saveEditButton").addEventListener("click", async () => {
    if (!working) return;

    const name = $("#inputName").value.trim();

    if (!name) {
      toast("상품명을 입력해 주세요.");
      return;
    }

    if (!working.friends.length) {
      toast("친구를 한 명 이상 선택해 주세요.");
      return;
    }

    const next = {
      ...working,
      name,
      brand: $("#inputBrand").value.trim(),
      price: $("#inputPrice").value.replace(/\D/g, ""),
      memo: $("#inputMemo").value.trim(),
    };

    $("#saveEditButton").disabled = true;

    try {
      await save(next);

      product = next;
      working = null;

      showEdit(false);
      render();

      toast("수정이 완료되었습니다.");
    } catch (error) {
      console.error("상품 수정 실패:", error);

      toast("저장하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      $("#saveEditButton").disabled = false;
    }
  });

  // ========================================
  // DELETE MODAL
  // ========================================

  function openDelete() {
    closeMenu();

    $("#deleteModal").classList.add("open");
    $("#deleteModal").setAttribute("aria-hidden", "false");

    $(".delete-dialog").focus();
  }

  function closeDelete() {
    $("#deleteModal").classList.remove("open");
    $("#deleteModal").setAttribute("aria-hidden", "true");
  }

  $("#deleteButton").addEventListener("click", openDelete);

  $("#cancelDeleteButton").addEventListener(
    "click",
    closeDelete
  );

  $("#deleteModal").addEventListener("click", (event) => {
    if (event.target === $("#deleteModal")) {
      closeDelete();
    }
  });

  $("#confirmDeleteButton").addEventListener(
    "click",
    async () => {
      $("#confirmDeleteButton").disabled = true;

      try {
        await remove();

        window.location.href = "./home.html";
      } catch (error) {
        console.error("상품 삭제 실패:", error);

        toast("삭제하지 못했습니다.");

        $("#confirmDeleteButton").disabled = false;
      }
    }
  );

  // ========================================
  // KEYBOARD
  // ========================================

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    closeFriendDropdown();
    closeMenu();

    if ($("#deleteModal").classList.contains("open")) {
      closeDelete();
    }
  });

  // ========================================
  // RECOMMENDATIONS
  // ========================================

  document.querySelectorAll(".recommend-add").forEach(
    (button) => {
      button.addEventListener("click", () => {
        toast("상품이 추가되었습니다.");
      });
    }
  );

  // ========================================
  // CLEANUP
  // ========================================

  window.addEventListener("beforeunload", releaseURLs);

  // ========================================
  // INITIALIZE
  // ========================================

  async function initializeDetail() {
    try {
      const savedProduct = await load();

      if (savedProduct) {
        product = savedProduct;
      } else if (id === demo.id) {
        product = demo;
      } else {
        toast("해당 상품을 찾을 수 없습니다.");
        return;
      }

      render();
    } catch (error) {
      console.error("상품 불러오기 실패:", error);

      toast("상품 정보를 불러오지 못했습니다.");
    }
  }

  initializeDetail();
});
