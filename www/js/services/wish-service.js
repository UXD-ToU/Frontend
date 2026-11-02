import { getAll, getOne, putOne, removeOne } from "../db/database.js";

const STORE = "wishes";

export async function listWishes(friendId = "all") {
  const wishes = await getAll(STORE);

  const filtered = friendId === "all"
    ? wishes
    : wishes.filter(wish => wish.friendId === friendId);

  return filtered.sort((a, b) => b.createdAt - a.createdAt);
}

export const getWish = id => getOne(STORE, id);

export async function saveWish({ friendId, name, brand, price, memo, link, images }) {
  const wish = {
    id: `wish-${Date.now()}`,
    friendId,
    name,
    brand,
    price,
    memo,
    link,
    images,
    createdAt: Date.now()
  };

  await putOne(STORE, wish);
  return wish;
}

export const deleteWish = id => removeOne(STORE, id);

export async function deleteWishesByFriend(friendId) {
  const wishes = await getAll(STORE);

  for (const wish of wishes.filter(item => item.friendId === friendId)) {
    await removeOne(STORE, wish.id);
  }
}

export function formatPrice(price) {
  return price ? `${Number(price).toLocaleString("ko-KR")}원` : "";
}