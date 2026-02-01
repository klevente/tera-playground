<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { initTera, renderTemplate, type TeraVersion } from "$lib/tera";
  import { downloadPlaygroundFile, openFileDialog, parseImportData } from "$lib/playground-file";
  import { emojify } from "$lib/emoji";

  let template = $state("Hello {{ name }}!");
  let contextJson = $state('{\n  "name": "World"\n}');
  let output = $state("");
  let error = $state("");
  let isLoading = $state(true);
  let importError = $state("");
  let autoFormatOnBlur = $state(true);
  let renderEmojis = $state(false);
  let teraVersion = $state<TeraVersion>("v1");
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

    const result = renderTemplate(template, contextJson, teraVersion);
    if ("output" in result) {
      output = result.output;
      error = "";
    } else {
      output = "";
      error = result.error;
    }
  }

  function formatJson() {
    try {
      const parsed = JSON.parse(contextJson);
      contextJson = JSON.stringify(parsed, null, 2);
      doRender();
    } catch {
      // JSON is invalid - doRender will show the error
      doRender();
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
        class="w-5 h-5 shrink-0"
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
  <div class="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <div class="relative">
      <div
        class="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 dark:border-t-blue-400 animate-spin"
      ></div>
    </div>
    <div class="text-center">
      <p class="text-lg font-medium text-gray-700 dark:text-gray-300">Loading Tera</p>
      <p class="text-sm text-gray-500 dark:text-gray-400">Initializing WASM module...</p>
    </div>
  </div>
{:else}
  <div class="max-w-7xl mx-auto" in:fade={{ duration: 300 }}>
    <div class="flex items-center justify-between gap-2 mb-4">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Tera Version:</span>
        <div class="flex rounded-md overflow-hidden border border-gray-300 dark:border-gray-600">
          <button
            onclick={() => {
              teraVersion = "v1";
              doRender();
            }}
            class="px-3 py-1 text-sm font-medium transition-colors"
            class:bg-blue-500={teraVersion === "v1"}
            class:text-white={teraVersion === "v1"}
            class:bg-gray-100={teraVersion !== "v1"}
            class:dark:bg-gray-800={teraVersion !== "v1"}
            class:text-gray-700={teraVersion !== "v1"}
            class:dark:text-gray-300={teraVersion !== "v1"}
            class:hover:bg-gray-200={teraVersion !== "v1"}
            class:dark:hover:bg-gray-700={teraVersion !== "v1"}
          >
            v1
          </button>
          <button
            onclick={() => {
              teraVersion = "v2";
              doRender();
            }}
            class="px-3 py-1 text-sm font-medium transition-colors border-l border-gray-300 dark:border-gray-600"
            class:bg-blue-500={teraVersion === "v2"}
            class:text-white={teraVersion === "v2"}
            class:bg-gray-100={teraVersion !== "v2"}
            class:dark:bg-gray-800={teraVersion !== "v2"}
            class:text-gray-700={teraVersion !== "v2"}
            class:dark:text-gray-300={teraVersion !== "v2"}
            class:hover:bg-gray-200={teraVersion !== "v2"}
            class:dark:hover:bg-gray-700={teraVersion !== "v2"}
          >
            v2
          </button>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          onclick={handleImport}
          class="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 active:bg-gray-400 dark:active:bg-gray-600"
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
          class="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 active:bg-gray-400 dark:active:bg-gray-600"
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
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <div>
          <label
            for="template"
            class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
          >
            Template ({#if teraVersion === "v1"}<a
                class="text-blue-500"
                href="https://keats.github.io/tera/"
                target="_blank">Tera v1 syntax</a
              >{:else}<a
                class="text-blue-500"
                href="https://github.com/Keats/tera2"
                target="_blank">Tera v2 syntax</a
              >{/if})
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
          <div class="flex items-center justify-between mb-2">
            <label for="context" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Context (JSON)
            </label>
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                <input
                  type="checkbox"
                  bind:checked={autoFormatOnBlur}
                  onchange={() => autoFormatOnBlur && formatJson()}
                  class="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                />
                Auto-format
              </label>
              <button
                onclick={formatJson}
                class="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 active:bg-gray-400 dark:active:bg-gray-600"
              >
                <svg
                  class="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
                Format
              </button>
            </div>
          </div>
          <textarea
            id="context"
            bind:value={contextJson}
            oninput={handleInput}
            onblur={() => autoFormatOnBlur && formatJson()}
            class="w-full h-48 p-4 font-mono text-sm rounded-lg border resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-700"
            placeholder={'{"key": "value"}'}
          ></textarea>
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Output</span>
          <label class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              bind:checked={renderEmojis}
              class="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
            />
            Render emojis
          </label>
        </div>
        <div
          class="w-full h-[calc(100%-2rem)] min-h-96 p-4 font-mono text-sm rounded-lg border overflow-auto whitespace-pre-wrap bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-700"
          class:text-red-600={error}
          class:dark:text-red-400={error}
          class:border-red-500={error}
        >
          {#if error}
            {error}
          {:else}
            {renderEmojis ? emojify(output) : output}
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
