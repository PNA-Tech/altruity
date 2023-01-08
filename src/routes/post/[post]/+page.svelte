<script lang="ts">
  import { page } from "$app/stores";
  import { pb, user } from "$lib/pb";
  import type { Record } from "pocketbase";
  import { onMount } from "svelte";


  let post: Record;
  let author: Record;
  onMount(async () => {
    post = await pb.collection("posts").getOne($page.params.post, { expand: "author" });
    author = post.expand.author as Record;
    console.log(post);
  })
</script>

{#if post}
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
    <button class="btn btn-success">
      <i class="bi bi-hand-thumbs-up-fill"></i>
      Like
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
    max-height: 60%;
  }

  .avatar {
    width: 90px;
  }
</style>