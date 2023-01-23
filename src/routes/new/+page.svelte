<script lang="ts">
  import { goto } from "$app/navigation";
  import { pb, publishFeed, user } from "$lib/pb";
  import type { ClientResponseError, Record as Row } from "pocketbase";


  let title = "";
  let description = "";
  let pics: FileList;

  const maxFiles = 5;
  let fileInput: HTMLInputElement;

  async function onFileChange(e: any) {
    if (e.target.files.length > maxFiles) {
      alert(`You can only upload ${maxFiles} files at a time.`);
      fileInput.value = '';
    }
  }

  let loading = false;
  let error: Record<string, Error> = {};

  async function post() {
    loading = true;

    // Make post
    let postData = new FormData();
    postData.append("title", title);
    if (description.length > 0) {
      postData.append("description", description);
    }
    postData.append("author", $user!.id);
    if (pics) {
      for (let pic of pics) {
        postData.append("pictures", pic);
      }
    }

    let post: Row;
    try {
      post = await pb.collection("posts").create(postData);
    } catch (err) {
      error = (err as ClientResponseError).data.data;
      loading = false;
      return;
    }

    // Add to feed
    await publishFeed({
      kind: "post",
      post: post.id,
      author: $user!.id,
    }, $user!.id);

    loading = false;

    goto("/post/" + post.id);
  }
</script>

<svelte:head>
  <title>New Post | Altruity</title>
    <link rel="canonical" href="https://altruity.social/" />
    <meta property="og:title" content="New Post | Altruity" />
    <meta
        property="og:description"
        content="Create a new post on Altruity.
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
    <meta property="og:url" content="https://altruity.social/new" />
    <meta property="website:publisher" content="altruity.social" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:site_name" content="Altruity" />
    <meta property="og:publisher" content="altruity.social" />
    <meta property="og:author" content="altruity.social" />
    <meta property="og:oname" content="Altruity" />
    <meta property="og:publisher" content="altruity.social" />
</svelte:head>

<h1>New Post</h1>
<form>
  <input type="text" class="form-control form-control-lg mb-3" placeholder="Title" bind:value={title} class:is-invalid={error.title}/>
  {#if error.title}
    <div class="invalid-feedback">
      {error.title.message}
    </div>
  {/if}
  <div class="mb-3 text-start">
    <label for="description" class="form-label">Description</label>
    <textarea class="form-control" rows="3" placeholder="Describe the event..." id="description" bind:value={description} class:is-invalid={error.description}></textarea>
    {#if error.description}
      <div class="invalid-feedback">
        {error.description.message}
      </div>
    {/if}
  </div>
  <div class="mb-3 text-start">
    <label for="pictures" class="form-label">Upload Pictures</label>
    <input class="form-control" type="file" id="pictures" bind:files={pics} accept="image/jpg, image/jpeg, image/png" multiple on:change={onFileChange} bind:this={fileInput} class:is-invalid={error.pictures}/>
    {#if error.pictures}
      <div class="invalid-feedback">
        {error.pictures.message}
      </div>
    {/if}
  </div>
  {#if pics && pics.length > 0}
    <div class="hstack gap-3 mb-3 justify-content-center list">
      {#each pics as pic}
      <img src={URL.createObjectURL(pic)} class="image" alt="Uploaded file">
      {/each}
    </div>
  {/if}
  <button type="submit" class="btn btn-primary btn-lg w-100" disabled={loading} on:click|preventDefault={post}>Post</button>
</form>

<style>
  .image {
    height: 30vh;
    width: auto;
  }

  .list {
    overflow: scroll;
  }
</style>