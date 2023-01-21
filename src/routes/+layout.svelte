<script lang="ts">
  import { page } from "$app/stores";
  import Login from "$lib/components/Login.svelte";
    import ThemePicker from "$lib/components/ThemePicker.svelte";
  import { asRecord, pb, user } from "$lib/pb";
  import type { Record } from "pocketbase";
  import { onMount } from "svelte";

  let login = false;

  const loginPages = ["/", "/new", "/settings"];

  onMount(() => {
    if ($user == null && loginPages.includes($page.url.pathname)) {
      login = true;
    }
  })

  $: if (loginPages.includes($page.url.pathname) && $user == null) {
    login = true;
  }
  $: if ($user && login) {
    login = false;
  }

  function logout() {
    pb.authStore.clear();
  }
</script>

{#if !login}
<nav class="navbar navbar-expand-lg bg-body-secondary sticky-top">
  <div class="container-fluid">
    <a class="navbar-brand" href="/">
      <img src="/favicon.png" width="30" height="30" class="d-inline-block align-top" alt="">
      Altruity
    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a class="nav-link" class:active={$page.url.pathname == "/about"} href="/about">About</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" class:active={$page.url.pathname == "/explore"} href="/explore">Explore</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" class:active={$page.url.pathname == "/help"} href="/help">Help</a>
        </li>
      </ul>

      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link" class:active={$page.url.pathname == "/new"} href="/new" style="padding-top: 19.2%;"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" class="bi bi-plus-square" viewBox="0 0 16 16">
            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
          </svg></a>
        </li> 
        {#if $user}
        <li class="nav-item dropdown">
          <button class="btn nav-link dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
            <img src={pb.getFileUrl(asRecord($user), $user?.avatar, { thumb: "128x128" })} alt={$user?.username} style="width: 30px; height: 30px; margin-right: 3px" class="rounded-circle mr-1"/>
            {$user?.username}
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item" href={`/user/${$user?.id}`}>My Profile</a></li>
            <li><a class="dropdown-item" href="/settings">Settings</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><button class="dropdown-item" on:click={logout}>Logout</button></li>
          </ul>
        </li>
        {:else}
        <button class="btn nav-link" on:click={() => login = true}>Login</button>
        {/if}
        <ThemePicker />
      </ul>
    </div>
  </div>
</nav>

<div class="container text-center mt-2 pb-3">
  <slot></slot>
</div>
{:else}
  <Login></Login>
{/if}

<style>
  .nav-link {
    pointer-events: auto;
  }

  .sticky-top {
    position: sticky;
    top: 0;
  }
</style>