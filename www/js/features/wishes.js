import { state } from "../state.js";
import { SELF, listFriends, getFriend } from "../services/friend-service.js";
import {
  listWishes,
  getWish,
  saveWish,
  deleteWish,
  formatPrice
} from "../services/wish-service.js";
import { escapeHtml, nickname, normalizeUrl } from "../utils.js";

const POLAROID_COLORS = ["pink", "gray", "pale", "rose", "dark", "white"];
const MAX_PHOTOS = 5;

const bg = src => (src ? `style="background-image:url('${src}')"` : "");
const thumbImg = src => (src ? `style="--img:url('${src}')"` : "");

const emptyDraft = () => ({
  name: "",
  brand: "",
  price: "",
  memo: "",
  link: "",
  images: []
});

async function resolveOwner() {
  const id = state.currentFriendId;

  if (!id || id === SELF.id) {
    return { id: SELF.id, label: "나만", isSelf: true };
  }

  if (id && id !== "all") {
    const friend = await getFriend(id);

    if (friend) {
      return { id: friend.id, label: nickname(friend.name), isAll: false };
    }
  }

  return { id: "all", label: "전체", isAll: true };
}

const titleHTML = owner =>
  owner.isSelf ? "나만의 위시리스트" : owner.isAll
    ? "전체 위시리스트"
    : `<span class="accent">${escapeHtml(owner.label)}</span>의 위시리스트`;

/* =========================
   위시리스트 (친구별 폴라로이드)
========================= */

export async function initWishlist() {
  const root = document.querySelector("#app-content").firstElementChild;
  const grid = root.querySelector("#polaroid-grid");
  if (!grid) return;

  const [friends, wishes] = await Promise.all([listFriends(), listWishes("all")]);
  const entries = [{ ...SELF, name: "To.U" }, ...friends];

  grid.innerHTML = entries.map((entry, index) => {
    const cover = wishes.find(
      wish => wish.friendId === entry.id
    )?.images?.[0];

    const color = POLAROID_COLORS[index % POLAROID_COLORS.length];

    return `
      <button class="polaroid polaroid--${color}" type="button"
              data-page="wishlist-detail" data-friend-id="${entry.id}">
        <span class="polaroid__photo" ${bg(cover)}></span>
        <span class="polaroid__name">${escapeHtml(entry.name)}</span>
      </button>
    `;
  }).join("");
}

/* =========================
   위시리스트 상세 (카드형: 세로 스크롤)
========================= */

export async function initWishlistDetail() {
  const root = document.querySelector("#app-content").firstElementChild;
  const body = root.querySelector("#card-body");
  if (!body) return;

  const owner = await resolveOwner();
  const wishes = await listWishes(owner.id);

  root.querySelector("#wl-title").innerHTML = titleHTML(owner);

  body.innerHTML = wishes.length
    ? wishes.map(wish => `
        <button class="paper__img" type="button"
                data-page="wish-detail" data-wish-id="${wish.id}"
                aria-label="${escapeHtml(wish.name)}"
                ${bg(wish.images?.[0])}></button>
      `).join("")
    : `<p class="empty-text">아직 등록된 선물 후보가 없어요.</p>`;
}

/* =========================
   위시리스트 상세 (그리드형)
========================= */

export async function initWishlistGrid() {
  const root = document.querySelector("#app-content").firstElementChild;
  const grid = root.querySelector("#thumb-grid");
  if (!grid) return;

  const owner = await resolveOwner();
  const wishes = await listWishes(owner.id);

  root.querySelector("#wg-title").innerHTML = titleHTML(owner);

  const total = Math.max(12, Math.ceil((wishes.length + 1) / 3) * 3);

  const thumbs = wishes.map(wish => `
    <button class="thumb" type="button"
            data-page="wish-detail" data-wish-id="${wish.id}"
            aria-label="${escapeHtml(wish.name)}"
            ${thumbImg(wish.images?.[0])}></button>
  `);

  const empties = Array.from(
    { length: total - wishes.length },
    () => `<span class="thumb thumb--empty"></span>`
  );

  grid.innerHTML = [...thumbs, ...empties].join("");
}

/* =========================
   상품 상세
========================= */

export async function initWishDetail(navigate) {
  const root = document.querySelector("#app-content").firstElementChild;
  const wish = state.currentWishId ? await getWish(state.currentWishId) : null;

  if (!root.isConnected) return;
  if (!wish) {
    navigate("wishlist-detail");
    return;
  }

  const friend = wish.friendId === SELF.id ? SELF : await getFriend(wish.friendId);
  if (!root.isConnected) return;

  root.querySelector("#wd-title").textContent = wish.friendId === SELF.id
    ? "나만의 위시리스트"
    : friend
    ? `${nickname(friend.name)}의 위시리스트`
    : "위시리스트";

  const images = wish.images?.length ? wish.images : [null];

  root.querySelector("#wd-photos").innerHTML = images.map(src => `
    <span class="paper__img" ${bg(src)}></span>
  `).join("");

  root.querySelector("#wd-name").textContent = wish.name;

  const price = root.querySelector("#wd-price");
  price.textContent = formatPrice(wish.price);
  price.hidden = !wish.price;

  root.querySelector("#wd-friend").innerHTML = friend
    ? `<li class="tag">${escapeHtml(nickname(friend.name))}</li>`
    : "";

  root.querySelector("#wd-memo").textContent = wish.memo || "";

  const site = root.querySelector("#wd-site");

  const link = normalizeUrl(wish.link);
  if (link) {
    site.href = link;
  } else {
    root.querySelector("#wd-bottom").hidden = true;
  }

  const deleteButton = root.querySelector("#wd-more");
  deleteButton.addEventListener("click", async () => {
    if (deleteButton.disabled || !confirm("이 선물 후보를 삭제할까요?")) return;
    deleteButton.disabled = true;
    try {
      await deleteWish(wish.id);
      if (!root.isConnected) return;
      state.currentWishId = null;
      navigate("wishlist-detail");
    } catch (error) {
      console.error("상품 삭제 실패:", error);
      if (root.isConnected) alert("삭제하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      deleteButton.disabled = false;
    }
  });
}

/* =========================
   링크 입력
========================= */

export function initWishLink(navigate) {
  const root = document.querySelector("#app-content").firstElementChild;
  const input = root.querySelector(".link-field input");
  const button = root.querySelector("#ai-load");
  if (!input || !button) return;

  input.value = state.draft?.link || "";

  button.addEventListener("click", () => {
    const link = normalizeUrl(input.value);

    if (!link) {
      alert("올바른 http 또는 https 상품 링크를 입력해 주세요.");
      return;
    }

    state.draft = { ...emptyDraft(), ...state.draft, link };
    navigate("wish-add");
  });
}

/* =========================
   상품 입력
========================= */

function resizeImage(file, max = 800) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      try {
        const scale = Math.min(1, max / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        if (!context) throw new Error("이미지를 처리할 수 없습니다.");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(url);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지를 읽을 수 없습니다."));
    };
    image.src = url;
  });
}

export async function initWishAdd(navigate) {
  const root = document.querySelector("#app-content").firstElementChild;
  const slots = root.querySelector("#photo-slots");
  if (!slots) return;

  if (!state.draft) state.draft = emptyDraft();
  const draft = state.draft;

  const photoInput = root.querySelector("#photo-input");
  const nameInput = root.querySelector("#wish-name");
  const brandInput = root.querySelector("#wish-brand");
  const priceInput = root.querySelector("#wish-price");
  const memoInput = root.querySelector("#wish-memo");
  const friendButton = root.querySelector("#select-friend-btn");

  nameInput.value = draft.name;
  brandInput.value = draft.brand;
  memoInput.value = draft.memo;
  priceInput.value = draft.price
    ? Number(draft.price).toLocaleString("ko-KR")
    : "";

  nameInput.addEventListener("input", () => { draft.name = nameInput.value; });
  brandInput.addEventListener("input", () => { draft.brand = brandInput.value; });
  memoInput.addEventListener("input", () => { draft.memo = memoInput.value; });

  priceInput.addEventListener("input", () => {
    const digits = priceInput.value.replace(/\D/g, "");
    draft.price = digits;
    priceInput.value = digits ? Number(digits).toLocaleString("ko-KR") : "";
  });

  const selected = state.selectedFriendId === SELF.id
    ? SELF
    : state.selectedFriendId
    ? await getFriend(state.selectedFriendId)
    : null;

  if (!root.isConnected) return;
  if (selected) {
    friendButton.textContent = selected.name;
    friendButton.classList.add("is-filled");
  } else {
    state.selectedFriendId = null;
  }

  function renderSlots() {
    const count = draft.images.length;

    slots.innerHTML = draft.images.map((src, index) => `
      <button class="photo-slot photo-slot--img" type="button"
              data-remove="${index}" aria-label="사진 삭제"
              ${bg(src)}></button>
    `).join("") + (count < MAX_PHOTOS ? `
      <button class="photo-slot" type="button" id="add-photo" aria-label="사진 추가">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <small>${count}/${MAX_PHOTOS}</small>
      </button>
    ` : "");
  }

  slots.addEventListener("click", event => {
    const remove = event.target.closest("[data-remove]");

    if (remove) {
      if (confirm("이 사진을 삭제할까요?")) {
        draft.images.splice(Number(remove.dataset.remove), 1);
        renderSlots();
      }
      return;
    }

    if (event.target.closest("#add-photo")) {
      photoInput.click();
    }
  });

  let processingPhotos = false;
  photoInput.addEventListener("change", async () => {
    if (processingPhotos) return;
    processingPhotos = true;
    let failed = false;
    const files = [...photoInput.files].slice(0, MAX_PHOTOS - draft.images.length);

    for (const file of files) {
      try {
        const image = await resizeImage(file);
        if (draft.images.length < MAX_PHOTOS) draft.images.push(image);
      } catch (error) {
        failed = true;
        console.warn("이미지 처리 실패:", error);
      }
    }

    photoInput.value = "";
    processingPhotos = false;
    renderSlots();
    if (failed && root.isConnected) alert("일부 사진을 읽지 못했습니다. 다른 사진을 선택해 주세요.");
  });

  renderSlots();

  const saveButton = root.querySelector("#save-wish");
  saveButton.addEventListener("click", async () => {
    if (saveButton.disabled) return;
    if (processingPhotos) {
      alert("사진 처리 중입니다. 잠시 후 등록해 주세요.");
      return;
    }
    const name = draft.name.trim();

    if (!name) {
      alert("상품명을 입력해 주세요.");
      return;
    }

    if (!state.selectedFriendId) {
      alert("선물할 친구를 선택해 주세요.");
      return;
    }

    saveButton.disabled = true;
    try {
      await saveWish({
        friendId: state.selectedFriendId,
        name,
        brand: draft.brand.trim(),
        price: draft.price,
        memo: draft.memo.trim(),
        link: draft.link,
        images: draft.images
      });

      if (!root.isConnected) return;
      state.currentFriendId = state.selectedFriendId;
      state.draft = null;
      state.selectedFriendId = null;

      navigate("wishlist-detail");
    } catch (error) {
      console.error("상품 저장 실패:", error);
      if (root.isConnected) alert("저장하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      saveButton.disabled = false;
    }
  });
}
