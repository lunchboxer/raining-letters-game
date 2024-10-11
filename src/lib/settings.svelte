<script>
    import { createEventDispatcher } from "svelte";

    export let settings;
    export let toggleSettingsOpen;

    const dispatch = createEventDispatcher();

    function handleChange() {
        dispatch("change", settings);
    }
</script>

<div class="overlay"></div>
<div class="modal settings">
    <h2>Settings</h2>

    <input
        id="rainbow-mode"
        type="checkbox"
        bind:checked={settings.rainbowMode}
        on:change={handleChange}
    />
    <label for="rainbow-mode">Rainbow mode</label>

    <h3>Word Sets</h3>

    <input
        name="round1"
        type="checkbox"
        bind:checked={settings.wordSets.round1}
        on:change={handleChange}
    />
    <label for="round1">round 1</label>

    <br />
    <input
        name="round2"
        type="checkbox"
        bind:checked={settings.wordSets.round2}
        on:change={handleChange}
    />
    <label for="round1">round 2</label>
    <br />

    <input
        name="round3"
        type="checkbox"
        bind:checked={settings.wordSets.round3}
        on:change={handleChange}
    />
    <label for="round1">round 3</label>
    <br />
    <button on:click={toggleSettingsOpen}>Close</button>
</div>

<style>
    button {
        margin: 2rem 0 1rem;
    }
    .settings {
        text-align: left;
    }
</style>
