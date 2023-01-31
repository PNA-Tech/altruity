import { pb } from "$lib/pb";
import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
  let user = await pb.collection("users").getOne(params.user);
  return {
    user: user,
  };
}) satisfies PageLoad;