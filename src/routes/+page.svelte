<script lang="ts">
  import { onMount } from "svelte";
  import { initTera, renderTemplate } from "$lib/tera";
  import { downloadPlaygroundFile, openFileDialog, parseImportData } from "$lib/playground-file";

  let template = $state("Hello {{ name }}!");
  let contextJson = $state('{\n  "name": "World"\n}');
  let output = $state("");
  let error = $state("");
  let isLoading = $state(true);
  let importError = $state("");
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let importErrorTimer: ReturnType<typeof setTimeout> | null = null;

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

  function showImportError(message: string) {
    importError = message;
    if (importErrorTimer) {
      clearTimeout(importErrorTimer);
    }
    importErrorTimer = setTimeout(() => {
      importError = "";
    }, 5000);
  }

  function handleExport() {
    downloadPlaygroundFile(template, contextJson);
  }

  async function handleImport() {
    const content = await openFileDialog();
    if (!content) {
      return;
    }

    const result = parseImportData(content);
    if (!result.success) {
      showImportError(result.error);
      return;
    }

    template = result.template;
    contextJson = result.contextJson;
    doRender();
  }
</script>

{#if importError}
  <div
    class="fixed top-4 right-4 z-50 max-w-md p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg shadow-lg border border-red-300 dark:border-red-700"
  >
    <div class="flex items-center gap-2">
      <svg
        class="w-5 h-5 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <span>{importError}</span>
      <button
        onclick={() => (importError = "")}
        class="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
        aria-label="Dismiss"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
{/if}

{#if isLoading}
  <div class="text-center text-gray-500 dark:text-gray-400">Loading WASM module...</div>
{:else}
  <div class="max-w-7xl mx-auto">
    <div class="flex items-center justify-end gap-2 mb-4">
      <button
        onclick={handleImport}
        class="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
        Import
      </button>
      <button
        onclick={handleExport}
        class="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Export
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
  </div>
{/if}
