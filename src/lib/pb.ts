import PocketBase, { Admin, Record } from "pocketbase";
import { writable } from "svelte/store";

export const pb = new PocketBase('https://altruity.nv7haven.com')
pb.autoCancellation(false);
export const user = writable(pb.authStore.model);

export type Error = {
  message: string,
  code: string,
}

pb.authStore.onChange(() => {
  user.set(pb.authStore.model);
})

// Workaround
export function asRecord(v: Record | Record[] | Admin | null): Record {
  return v as Record;
}

export async function publishFeed(item: any, user: string) {
  let followers = (await pb.collection("users").getFullList(50, {
    filter: `following.id ?= "${user}"`
  }));
  let feed = pb.collection("feed");
  for (let follower of followers) {
    item.target = follower.id;
    feed.create(item);
  }
}