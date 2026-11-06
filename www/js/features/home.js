import { listFriends } from "../services/friend-service.js";
import { state } from "../state.js";
import { escapeHtml, avatarHTML } from "../utils.js";

function daysUntil(birthday) {
  const [, month, day] = birthday.split("-").map(Number);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let next = new Date(today.getFullYear(), month - 1, day);

  if (next < today) {
    next = new Date(today.getFullYear() + 1, month - 1, day);
  }

  return Math.round((next - today) / 86400000);
}

function ddayLabel(days) {
  return days === 0 ? "D-DAY" : `D-${days}`;
}

export async function initHome() {
  // 홈으로 돌아오면 작성 중이던 상품은 비움
  state.draft = null;
  state.selectedFriendId = null;

  const date = document.querySelector("#hero-date");
  const title = document.querySelector("#hero-title");
  const cta = document.querySelector("#hero-cta");
  const upcoming = document.querySelector("#upcoming-list");
  if (!title) return;

  const friends = (await listFriends())
    .map(friend => ({ ...friend, daysLeft: daysUntil(friend.birthday) }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  if (!title.isConnected) return;

  // 친구가 없을 때
  if (friends.length === 0) {
    date.textContent = "--/--";
    title.innerHTML = "친구를 등록하고<br>생일을 챙겨요!";
    cta.textContent = "친구 등록하러 가기 →";
    cta.dataset.page = "friend-add";
    delete cta.dataset.friendId;
    upcoming.innerHTML = "";
    return;
  }

  const featured = friends[0];
  const [, month, day] = featured.birthday.split("-").map(Number);

  date.textContent = `${month}/${day}`;
  title.innerHTML = featured.daysLeft === 0
    ? `${escapeHtml(featured.name)}님의 생일이<br>오늘이에요!`
    : `${escapeHtml(featured.name)}님의 생일이<br>${featured.daysLeft}일 남았어요!`;

  cta.dataset.page = "wishlist-detail";
  cta.dataset.friendId = featured.id;

  // 친구 목록과 같은 단추 컴포넌트 사용 → 색이 항상 일치
  upcoming.innerHTML = friends.slice(1, 5).map(friend => `
    <button class="upcoming-item" type="button"
            data-page="friend-detail" data-friend-id="${friend.id}">
      ${avatarHTML(friend.avatar, "btn-avatar--md")}
      <span class="upcoming-name">${escapeHtml(friend.name)}</span>
      <span class="upcoming-dday">${ddayLabel(friend.daysLeft)}</span>
    </button>
  `).join("");
}
