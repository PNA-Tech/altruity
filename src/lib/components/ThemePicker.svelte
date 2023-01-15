<script lang="ts">
  import { onMount } from "svelte";

  const themes = ["light", "dark", "auto"];
  const themeIcons: Record<string, string> = {
    "light": "brightness-high-fill",
    "dark": "moon-stars-fill",
    "auto": "circle-half",
  }

  let theme = "auto";

  function switchTheme(newTheme: string) {
    theme = newTheme;
    localStorage.setItem("theme", newTheme);
    updateColorMode();
  }

  function updateColorMode() {
    switch (theme) {
      case "light":
        document.documentElement.setAttribute("data-bs-theme", "light");
        break;

      case "dark":
        document.documentElement.setAttribute("data-bs-theme", "dark");
        break;

      case "auto":
        document.documentElement.setAttribute("data-bs-theme", window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light");
        break;
    }
  }
  
  onMount(() => {
    theme = localStorage.getItem("theme") ?? "auto";
    updateColorMode();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      updateColorMode();
    })
  })
</script>

<li class="nav-item dropdown">
  <span class="nav-link dropdown-toggle cursor" data-bs-toggle="dropdown"><i class={"bi bi-" + themeIcons[theme]}></i></span>
  <ul class="dropdown-menu dropdown-menu-end">
    {#each themes as t}
      <button class="dropdown-item cursor" on:click={() => {switchTheme(t)}}>
        <i class={"bi bi-" + themeIcons[t]}></i> <span class="capitalize">{t}</span>
      </button>
    {/each}
  </ul>
</li>

<style>
  .capitalize {
    text-transform: capitalize;
  }
</style>