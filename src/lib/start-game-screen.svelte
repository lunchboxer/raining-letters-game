<script>
    import { createEventDispatcher } from "svelte";

    export let settings;
    export let startGame = () => {};

    const dispatch = createEventDispatcher();

    function handleChange() {
        dispatch("change", settings);
    }
</script>

<div class="overlay" />
<div class="modal">
    <h2>😁 Welcome!</h2>

    <div class="settings">
        <input
            id="rainbow-mode"
            type="checkbox"
            bind:checked={settings.rainbowMode}
            on:change={handleChange}
        />
        <label for="rainbow-mode">Rainbow mode</label>
        <br />
        <input
            name="playSounds"
            type="checkbox"
            bind:checked={settings.playSounds}
            on:change={handleChange}
        />
        <label for="playSounds">Sounds</label>

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
    </div>
    <br />
    <button on:click={startGame}>Start game</button>
</div>

<style>
    .settings {
        text-align: left;
        padding: 1rem;
    }
</style>
