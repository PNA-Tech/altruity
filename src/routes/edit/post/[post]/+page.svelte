<script lang="ts">
  import { pb } from "$lib/pb";
  import type { ClientResponseError, Record as Row } from "pocketbase";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import Loading from "$lib/components/Loading.svelte";
  import type { Error } from "$lib/pb";
    import { goto } from "$app/navigation";

  let post: Row;
  let loaded = false;
  async function load() {
    loaded = false;
    post = await pb.collection("posts").getOne($page.params.post);
    loaded = true;
  }

  let error: Record<string, Error> = {};
  let pics: FileList;
  let editing = false;
  async function edit() {
    editing = true;

    let data = new FormData();
    data.append("title", post.title);
    data.append("description", post.description);
    if (pics && pics.length > 0) {
      for (let i = 0; i < pics.length; i++) {
        data.append("pictures", pics[i]);
      }
    }

    try {
      post = await pb.collection("posts").update(post.id, data);
    } catch (err) {
      error = (err as ClientResponseError).data.data;
      editing = false;
      return;
    }

    editing = false;
    goto("/post/" + post.id)
  }

  let deleting = false;
  async function del() {
    deleting = true;
    pb.collection("posts").delete(post.id);
    deleting = false;
    goto("/");
  }

  onMount(load);
</script>

{#if loaded}
<h1>Edit Post</h1>
<form>
  <input type="text" class="form-control form-control-lg mb-3" placeholder="Title" bind:value={post.title} class:is-invalid={error.title}/>
  {#if error.title}
    <div class="invalid-feedback">
      {error.title.message}
    </div>
  {/if}
  <div class="mb-3 text-start">
    <label for="description" class="form-label">Description</label>
    <textarea class="form-control" rows="3" placeholder="Describe the event..." id="description" bind:value={post.description} class:is-invalid={error.description}></textarea>
    {#if error.description}
      <div class="invalid-feedback">
        {error.description.message}
      </div>
    {/if}
  </div>
  <div class="mb-3 text-start">
    <label for="pictures" class="form-label">Upload Pictures</label>
    <input class="form-control" type="file" id="pictures" bind:files={pics} accept="image/jpg, image/jpeg, image/png" multiple class:is-invalid={error.pictures}/>
    {#if error.pictures}
      <div class="invalid-feedback">
        {error.pictures.message}
      </div>
    {/if}
  </div>

  <button type="submit" class="btn btn-primary btn-lg w-100 mb-2" disabled={editing} on:click|preventDefault={edit}>Save</button>
  <button class="btn btn-outline-danger btn-lg w-100" disabled={deleting} data-bs-toggle="modal" data-bs-target="#deleteModal">Delete Post</button>
</form>

<div class="modal fade" id="deleteModal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5">Confirm Delete</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        Are you sure you want to delete this post? This is not reversible.
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-danger" data-bs-dismiss="modal" on:click={del}>Delete</button>
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
      </div>
    </div>
  </div>
</div>
{:else}
<Loading></Loading>
{/if}