<script>
    export let score;
    export let startGame = () => {};
</script>

<div class="overlay" />
<div class="final-score">
    <h2>💐 Game Over!</h2>
    <p>Final Score: {score}</p>
    <button on:click={startGame}>Play Again</button>
</div>

<style>
    .final-score {
        padding: 1rem 3rem 3rem;
        border: 2px solid #000;
        border-radius: 1rem;
        background: #fff;
        font-size: 2rem;
        z-index: 100;
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
    .final-score p {
        margin: 0;
        padding: 1rem 2rem;
    }
</style>
