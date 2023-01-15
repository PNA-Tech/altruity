<script lang="ts">
  import Loading from "$lib/components/Loading.svelte";
  import PostPreview from "$lib/components/PostPreview.svelte";
  import { asRecord, pb, user } from "$lib/pb";
  import type { Record } from "pocketbase";
  import { onMount } from "svelte";

  let feed: Record[] = [];
  let loaded = false;
  let unsubscribe: () => void;

  onMount(async () => {
    loaded = true;
    feed = (await pb.collection("feed").getList(1, 50, { 
      filter: `target="${$user!.id}"`, 
      expand: "author,user,post",
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
</script>

<svelte:head>
  <title>Feed | Altruity</title>
</svelte:head>

{#if loaded}
{#each feed as item}
  {#if item.kind == "post"}
  <PostPreview post={asRecord(item.expand.post)}></PostPreview>
  {:else if item.kind == "follow"}
  Follow {asRecord(item.expand.user) }
  {:else if item.kind == "like"}
  <PostPreview post={asRecord(item.expand.post)} liker={asRecord(item.expand.author)}></PostPreview>
  {:else if item.kind == "donate"}
  Donate {asRecord(item.expand.user) }
  {/if}
{/each}
{:else}
<Loading/>
{/if}