<script lang="ts">
  import { pb, user } from "$lib/pb";

  let username = $user!.username;
  let avatar: FileList;
  let about = $user!.about ?? "";
  let donationUrl = $user!.donate ?? "";
  let topic = $user!.topic ?? "";

  let loading = false;
  async function edit() {
    loading = true;

    let data = new FormData();
    data.append("username", username);
    if (about != "") {
      data.append("about", about);
    }
    if ($user!.kind == "charity") {
      data.append("donate", donationUrl);
      data.append("topic", topic);
    }
    if (avatar && avatar.length > 0) {
      data.append("avatar", avatar[0]);
    }
    await pb.collection("users").update($user!.id, data);

    loading = false;
  }
</script>

<svelte:head>
  <title>Settings | Altruity</title>
</svelte:head>

<h1>Settings</h1>
<form>
  <div class="mb-3 text-start">
    <label for="email" class="form-label">Email</label>
    <input class="form-control" type="text" id="email" readonly value={$user?.email} placeholder="example@example.com"/>
  </div>
  <div class="mb-3 text-start">
    <label for="username" class="form-label">Username</label>
    <input class="form-control" type="text" id="username" bind:value={username} placeholder="CoolUser123"/>
  </div>
  <div class="mb-3 text-start">
    <label for="avatar" class="form-label">Avatar</label>
    <input type="file" class="form-control" id="avatar" bind:files={avatar} accept="image/jpg, image/jpeg, image/png" />
  </div>
  <div class="mb-3 text-start">
    <label for="about" class="form-label">About</label>
    <textarea class="form-control" id="about" bind:value={about} rows="3" placeholder="I love philanthropy!"></textarea>
  </div>
  {#if $user?.kind == "charity"}
  <div class="mb-3 text-start">
    <label for="donation" class="form-label">Donation Link</label>
    <input type="url" class="form-control" id="donation" bind:value={donationUrl} placeholder="Donation website URL" />
  </div>
  <div class="mb-3 text-start">
    <label for="donation" class="form-label">Topic</label>
    <input type="topic" class="form-control" id="topic" bind:value={topic} placeholder="e.g. Crayons" />
  </div>
  {/if}
  <button type="submit" class="btn btn-primary btn-lg w-100" disabled={loading} on:click|preventDefault={edit}>Save</button>
</form>