<script lang="ts">
    import { page } from "$app/stores";
  </script>
  
  <nav class="navbar navbar-expand-sm py-0" style="background-color: #0e1525;">
    <div class="container-fluid">
      <a class="navbar-brand" href="/" style="color: #f5f9fc;">
        Altruity
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNavDropdown">
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link" class:active={$page.routeId == "explore"} href="/explore" style="color: #f5f9fc;">Explore</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" class:active={$page.routeId == "volunteer"} href="/volunteer" style="color: #f5f9fc;">Volunteer</a>
          </li>
        </ul>
        <div class="collapse navbar-collapse justify-content-end">
        </div>
      </div>
    </div>
  </nav>
  
  <slot></slot>
  
  <style>
    .nav-link {
      pointer-events: auto;
    }
  </style>