import { state } from "../state.js";
import { listFriends, getFriend } from "../services/friend-service.js";
import {
  listWishes,
  getWish,
  saveWish,
  deleteWish,
  formatPrice
} from "../services/wish-service.js";
import { escapeHtml, nickname } from "../utils.js";

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

  if (id && id !== "all") {
    const friend = await getFriend(id);

    if (friend) {
      return { id: friend.id, label: nickname(friend.name), isAll: false };
    }
  }

  return { id: "all", label: "전체", isAll: true };
}

const titleHTML = owner =>
  owner.isAll
    ? "전체 위시리스트"
    : `<span class="accent">${escapeHtml(owner.label)}</span>의 위시리스트`;

/* =========================
   위시리스트 (친구별 폴라로이드)
========================= */

export async function initWishlist() {
  const grid = document.querySelector("#polaroid-grid");
  if (!grid) return;

  const [friends, wishes] = await Promise.all([listFriends(), listWishes("all")]);
  const entries = [{ id: "all", name: "To.U" }, ...friends];

  grid.innerHTML = entries.map((entry, index) => {
    const cover = wishes.find(
      wish => entry.id === "all" || wish.friendId === entry.id
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
  const body = document.querySelector("#card-body");
  if (!body) return;

  const owner = await resolveOwner();
  const wishes = await listWishes(owner.id);

  document.querySelector("#wl-title").innerHTML = titleHTML(owner);

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
  const grid = document.querySelector("#thumb-grid");
  if (!grid) return;

  const owner = await resolveOwner();
  const wishes = await listWishes(owner.id);

  document.querySelector("#wg-title").innerHTML = titleHTML(owner);

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

function normalizeUrl(url) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export async function initWishDetail(navigate) {
  const wish = state.currentWishId ? await getWish(state.currentWishId) : null;

  if (!wish) {
    navigate("wishlist-detail");
    return;
  }

  const friend = await getFriend(wish.friendId);

  document.querySelector("#wd-title").textContent = friend
    ? `${nickname(friend.name)}의 위시리스트`
    : "위시리스트";

  const images = wish.images?.length ? wish.images : [null];

  document.querySelector("#wd-photos").innerHTML = images.map(src => `
    <span class="paper__img" ${bg(src)}></span>
  `).join("");

  document.querySelector("#wd-name").textContent = wish.name;

  const price = document.querySelector("#wd-price");
  price.textContent = formatPrice(wish.price);
  price.hidden = !wish.price;

  document.querySelector("#wd-friend").innerHTML = friend
    ? `<li class="tag">${escapeHtml(nickname(friend.name))}</li>`
    : "";

  document.querySelector("#wd-memo").textContent = wish.memo || "";

  const site = document.querySelector("#wd-site");

  if (wish.link) {
    site.href = normalizeUrl(wish.link);
  } else {
    document.querySelector("#wd-bottom").hidden = true;
  }

  document.querySelector("#wd-more").addEventListener("click", async () => {
    if (!confirm("이 선물 후보를 삭제할까요?")) return;

    await deleteWish(wish.id);
    state.currentWishId = null;
    navigate("wishlist-detail");
  });
}

/* =========================
   링크 입력
========================= */

export function initWishLink(navigate) {
  const input = document.querySelector(".link-field input");
  const button = document.querySelector("#ai-load");
  if (!input || !button) return;

  input.value = state.draft?.link || "";

  button.addEventListener("click", () => {
    const link = input.value.trim();

    if (!link) {
      alert("상품 링크를 입력해 주세요.");
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
      const scale = Math.min(1, max / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");

      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);

      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };

    image.onerror = reject;
    image.src = url;
  });
}

export async function initWishAdd(navigate) {
  const slots = document.querySelector("#photo-slots");
  if (!slots) return;

  if (!state.draft) state.draft = emptyDraft();
  const draft = state.draft;

  const photoInput = document.querySelector("#photo-input");
  const nameInput = document.querySelector("#wish-name");
  const brandInput = document.querySelector("#wish-brand");
  const priceInput = document.querySelector("#wish-price");
  const memoInput = document.querySelector("#wish-memo");
  const friendButton = document.querySelector("#select-friend-btn");

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

  const selected = state.selectedFriendId
    ? await getFriend(state.selectedFriendId)
    : null;

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

  photoInput.addEventListener("change", async () => {
    const files = [...photoInput.files].slice(0, MAX_PHOTOS - draft.images.length);

    for (const file of files) {
      try {
        draft.images.push(await resizeImage(file));
      } catch (error) {
        console.warn("이미지 처리 실패:", error);
      }
    }

    photoInput.value = "";
    renderSlots();
  });

  renderSlots();

  document.querySelector("#save-wish").addEventListener("click", async () => {
    const name = draft.name.trim();

    if (!name) {
      alert("상품명을 입력해 주세요.");
      return;
    }

    if (!state.selectedFriendId) {
      alert("선물할 친구를 선택해 주세요.");
      return;
    }

    await saveWish({
      friendId: state.selectedFriendId,
      name,
      brand: draft.brand.trim(),
      price: draft.price,
      memo: draft.memo.trim(),
      link: draft.link,
      images: draft.images
    });

    state.currentFriendId = state.selectedFriendId;
    state.draft = null;
    state.selectedFriendId = null;

    navigate("wishlist-detail");
  });
}