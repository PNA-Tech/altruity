<script lang="ts">
  import Loading from "$lib/components/Loading.svelte";
  import PostPreview from "$lib/components/PostPreview.svelte";
    import UserPreview from "$lib/components/UserPreview.svelte";
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
  <title>Altruity | Feed</title>
    <link rel="canonical" href="https://altruity.social/" />
    <meta property="og:title" content="Altruity | Feed" />
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

{#if feed.length == 0}
  <p class="lead">You haven't followed anyone! <a href="/explore">Explore</a> to find people for your feed!</p>
{/if}

{#each feed as item}
  {#if item.kind == "post"}
  <PostPreview post={asRecord(item.expand.post)}></PostPreview>
  {:else if item.kind == "follow"}
  <UserPreview user={asRecord(item.expand.user)} follower={asRecord(item.expand.author)}></UserPreview>
  {:else if item.kind == "like"}
  <PostPreview post={asRecord(item.expand.post)} liker={asRecord(item.expand.author)}></PostPreview>
  {:else if item.kind == "donate"}
  Donate {asRecord(item.expand.user) }
  {/if}
{/each}
{:else}
<Loading/>
{/if}
