<script lang="ts">
  import { pb } from "$lib/pb";

  let email: string;
  let password: string;

  let snup = false;
  let avatar: FileList;
  let username = "";
  let kind = "user";
  let donate = "";
  let topic = "";
  let charity = "";
  let company = ""; // TODO: Make autocomplete on the input

  let loading = false;

  async function login() {
    loading = true;
    if (snup) {
      let data = new FormData();
      data.append("email", email);
      data.append("password", password);
      data.append("passwordConfirm", password);
      data.append("username", username);
      data.append("kind", kind);
      data.append("avatar", avatar[0]);
      if (kind == "charity") {
        data.append("donate", donate);
        data.append("topic", topic);
        data.append("charity", charity);
      }
      if (kind == "company") {
        data.append("company", company);
      }
      
      await pb.collection("users").create(data);
      await pb.collection("users").authWithPassword(email, password);
    } else {
      await pb.collection("users").authWithPassword(email, password);
    }
    loading = false;
  }
</script>
<br><br><br><br>
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
      <input type="email" class="form-control" id="emailInput" placeholder="example@example.com" bind:value={email}>
    </div>
    <div class="mb-3">
      <label for="passwordInput" class="form-label">Password</label>
      <input type="password" class="form-control" id="passwordInput" placeholder="Password" bind:value={password}>
    </div>

    {#if snup}
    <div class="mb-3">
      <label for="nameInput" class="form-label">Username</label>
      <input type="text" class="form-control" id="nameInput" placeholder="CoolUser123" bind:value={username}>
    </div>

    <div class="mb-3">
      <label for="avatarInput" class="form-label">Avatar</label>
      <input type="file" class="form-control" id="avatarInput" bind:files={avatar} accept="image/jpg, image/jpeg, image/png">
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
      <input type="url" class="form-control" id="donateInput" placeholder="Donation website URL" bind:value={donate}>
    </div>

    <div class="mb-3">
      <label for="topicInput" class="form-label">Topic</label>
      <input type="text" class="form-control" id="topicInput" placeholder="e.g. Crayons" bind:value={topic}>
    </div>

    <div class="mb-3">
      <label for="charityInput" class="form-label">Charity Name</label>
      <input type="text" class="form-control" id="charityInput" placeholder="e.g. Good for the World" bind:value={charity}>
    </div>
    {/if}
    {/if}

    {#if kind == "company"}
    <div class="mb-3">
      <label for="companyInput" class="form-label">Company Name</label>
      <input type="text" class="form-control" id="companyInput" placeholder="e.g. Altruity" bind:value={company}>
    </div>
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