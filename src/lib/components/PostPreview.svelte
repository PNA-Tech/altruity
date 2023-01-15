<script lang="ts">
  import type { Record } from "pocketbase";


  export let post: Record;
  export let liker: Record | null = null; // For <user> likes this message

  let author: Record;
  $: author = (post.expand as Record).author;
</script>

{post.title}