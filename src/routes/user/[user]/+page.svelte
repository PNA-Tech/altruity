<script lang="ts">
  import { page } from "$app/stores";
  import Loading from "$lib/components/Loading.svelte";
  import PostPreview from "$lib/components/PostPreview.svelte";
  import { asRecord, pb, publishFeed, user as loggedUser } from "$lib/pb";
  import { formatTime } from "$lib/util";
  import type { Record } from "pocketbase";
  import { onMount } from "svelte";
  import { onDestroy } from "svelte";


  let user: Record;
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
  {#if loaded}
  <title>{user.username} | Altruity</title>
  {/if}
    <link rel="canonical" href="https://altruity.social/" />
    <meta
        property="og:description"
        content=" About Altruity: Altruity is a social media platform that connects charitable organizations
        with potential donors and volunteers. With a user-friendly interface and
        powerful tools, Altruity makes it easy for charities to share their
        missions, fundraise, and connect with their communities. Whether you're a
        charity looking to spread the word about your cause or a philanthropist
        searching for ways to make a difference, Altruity has something for you.
        With features like customizable profiles, event listings, and easy-to-use
        donation buttons, Altruity streamlines the process of connecting charities
        with the resources they need to make an impact. Join the Altruity community
        today and start making a difference!
        Altruity is accesible at https://altruity.social/"
    />
    <meta property="og:image" content="/static/favicon.png" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://altruity.social/" />
    <meta property="website:publisher" content="altruity.social" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:site_name" content="Altruity" />
    <meta property="og:publisher" content="altruity.social" />
    <meta property="og:author" content="altruity.social" />
    <meta property="og:oname" content="Altruity" />
    <meta property="og:publisher" content="altruity.social" />
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
    <div class="col-6 text-muted">{followerUsers.length}</div>
    <div class="col-6 text-muted">{followingUsers.length}</div>
  </div>
  {#if !$loggedUser || $loggedUser.id != user.id}
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