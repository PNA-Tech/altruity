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
  <title>Create Post | Altruity</title>
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