<script lang="ts">
    import { pb } from "$lib/pb";
    import { formatTime } from "$lib/util";
    import type { Record } from "pocketbase";
    import { onMount } from "svelte";


  export let post: Record;
  export let liker: Record | null = null; // For <user> likes this message

  // Get like count
  let likeCount = 0;
  let commentCount = 0;
  onMount(async () => {
    likeCount = (await pb.collection("likes").getList(1, 0, {
      filter: `post="${post.id}"`,
      $cancelKey: post.id,
    })).totalItems;
    commentCount = (await pb.collection("comments").getList(1, 0, {
      filter: `post="${post.id}"`,
      $cancelKey: post.id,
    })).totalItems;
  });

  let author: Record;
  $: author = post.expand.author as Record;
</script>

<div class="card mb-3">
  {#if liker}
  <div class="card-header">
    Liked by {liker.username}
  </div>
  {/if}
  <div class="card-body">
    <div class="text-start row justify-content-center">
      <img src={pb.getFileUrl(author, author.avatar, { thumb: "128x128" })} class="avatar rounded-circle img-fluid col-2" alt={author.username}/>
      <div class="col">
        <a class="card-title h5 linktitle row" href={"/post/" + post.id}>{post.title}</a>
        <p class="card-subtitle mb-2 text-muted row">Posted {formatTime(post.created)}</p>
      </div>
    </div>
    <p class="card-text">{post.description}</p>
  </div>
  {#if post.pictures && post.pictures.length > 0}
  <img src={pb.getFileUrl(post, post.pictures[0])} class="card-img-bottom image" alt="Post highlight">
  {/if}
  <div class="card-footer">
    <div class="row">
      <span class="col">{likeCount} Like{likeCount != 1 ? "s" : ""}</span>
      <span class="col">{commentCount} Comment{commentCount != 1 ? "s" : ""}</span>
    </div>
  </div>
</div>

<style>
  .linktitle {
    text-decoration: none;
  }

  .image {
    max-height: 20vh;
    width: auto;
    object-fit: cover;
    border-radius: 0;
  }

  .avatar {
    width: auto;
    height: 100%;
    max-height: 50px;
  }
</style>