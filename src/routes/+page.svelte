<script lang="ts">
  import { onMount } from "svelte";
  import { initTera, renderTemplate } from "$lib/tera";

  let template = $state("Hello {{ name }}!");
  let contextJson = $state('{\n  "name": "World"\n}');
  let output = $state("");
  let error = $state("");
  let isLoading = $state(true);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  onMount(async () => {
    try {
      await initTera();
      isLoading = false;
      doRender();
    } catch (e) {
      error = `Failed to load WASM module: ${e}`;
      isLoading = false;
    }
  });

  function doRender() {
    try {
      JSON.parse(contextJson);
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
      <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Output</label>
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
