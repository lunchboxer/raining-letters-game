<script>
    export let startGame = () => {};
</script>

<div class="start-game-screen">
    <h2>😁 Welcome!</h2>
    <button on:click={startGame}>Start game</button>
</div>

<style>
    .start-game-screen {
        padding: 1rem 3rem 3rem;
        border: 2px solid #000;
        border-radius: 1rem;
        background: #fff;
        font-size: 2rem;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        color: #000;
        text-align: center;
        -webkit-box-shadow: 6px 6px 12px 0px rgba(0, 0, 0, 0.2);
        -moz-box-shadow: 6px 6px 12px 0px rgba(0, 0, 0, 0.2);
        box-shadow: 6px 6px 12px 0px rgba(0, 0, 0, 0.2);
    }
</style>
