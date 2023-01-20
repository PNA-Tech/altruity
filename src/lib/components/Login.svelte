<script lang="ts">
  import { pb, type Error } from "$lib/pb";
    import type { ClientResponseError } from "pocketbase";

  let email: string;
  let password: string;

  let snup = false;
  let avatar: FileList;
  let username = "";
  let kind = "user";
  let donate = "";
  let topic = ""; // TODO: Make autocomplete on the input

  let loading = false;
  let error: Record<string, Error> = {};

  async function login() {
    loading = true;
    if (snup) {
      let data = new FormData();
      data.append("email", email);
      data.append("password", password);
      data.append("passwordConfirm", password);
      data.append("username", username);
      data.append("kind", kind);
      data.append("avatar", avatar ? avatar[0] : "");
      if (kind == "charity") {
        data.append("donate", donate);
        data.append("topic", topic);
      }

      try {
        await pb.collection("users").create(data);
      } catch (err) {
        let e = err as ClientResponseError;
        error = e.data.data;
        loading = false;
        return;
      }
      await pb.collection("users").authWithPassword(email, password);
    } else {
      try {
        await pb.collection("users").authWithPassword(email, password);
      } catch (err) {
        let e = err as ClientResponseError;
        error = e.data.data;
        if (Object.keys(error).length == 0) {
          error.email = { message: e.message, code: "" };
        }
        loading = false;
        return;
      }
  
    }
    loading = false;
  }
</script>

<svelte:head>
  <title>Login | Altruity</title>
</svelte:head>

<div class="h-100 d-flex align-items-center justify-content-center col-12">
  <form class="col-md-4 bg-body-secondary p-3 rounded">
    <ul class="nav nav-pills nav-fill mb-3">
      <li class="nav-item">
        <button class="nav-link" class:active={!snup} on:click={() => {snup = false}}>Login</button>
      </li>
      <li class="nav-item">
        <button class="nav-link" class:active={snup} on:click={() => {snup = true}}>Sign Up</button>
      </li>
    </ul>

    <div class="mb-3">
      <label for="emailInput" class="form-label">Email</label>
      <input type="email" class="form-control" class:is-invalid={error.email} id="emailInput" placeholder="example@example.com" bind:value={email}>
      {#if error.email}
      <div class="invalid-feedback">
        {error.email.message}
      </div>
      {/if}
    </div>
    <div class="mb-3">
      <label for="passwordInput" class="form-label">Password</label>
      <input type="password" class:is-invalid={error.password} class="form-control" id="passwordInput" placeholder="Password" bind:value={password}>
      {#if error.password}
      <div class="invalid-feedback">
        {error.password.message}
      </div>
      {/if}
    </div>

    {#if snup}
    <div class="mb-3">
      <label for="nameInput" class="form-label">Username</label>
      <input type="text" class="form-control" class:is-invalid={error.username} id="nameInput" placeholder="CoolUser123" bind:value={username}>
      {#if error.username}
      <div class="invalid-feedback">
        {error.username.message}
      </div>
      {/if}
    </div>

    <div class="mb-3">
      <label for="avatarInput" class="form-label">Avatar</label>
      <input type="file" class="form-control" id="avatarInput" class:is-invalid={error.avatar} bind:files={avatar} accept="image/jpg, image/jpeg, image/png">
      {#if error.avatar}
      <div class="invalid-feedback">
        {error.avatar.message}
      </div>
      {/if}
    </div>

    <div class="mb-3">
      <label for="kindInput" class="form-label">Account Kind</label>
      <select class="form-select" id="kindInput" bind:value={kind}>
        <option value="user">User</option>
        <option value="charity">Charity</option>
        <option value="company">Company</option>
      </select>
    </div>

    {#if kind == "charity"}
    <div class="mb-3">
      <label for="donateInput" class="form-label">Donation Link</label>
      <input type="url" class="form-control" id="donateInput" class:is-invalid={error.donate} placeholder="Donation website URL" bind:value={donate}>
      {#if error.donate}
      <div class="invalid-feedback">
        {error.donate.message}
      </div>
      {/if}
    </div>

    <div class="mb-3">
      <label for="topicInput" class="form-label">Topic</label>
      <input type="text" class="form-control" id="topicInput" class:is-invalid={error.topic} placeholder="e.g. Crayons" bind:value={topic}>
      {#if error.topic}
      <div class="invalid-feedback">
        {error.topic.message}
      </div>
      {/if}
    </div>
    {/if}
    {/if}

    <div class="w-100 vstack gap-2">
      <button class="btn btn-primary" type="submit" on:click|preventDefault={login} disabled={loading}>{snup ? "Sign Up" : "Log In"}</button>
    </div>
  </form>
</div>

<style>
  :global(body, html, .main) {
    height: 100%;
  }
</style>