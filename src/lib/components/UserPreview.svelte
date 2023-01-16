<script lang="ts">
  import { pb, user as loggedUser } from "$lib/pb";
  import { formatTime } from "$lib/util";
  import type { Record } from "pocketbase";
  import { onMount } from "svelte";

  export let user: Record;
  export let follower: Record | null = null;

  let followLoading = true;
  let following = false;

  onMount(async () => {
    if ($loggedUser) {
      following = await pb.collection("follows").getList(1, 1, {
        filter: `user="${$loggedUser!.id}" && following="${user.id}"`,
        $cancelKey: $loggedUser!.id + user.id
      }).then((l) => l.totalItems > 0)
      followLoading = false;
    }
  })

  async function follow() {
    followLoading = true;
    await pb.collection("follows").create({
      user: $loggedUser!.id,
      following: user.id,
    });
    following = true;
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
        <button class="btn btn-primary followbtn" disabled={followLoading || following} on:click={follow}>{following ? "Followed" : "Follow"}</button>
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