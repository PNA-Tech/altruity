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
  <title>Explore | Altruity</title>
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
