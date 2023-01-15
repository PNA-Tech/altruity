import PocketBase, { Admin, Record } from "pocketbase";
import { writable } from "svelte/store";

export const pb = new PocketBase('https://altruity.nv7haven.com')
export const user = writable(pb.authStore.model);

pb.authStore.onChange(() => {
  user.set(pb.authStore.model);
})

// Workaround
export function asRecord(v: Record | Record[] | Admin): Record {
  return v as Record;
}

export async function publishFeed(item: any, user: string) {
  let followers = await pb.collection("follows").getFullList(100, { filter: `following="${user}"` })
  let feed = pb.collection("feed");
  for (let follower of followers) {
    item.target = follower.user;
    feed.create(item);
  }
}