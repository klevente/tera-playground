<script lang="ts">
  import "../app.css";
  import { browser } from "$app/environment";
  import { onMount, type Snippet } from "svelte";

  type Theme = "light" | "dark" | "system";

  let { children }: { children: Snippet } = $props();

  // Initialize from localStorage immediately on client to avoid flash
  function getInitialTheme(): Theme {
    if (!browser) return "system";
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark" || saved === "system") return saved;
    return "system";
  }

  let theme = $state<Theme>(getInitialTheme());
  let systemDark = $state(
    browser ? window.matchMedia("(prefers-color-scheme: dark)").matches : false
  );
  let mounted = $state(false);

  const isDark = $derived(theme === "dark" || (theme === "system" && systemDark));

  // Apply dark class to document when isDark changes
  $effect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", isDark);
    }
  });

  onMount(() => {
    mounted = true;

    // Listen for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", (e) => {
      systemDark = e.matches;
    });
  });

  function setTheme(newTheme: Theme) {
    theme = newTheme;
    localStorage.setItem("theme", newTheme);
  }
</script>

{#snippet themeButton(value: Theme, label: string, iconPath: string)}
  {@const isActive = mounted && theme === value}
  <button
    onclick={() => setTheme(value)}
    class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
    class:bg-white={isActive}
    class:dark:bg-gray-700={isActive}
    class:shadow-sm={isActive}
    class:text-gray-500={!isActive}
    class:dark:text-gray-400={!isActive}
    aria-label={label}
  >
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d={iconPath} />
    </svg>
  </button>
{/snippet}

<svelte:head>
  <title>Tera Playground</title>
</svelte:head>

<div class="min-h-screen p-6 bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
  <div class="flex items-center justify-between mb-6 max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold">Tera Playground</h1>
    <div class="flex items-center gap-1 p-1 rounded-lg bg-gray-200 dark:bg-gray-800">
      {@render themeButton(
        "light",
        "Light mode",
        "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      )}
      {@render themeButton(
        "system",
        "System mode",
        "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      )}
      {@render themeButton(
        "dark",
        "Dark mode",
        "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      )}
    </div>
  </div>

  {@render children()}
</div>
