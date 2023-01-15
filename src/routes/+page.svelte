<script lang="ts">
  import Loading from "$lib/components/Loading.svelte";
  import PostPreview from "$lib/components/PostPreview.svelte";
  import { asRecord, pb, user } from "$lib/pb";
    import { formatTime } from "$lib/util";
  import type { Record } from "pocketbase";
  import { onMount } from "svelte";
  import { onDestroy } from "svelte";

  let feed: Record[] = [];
  let loaded = false;
  let unsubscribe: () => void;

  onMount(async () => {
    loaded = true;
    feed = (await pb.collection("feed").getList(1, 50, { 
      filter: `target="${$user!.id}"`, 
      expand: "author,user,post,post.author",
      sort: "-created"
    })).items;

    unsubscribe = await pb.collection("feed").subscribe("*", async (rec) => {
      if (rec.record.target != $user!.id) {return;}
      if (rec.action == "create") {
        // Expand author
        let author = await pb.collection("users").getOne(rec.record.author);
        rec.record.expand = { author };

        // Expand based on val
        if (rec.record.user) {
          let user = await pb.collection("users").getOne(rec.record.user);
          rec.record.expand = { ...rec.record.expand, user };
        }
        if (rec.record.post) {
          let post = await pb.collection("posts").getOne(rec.record.post);
          rec.record.expand = { ...rec.record.expand, post };
        }

        // Save
        feed = [rec.record, ...feed];
      } else if (rec.action == "delete") {
        feed = feed.filter((l) => l.id != rec.record.id);
      }
    })
  })

  onDestroy(() => {
    if (unsubscribe) {unsubscribe()}
  })
</script>

<svelte:head>
  <title>Feed | Altruity</title>
</svelte:head>

{#if loaded}
{#each feed as item}
  {#if item.kind == "post"}
  <PostPreview post={asRecord(item.expand.post)}></PostPreview>
  {:else if item.kind == "follow"}
  <div class="card mb-3">
    <div class="card-header">
      Followed by {asRecord(item.expand.author).username}
    </div>
    <div class="card-body">
      <div class="text-start row justify-content-center">
        <img src={pb.getFileUrl(asRecord(item.expand.user), asRecord(item.expand.user).avatar, { thumb: "128x128" })} class="avatar rounded-circle img-fluid col-2" alt={asRecord(item.expand.user).username}/>
        <div class="col">
          <a class="card-title h5 linktitle row" href={"/user/" + item.user}>{asRecord(item.expand.user).username}</a>
          <p class="card-subtitle mb-2 text-muted row">Joined {formatTime(asRecord(item.expand.user).created)}</p>
        </div>
      </div>
      <p class="card-text">{asRecord(item.expand.user).about}</p>
    </div>
  </div>
  {:else if item.kind == "like"}
  <PostPreview post={asRecord(item.expand.post)} liker={asRecord(item.expand.author)}></PostPreview>
  {:else if item.kind == "donate"}
  Donate {asRecord(item.expand.user) }
  {/if}
{/each}
{:else}
<Loading/>
{/if}

<style>
  .linktitle {
    text-decoration: none;
  }

  .avatar {
    width: auto;
    height: 100%;
    max-height: 50px;
  }
</style>