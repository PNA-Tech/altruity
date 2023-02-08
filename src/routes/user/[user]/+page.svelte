<script lang="ts">
  import { page } from "$app/stores";
  import Loading from "$lib/components/Loading.svelte";
  import PostPreview from "$lib/components/PostPreview.svelte";
  import { asRecord, pb, publishFeed, user as loggedUser } from "$lib/pb";
  import { formatTime } from "$lib/util";
  import type { Record } from "pocketbase";
  import { onMount } from "svelte";
  import { onDestroy } from "svelte";
  import type { PageData } from "./$types";


  export let data: PageData;

  let user = data.user;
  $: user = data.user;

  let loaded = false;

  let posts: Record[] = [];
  let unsubscribePosts: () => void;

  let followerUsers: string[] = [];
  let unsubscribeFollowerCount: () => void;
  let followingUsers: string[] = [];
  let unsubscribeFollowingCount: () => void;

  async function load() {
    unload();
    loaded = false;

    // Get posts
    posts = (await pb.collection("posts").getList(1, 50, { filter: `author="${user.id}"`, sort: "-created", expand: "author" })).items;
    unsubscribePosts = await pb.collection("posts").subscribe("*", async (rec) => {
      if (rec.record.author != user.id) {return;}
      if (rec.action == "create") {
        // Expand author
        let author = await pb.collection("users").getOne(rec.record.author);
        rec.record.expand = { author };
        posts = [rec.record, ...posts];
      } else if (rec.action == "delete") {
        posts = posts.filter((l) => l.id != rec.record.id);
      }
    })

    // Follower/following count
    followingUsers = (await pb.collection("users").getOne(user.id)).following;
    unsubscribeFollowerCount = await pb.collection("users").subscribe(user.id, async (rec) => {
      if (rec.action == "update") {
        followingUsers = rec.record.following;
      }
    })
    followerUsers = (await pb.collection("users").getFullList(50, { filter: `following.id ?= "${user.id}"` })).map((l) => l.id);
    unsubscribeFollowingCount = await pb.collection("users").subscribe("*", async (rec) => {
      if (!followerUsers.includes(rec.record.id) && rec.record.following.includes(user.id)) {
        followerUsers = [...followerUsers, rec.record.id];
      }
      if (followerUsers.includes(rec.record.id) && !rec.record.following.includes(user.id)) {
        followerUsers = followerUsers.filter((l) => l != rec.record.id);
      }
    })

    loaded = true;
  }

  page.subscribe((v) => {
    if (loaded && v.params.user != user.id) {
      load();
    }
  })

  onMount(load)

  let followLoading = false;
  async function follow() {
    followLoading = true;
    if (followerUsers.includes($loggedUser!.id)) {
      await pb.collection("users").update($loggedUser!.id, { following: $loggedUser!.following.filter((l: string) => l != user.id) })
    } else {
      await pb.collection("users").update($loggedUser!.id, { following: [...$loggedUser!.following, user.id] })
      publishFeed({
        kind: "follow",
        author: $loggedUser!.id,
        user: user.id,
      }, $loggedUser!.id)
    }
    followLoading = false;
  }

  function unload() {
    if (unsubscribePosts) {unsubscribePosts()};
    if (unsubscribeFollowerCount) {unsubscribeFollowerCount()};
    if (unsubscribeFollowingCount) {unsubscribeFollowingCount()};
  }

  onDestroy(unload);
</script>

<svelte:head>
  <title>{user.username} | Altruity</title>
</svelte:head>

<div class="row mb-3 align-items-center">
  <img src={pb.getFileUrl(user, user.avatar, { thumb: "128x128" })} alt={user.username} class="rounded-circle avatar col-3 img-fluid avatar"/>
  <div class="col">
    <h1 class="row">{user.username}</h1>
    <span class="text-muted row">Joined {formatTime(user.created)}</span>
  </div>
</div>

<div class="row mb-3">
  <div class="row col">
    <div class="col-6">Followers</div>
    <div class="col-6">Following</div>
    <div class="col-6 text-muted">{followerUsers.length}</div>
    <div class="col-6 text-muted">{followingUsers.length}</div>
  </div>
  {#if $loggedUser && $loggedUser.id != user.id}
  <button class="col-3 btn btn-primary me-2" disabled={followLoading} on:click={follow}>{followerUsers.includes(asRecord($loggedUser).id) ? "Unfollow" : "Follow"}</button>
  {:else if $loggedUser && $loggedUser.id == user.id}
  <a class="col-3 btn btn-outline-primary me-2" href="/settings">
    <div class="h-100 lgbtn">
      <span class="d-flex"><i class="bi bi-pencil-square me-2"></i>Edit</span>
    </div>
  </a>
  {/if}
</div>

{#if user.about && user.about.length > 0}
<p class="lead mb-3">
  {user.about}
</p>
{/if}

{#if user.kind == "nonprofit"}
<div class="row mb-3 align-items-center">
  <div class="d-flex align-items-center">
    <a class="btn btn-primary mr-2" target="_blank" rel="noreferrer" href={user.donate} style="width: 30%; height:80%">
      Donate 
    </a>
    <!-- Ignore error message(acts as space to fill up gap) -->
    <a style="padding-left: 32%;"></a>
    <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="currentColor" class="bi bi-tags" viewBox="0 1 16 16">
      <path d="M3 2v4.586l7 7L14.586 9l-7-7H3zM2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586V2z"/>
      <path d="M5.5 5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm0 1a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM1 7.086a1 1 0 0 0 .293.707L8.75 15.25l-.043.043a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 0 7.586V3a1 1 0 0 1 1-1v5.086z"/>
    </svg>
    <h5 style="font-size: large;padding-left:0.3%" id="user-topic">{user.topic}</h5>
  </div>
</div>
{/if}

<h1>Recent Activity</h1>
{#each posts as post}
  <PostPreview post={post}></PostPreview>
{/each}

{#if !loaded}
<Loading></Loading>
{/if}

<style>
  .avatar {
    max-width: 100px;
  }

  .lgbtn {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  #user-topic {
    font-size: medium;
  }
  i {
    font-size: 1.2rem;
  }
</style>