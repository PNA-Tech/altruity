<script lang="ts">
  import Loading from "$lib/components/Loading.svelte";
    import PostPreview from "$lib/components/PostPreview.svelte";
    import UserPreview from "$lib/components/UserPreview.svelte";
    import { pb } from "$lib/pb";
  import type { Record } from "pocketbase";
  import { onMount } from "svelte";

  let query = "";
  let user = true;
  let loaded = false;

  let users: Record[] = [];
  let posts: Record[] = [];

  async function load() {
    loaded = false;
    if (user) {
      posts = [];
      users = (await pb.collection("users").getList(1, 45, {
        ...(query != "" ? {filter: `username~"${query}"||about~"${query}"`} : {}),
        sort: "-created", // TODO: Sort by follower count instead
      })).items;
    } else {
      users = [];
      posts = (await pb.collection("posts").getList(1, 30, {
        ...(query != "" ? {filter: `title~"${query}"||description~"${query}"`} : {}),
        sort: "-created", // TODO: Sort by like count instead
        expand: "author",
      })).items;
    }
    loaded = true;
  }

  onMount(load);

  function search(userV: boolean) {
    user = userV;
    load();
  }
</script>

<svelte:head>
  <title>Altruity | Explore</title>
    <link rel="canonical" href="https://altruity.social/" />
    <meta property="og:title" content="Altruity | Explore" />
    <meta
        property="og:description"
        content="Explore users, charities and potential donors with Altruity. Search for these users and find like minded people for non-profits and explore oppurtunities.
        Altruity is accesible at https://altruity.social/
         About Altruity: Altruity is a social media platform that connects charitable organizations
        with potential donors and volunteers. With a user-friendly interface and
        powerful tools, Altruity makes it easy for charities to share their
        missions, fundraise, and connect with their communities. Whether you're a
        charity looking to spread the word about your cause or a philanthropist
        searching for ways to make a difference, Altruity has something for you.
        With features like customizable profiles, event listings, and easy-to-use
        donation buttons, Altruity streamlines the process of connecting charities
        with the resources they need to make an impact. Join the Altruity community
        today and start making a difference!"
    />
    <meta property="og:image" content="/static/favicon.png" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://altruity.social/explore" />
    <meta property="website:publisher" content="altruity.social"/>
    <meta property="og:locale" content="en_US"/>
    <meta property="og:site_name" content="Altruity"/>
    <meta property="og:publisher" content="altruity.social"/>
    <meta property="og:author" content="altruity.social"/>
    <meta property="og:oname" content="Altruity"/>
    <meta property="og:publisher" content="altruity.social"/>
</svelte:head>

<div class="input-group mb-3">
  <input type="text" class="form-control" bind:value={query} placeholder="Search...">
  <button class="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" disabled={!loaded}>
    <i class="bi bi-search"></i> Search
  </button>
  <ul class="dropdown-menu dropdown-menu-end">
    <li><button class="dropdown-item" on:click={() => {search(true)}}>Search users</button></li>
    <li><button class="dropdown-item" on:click={() => {search(false)}}>Search posts</button></li>
  </ul>
</div>

{#if loaded}
{#if user}
{#each users as user}
<UserPreview user={user}></UserPreview>
{/each}
{:else}
{#each posts as post}
<PostPreview post={post}></PostPreview>
{/each}
{/if}
{:else}
<Loading></Loading>
{/if}
