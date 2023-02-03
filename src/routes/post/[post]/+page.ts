import { pb } from "$lib/pb";
import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
  let post = await pb.collection("posts").getOne(params.post, { expand: "author" });
  return {
    post: post,
  };
}) satisfies PageLoad;