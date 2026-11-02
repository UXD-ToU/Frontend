export function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

export function avatarHTML(style, extraClass = "") {
  return `
    <span class="btn-avatar btn-avatar--${style} ${extraClass}" aria-hidden="true">
      <span class="btn-avatar__holes"><i></i><i></i><i></i><i></i></span>
    </span>
  `;
}

// 받침 있으면 "이" 붙이기: 유진 → 유진이, 소희 → 소희
export function nickname(name) {
  const code = name.charCodeAt(name.length - 1);
  const isHangul = code >= 0xAC00 && code <= 0xD7A3;
  const hasBatchim = isHangul && (code - 0xAC00) % 28 !== 0;

  return hasBatchim ? `${name}이` : name;
}