<script lang="ts">
  import { pb, user as loggedUser } from "$lib/pb";
  import { formatTime } from "$lib/util";
  import type { Record } from "pocketbase";

  export let user: Record;
  export let follower: Record | null = null;

  let followLoading = false;
  let following = false;
  $: if ($loggedUser) {following = $loggedUser!.following.includes(user.id)};

  async function follow() {
    followLoading = true;
    // Get followers
    await pb.collection("users").update($loggedUser!.id, { following: [...$loggedUser!.following, user.id] });
    followLoading = false;
  }
</script>

<div class="card mb-3">
  {#if follower}
  <div class="card-header">
    Followed by {follower.username}
  </div>
  {/if}
  <div class="card-body">
    <div class="text-start row justify-content-center">
      <img src={pb.getFileUrl(user, user.avatar, { thumb: "128x128" })} class="avatar rounded-circle img-fluid col-2" alt={user.username}/>
      <div class="col">
        <a class="card-title h5 linktitle row" href={"/user/" + user.id}>{user.username}</a>
        <p class="card-subtitle mb-2 text-muted row">Joined {formatTime(user.created)}</p>
      </div>
      <div class="col flex-grow"></div>
      {#if $loggedUser && $loggedUser.id != user.id}
      <div class="col">
        <button class="btn btn-success followbtn" disabled={followLoading || following} on:click={follow}>{following ? "Followed" : "Follow"}</button>
      </div>
      {/if}
    </div>
    <p class="card-text">{user.about}</p>
  </div>
</div>


<style>
  .linktitle {
    text-decoration: none;
  }

  .avatar {
    width: auto;
    height: 100%;
    max-height: 50px;
  }

  .followbtn {
    height: 90%;
    width: 100%;
  }
</style>