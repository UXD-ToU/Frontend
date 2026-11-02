// 화면 간 임시로 넘기는 값
export const state = {
  currentFriendId: null,   // 보고 있는 친구 ("all"이면 전체)
  editingFriendId: null,   // 수정 중인 친구
  selectedFriendId: null,  // 상품 등록에서 고른 친구
  currentWishId: null,     // 보고 있는 상품
  draft: null              // 작성 중인 상품 (친구 선택 후 돌아와도 유지)
};