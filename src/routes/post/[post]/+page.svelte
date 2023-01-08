<script lang="ts">
  import { page } from "$app/stores";
  import { pb, user } from "$lib/pb";
  import type { Record } from "pocketbase";
  import { onMount, onDestroy } from "svelte";

  let loaded = false;

  let likes: Record[] = [];
  let userLiked: boolean;
  $: userLiked = likes.some((v) => v.user == $user?.id)

  let post: Record;
  let author: Record;
  let unsubscribe: () => void;
  onMount(async () => {
    post = await pb.collection("posts").getOne($page.params.post, { expand: "author" });
    author = post.expand.author as Record;
    likes = await pb.collection("likes").getFullList(200, { filter: `post="${post.id}"` });

    unsubscribe = await pb.collection("likes").subscribe("*", async (rec) => {
      if (rec.record.post != post.id) {return;}
      if (rec.action == "create") {
        likes = [...likes, rec.record];
      } else if (rec.action == "delete") {
        likes = likes.filter((l) => l.id != rec.record.id);
      }
    })

    loaded = true;
  })

  onDestroy(() => {
    if (unsubscribe) {unsubscribe()};
  })

  let liking = false;
  async function like() {
    liking = true;
    if (userLiked) {
      let like = likes.find((v) => v.user == $user?.id);
      await pb.collection("likes").delete(like!.id);
    } else {
      await pb.collection("likes").create({ post: post.id, user: $user?.id })
    }
    liking = false;
  }
</script>

{#if loaded}
<div class="text-start">
  <div class="row mb-3 align-items-center">
    <img src={pb.getFileUrl(author, author.avatar, { thumb: "50x50" })} alt={author.username} class="rounded-circle avatar col-2 img-fluid"/>
    <div class="col">
      <h2 class="row">{author.username}</h2>
      <span class="text-muted row">Posted on {post.created}</span>
    </div>
  </div>
  <h1 class="display-1">{post.title}</h1>
  <p class="lead">{post.description}</p>
  {#if post.pictures}
  <div class="hstack gap-2 scroll">
    {#each post.pictures as pic}
      <img src={pb.getFileUrl(post, pic)} alt={post.title} class="image"/>
    {/each}
  </div>
  {/if}

  {#if $user}
  <div class="btn-group btn-group-lg w-100">
    <button class="btn" class:btn-danger={userLiked} class:btn-success={!userLiked} on:click={like} disabled={liking}>
      <i class="bi bi-hand-thumbs-up-fill"></i>
      {likes.length} Like{#if likes.length != 1}s{/if} | {userLiked ? "Unlike" : "Like"}
    </button>
  </div>
  {/if}
</div>
{/if}

<style>
  .scroll {
    overflow: scroll;
  }

  .image {
    max-width: 80%;
    max-height: 50vh;
  }

  .avatar {
    width: 90px;
  }
</style>