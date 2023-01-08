import PocketBase from "pocketbase";
import { writable } from "svelte/store";

export const pb = new PocketBase('https://altruity.nv7haven.com')
export const user = writable(pb.authStore.model);

pb.authStore.onChange(() => {
  user.set(pb.authStore.model);
})