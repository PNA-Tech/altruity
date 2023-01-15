<script lang="ts">
  import { page } from "$app/stores";
    import Loading from "$lib/components/Loading.svelte";
  import { pb, user, asRecord, publishFeed } from "$lib/pb";
  import type { Record } from "pocketbase";
  import { onMount, onDestroy } from "svelte";

  let loaded = false;

  let likes: Record[] = [];
  let userLiked: boolean;
  $: userLiked = likes.some((v) => v.user == $user?.id)

  let comments: Record[] = [];
  let comment: string;

  let commenting = false;
  async function makeComment() {
    commenting = true;
    await pb.collection("comments").create({ post: post.id, author: $user?.id, comment });
    comment = "";
    commenting = false;
  }

  let post: Record;
  let author: Record;
  let unsubscribeLikes: () => void;
  let unsubscribeComments: () => void;
  onMount(async () => {
    post = await pb.collection("posts").getOne($page.params.post, { expand: "author" });
    author = post.expand.author as Record;
    likes = await pb.collection("likes").getFullList(200, { filter: `post="${post.id}"` });
    comments = await pb.collection("comments").getFullList(200, { filter: `post="${post.id}"`, expand: "author" });

    unsubscribeLikes = await pb.collection("likes").subscribe("*", async (rec) => {
      if (rec.record.post != post.id) {return;}
      if (rec.action == "create") {
        likes = [...likes, rec.record];
      } else if (rec.action == "delete") {
        likes = likes.filter((l) => l.id != rec.record.id);
      }
    })

    unsubscribeComments = await pb.collection("comments").subscribe("*", async (rec) => {
      if (rec.record.post != post.id) {return;}
      if (rec.action == "create") {
        // Expand author
        let author = await pb.collection("users").getOne(rec.record.author);
        rec.record.expand = { author };
        comments = [...comments, rec.record];
      } else if (rec.action == "delete") {
        comments = comments.filter((l) => l.id != rec.record.id);
      }
    })

    loaded = true;
  })

  onDestroy(() => {
    if (unsubscribeLikes) {unsubscribeLikes()};
    if (unsubscribeComments) {unsubscribeComments()};
  })

  let liking = false;
  async function like() {
    liking = true;
    if (userLiked) {
      let like = likes.find((v) => v.user == $user?.id);
      await pb.collection("likes").delete(like!.id);
      // TODO: Revert feed publishing on delete (should we even do this?)
    } else {
      await pb.collection("likes").create({ post: post.id, user: $user?.id })
      await publishFeed({
        kind: "like",
        author: $user!.id,
        post: post.id,
      }, $user!.id);
    }
    liking = false;
  }
</script>

<svelte:head>
  {#if loaded}
  <title>{post.title} | Altruity</title>
  {/if}
</svelte:head>

{#if loaded}
<div class="text-start">
  <div class="row mb-3 align-items-center">
    <img src={pb.getFileUrl(author, author.avatar, { thumb: "50x50" })} alt={author.username} class="rounded-circle avatar col-2 img-fluid"/>
    <div class="col">
      <a href={"/user/" + author.id} class="row h2 usertext">{author.username}</a>
      <span class="text-muted row">Posted on {post.created}</span>
    </div>
  </div>
  <h1 class="display-1">{post.title}</h1>
  <p class="lead">{post.description}</p>
  {#if post.pictures}
  <div class="hstack gap-2 scroll mb-3">
    {#each post.pictures as pic}
      <img src={pb.getFileUrl(post, pic)} alt={post.title} class="image"/>
    {/each}
  </div>
  {/if}

  {#if $user}
  <div class="row justify-content-end mb-3">
    <span class="col text-center">{likes.length} Like{#if likes.length != 1}s{/if}</span>
    <button class="btn col btn-light" on:click={like} disabled={liking}>
      <i class={"bi bi-hand-thumbs-up" + (userLiked ? "-fill" : "")}></i>
    </button>
  </div>

  <form class="input-group w-100 mb-3">
    <input type="text" class="form-control" bind:value={comment} placeholder="Post a comment..."/>
    <button class="btn btn-primary" on:click|preventDefault={makeComment} disabled={commenting}>Post</button>
  </form>
  {/if}

  <div class="col mb-3">
    {#each comments as comment}
      <div class="row mb-3 align-items-center">
        <img src={pb.getFileUrl(author, asRecord(comment.expand.author).avatar, { thumb: "50x50" })} alt={author.username} class="rounded-circle comment-avatar col-2 img-fluid"/>
        <div class="col">
          <a class="row h5 usertext mb-0" href={"/user/" + asRecord(comment.expand.author).id}>{asRecord(comment.expand.author).username}</a>
          <span class="row">{comment.comment}</span>
        </div>
      </div>
    {/each}
  </div>
</div>
{:else}
<Loading/>
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

  .comment-avatar {
    width: 65px;
  }

  .usertext {
    text-decoration: none;
  }
</style>