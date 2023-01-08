<script lang="ts">
  import { page } from "$app/stores";
</script>
  
<nav class="navbar navbar-expand-lg bg-body-secondary">
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
          <a class="nav-link" class:active={$page.url.pathname == "/find"} href="/find">Find Charities</a>
        </li>
      </ul>
      <button class="btn btn-outline-secondary"><i class="bi bi-plus"></i> New Post</button>
    </div>
  </div>
</nav>

<div class="container text-center mt-2">
  <slot></slot>
</div>

<style>
  .nav-link {
    pointer-events: auto;
  }
</style>