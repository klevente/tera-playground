<script lang="ts">
  import { onMount } from "svelte";
  import { initTera, renderTemplate } from "$lib/tera";

  type Theme = "light" | "dark" | "system";

  let template = $state("Hello {{ name }}!");
  let contextJson = $state('{\n  "name": "World"\n}');
  let output = $state("");
  let error = $state("");
  let isLoading = $state(true);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let theme = $state<Theme>("system");
  let systemDark = $state(false);

  const isDark = $derived(theme === "dark" || (theme === "system" && systemDark));

  onMount(async () => {
    // Load saved theme preference
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved && ["light", "dark", "system"].includes(saved)) {
      theme = saved;
    }

    // Detect system preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    systemDark = mediaQuery.matches;
    mediaQuery.addEventListener("change", (e) => {
      systemDark = e.matches;
    });

    // Load WASM
    try {
      await initTera();
      isLoading = false;
      doRender();
    } catch (e) {
      error = `Failed to load WASM module: ${e}`;
      isLoading = false;
    }
  });

  function setTheme(newTheme: Theme) {
    theme = newTheme;
    localStorage.setItem("theme", newTheme);
  }

  function doRender() {
    try {
      JSON.parse(contextJson)
    } catch (e) {
      output = "";
      if (e instanceof SyntaxError) {
        error = e.message;
      } else {
        error = "Unknown error while parsing JSON";
      }
      return;
    }

    const result = renderTemplate(template, contextJson);
    if ("output" in result) {
      output = result.output;
      error = "";
    } else {
      output = "";
      error = result.error;
    }
  }

  function handleInput() {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      doRender();
    }, 300);
  }
</script>

<svelte:head>
  <title>Tera Playground</title>
</svelte:head>

<div
  class="min-h-screen p-6 bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100"
  class:dark={isDark}
>
  <div class="flex items-center justify-between mb-6 max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold">Tera Playground</h1>
    <div class="flex items-center gap-1 p-1 rounded-lg bg-gray-200 dark:bg-gray-800">
      <button
        onclick={() => setTheme("light")}
        class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
        class:bg-white={theme === "light"}
        class:dark:bg-gray-700={theme === "light"}
        class:shadow-sm={theme === "light"}
        class:text-gray-500={theme !== "light"}
        class:dark:text-gray-400={theme !== "light"}
        aria-label="Light mode"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </button>
      <button
        onclick={() => setTheme("system")}
        class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
        class:bg-white={theme === "system"}
        class:dark:bg-gray-700={theme === "system"}
        class:shadow-sm={theme === "system"}
        class:text-gray-500={theme !== "system"}
        class:dark:text-gray-400={theme !== "system"}
        aria-label="System mode"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </button>
      <button
        onclick={() => setTheme("dark")}
        class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
        class:bg-white={theme === "dark"}
        class:dark:bg-gray-700={theme === "dark"}
        class:shadow-sm={theme === "dark"}
        class:text-gray-500={theme !== "dark"}
        class:dark:text-gray-400={theme !== "dark"}
        aria-label="Dark mode"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </button>
    </div>
  </div>

  {#if isLoading}
    <div class="text-center text-gray-500 dark:text-gray-400">Loading WASM module...</div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
      <div class="space-y-4">
        <div>
          <label
            for="template"
            class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
          >
            Template (Tera syntax)
          </label>
          <textarea
            id="template"
            bind:value={template}
            oninput={handleInput}
            class="w-full h-64 p-4 font-mono text-sm rounded-lg border resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-700"
            placeholder="Enter your Tera template..."
          ></textarea>
        </div>

        <div>
          <label
            for="context"
            class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
          >
            Context (JSON)
          </label>
          <textarea
            id="context"
            bind:value={contextJson}
            oninput={handleInput}
            class="w-full h-48 p-4 font-mono text-sm rounded-lg border resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-700"
            placeholder={'{"key": "value"}'}
          ></textarea>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Output</label
        >
        <div
          class="w-full h-[calc(100%-2rem)] min-h-96 p-4 font-mono text-sm rounded-lg border overflow-auto whitespace-pre-wrap bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-700"
          class:text-red-600={error}
          class:dark:text-red-400={error}
          class:border-red-500={error}
        >
          {#if error}
            {error}
          {:else}
            {output}
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>
