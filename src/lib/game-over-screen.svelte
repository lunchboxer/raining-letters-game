<script>
    export let score;
    export let startGame = () => {};
</script>

<div class="overlay" />
<div class="modal">
    <h2>💐 Game Over!</h2>
    <p>Final Score: {score}</p>
    <button on:click={startGame}>Play Again</button>
</div>
