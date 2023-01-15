<svelte:head>
  <title>Feed | Altruity</title>
</svelte:head>

<!--display all posts-->
<script lang="ts">
  import { page } from "$app/stores";
  import { pb, user } from "$lib/pb";
  import { onMount, onDestroy } from "svelte";

  let loaded = false;

  let posts: Record[] = [];
  let unsubscribe: () => void;
  onMount(async () => {
    posts = await pb.collection("posts").getFullList(200, { expand: "author" });
    console.log(posts);

    unsubscribe = await pb.collection("posts").subscribe("*", async (rec) => {
      if (rec.action == "create") {
        posts = [rec.record, ...posts];
      } else if (rec.action == "delete") {
        posts = posts.filter((p) => p.id != rec.record.id);
      }
    })

    loaded = true;
  })

  onDestroy(() => {
    if (unsubscribe) {unsubscribe()};
  })
</script>

{#if loaded && posts.length > 0}
  {#each posts as post}
    <div class="card mb-3">
      <div class="card-body">
        <h5 class="card-title
        "><a href="/post/{post.id}">{post.title}</a></h5>
        <p class="card-text">{post.description}</p>
        <p class="card-text"><small class="text-muted">Posted by {post.expand.author.username} on {post.created}</small></p>
      </div>
    </div>
  {/each}
{:else}
   <p>No posts found</p>
{/if}
