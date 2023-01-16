<script lang="ts">
  import { page } from "$app/stores";
  import Loading from "$lib/components/Loading.svelte";
  import PostPreview from "$lib/components/PostPreview.svelte";
  import { pb, publishFeed, user as loggedUser } from "$lib/pb";
  import { formatTime } from "$lib/util";
  import type { Record } from "pocketbase";
  import { onMount } from "svelte";
  import { onDestroy } from "svelte";


  let user: Record;
  let loaded = false;

  let posts: Record[] = [];
  let unsubscribePosts: () => void;

  let followerCount: number;
  let unsubscribeFollowerCount: () => void;
  let followingCount: number;
  let unsubscribeFollowingCount: () => void;
  let following: string | null;

  async function load() {
    unload();
    loaded = false;

    user = await pb.collection("users").getOne($page.params.user);

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
    followerCount = (await pb.collection("follows").getList(1, 0, { filter: `following="${user.id}"` })).totalItems;
    unsubscribeFollowerCount = await pb.collection("follows").subscribe("*", async (rec) => {
      if (rec.record.following != user.id) {return;}
      if (rec.action == "create") {
        followerCount++;
        if ($loggedUser && rec.record.user == $loggedUser.id) {
          following = rec.record.id;
        }
      } else if (rec.action == "delete") {
        followerCount--;
        if (following == rec.record.id) {
          following = null;
        }
      }
    })
    followingCount = (await pb.collection("follows").getList(1, 0, { filter: `user="${user.id}"` })).totalItems;
    unsubscribeFollowingCount = await pb.collection("follows").subscribe("*", async (rec) => {
      if (rec.record.user != user.id) {return;}
      if (rec.action == "create") {
        followingCount++;
      } else if (rec.action == "delete") {
        followingCount--;
      }
    })

    // You are following?
    if ($loggedUser) {
      let vals = (await pb.collection("follows").getList(1, 1, { filter: `user="${$loggedUser.id}" && following="${user.id}"` })).items;
      if (vals.length > 0) {following = vals[0].id;}
    }

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
    if (following) {
      await pb.collection("follows").delete(following)
    } else {
      await pb.collection("follows").create({ user: $loggedUser!.id, following: user.id })
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
  {#if loaded}
  <title>{user.username} | Altruity</title>
  {/if}
</svelte:head>

{#if loaded}
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
    <div class="col-6 text-muted">{followerCount}</div>
    <div class="col-6 text-muted">{followingCount}</div>
  </div>
  {#if !$loggedUser || $loggedUser.id != user.id}
  <button class="col-3 btn btn-primary me-2" disabled={followLoading} on:click={follow}>{following ? "Unfollow" : "Follow"}</button>
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

{#if user.kind == "charity"}
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
{:else}
<Loading/>
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