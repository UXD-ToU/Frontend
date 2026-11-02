import { getAll, getOne, putOne, removeOne } from "../db/database.js";
import { deleteWishesByFriend } from "./wish-service.js";

const STORE = "friends";
const SEEDED_KEY = "tou_friends_seeded";
export const AVATARS = ["pale", "pink", "black", "gray"];

// 처음 실행할 때만 넣는 테스트 데이터
const seedFriends = [
  { id: "friend-jeongin", name: "정인", birthday: "2000-02-25", relation: "친한 친구", avatar: "pale" },
  { id: "friend-eunsu", name: "은수", birthday: "2000-03-14", relation: "친한 친구", avatar: "black" },
  { id: "friend-jiho", name: "지호", birthday: "2000-05-02", relation: "지인", avatar: "pink" },
  { id: "friend-jimin", name: "지민", birthday: "2000-07-19", relation: "동료", avatar: "gray" },
  { id: "friend-yujin", name: "유진", birthday: "2000-11-24", relation: "친한 친구", avatar: "gray" },
  { id: "friend-sohee", name: "소희", birthday: "2000-12-08", relation: "가족", avatar: "pale" }
];

export async function listFriends() {
  if (!localStorage.getItem(SEEDED_KEY)) {
    const existing = await getAll(STORE);

    if (existing.length === 0) {
      for (const friend of seedFriends) {
        await putOne(STORE, friend);
      }
    }

    localStorage.setItem(SEEDED_KEY, "1");
  }

  return getAll(STORE);
}

export const getFriend = id => getOne(STORE, id);

export async function saveFriend({ id, name, birthday, relation, avatar }) {
  let friend = id ? await getOne(STORE, id) : null;

  if (!friend) {
    const count = (await getAll(STORE)).length;

    friend = {
      id: `friend-${Date.now()}`,
      avatar: AVATARS[count % AVATARS.length]
    };
  }

  const saved = {
    ...friend,
    name,
    birthday,
    relation,
    avatar: avatar || friend.avatar
  };

  await putOne(STORE, saved);

  return saved;
}

export async function deleteFriend(id) {
  await deleteWishesByFriend(id);
  await removeOne(STORE, id);
}

export function formatBirthday(birthday) {
  const [, month, day] = birthday.split("-").map(Number);
  return `${month}월 ${day}일`;
}