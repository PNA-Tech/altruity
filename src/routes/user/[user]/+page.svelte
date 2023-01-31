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
<div class="row mb-3">
  <a class="col btn btn-primary ms-2 btn-lg" target="_blank" rel="noreferrer" href={user.donate}>
    <div class="h-100 lgbtn">
      <span class="d-flex">Donate</span>
    </div>
  </a>
  <div class="row col">
    <div class="col-12">Topic</div>
    <div class="col-12 text-muted">{user.topic}</div>
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
</style>