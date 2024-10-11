<script>
    import { onMount, onDestroy } from "svelte";
    import { WORDS } from "$lib/words";
    import confetti from "canvas-confetti";
    import { nanoid } from "nanoid";
    import { browser } from "$app/environment";
    import GameOverScreen from "$lib/game-over-screen.svelte";
    import StartGameScreen from "$lib/start-game-screen.svelte";

    let words = shuffleArray([
        ...WORDS.round1,
        ...WORDS.round2,
        ...WORDS.round3,
    ]);
    let currentWordIndex = 0;
    let raindrops = [];
    let gameBoard;
    let gameLoop;
    let score = 0;
    const timeLimit = 60;
    let timeRemaining = timeLimit;
    let gameStarted = false;
    let gameOver = false;
    let completedLetters = "";

    $: currentWord = words[currentWordIndex] || "";

    onMount(() => {
        adjustGameBoardHeight();
        if (browser) {
            window.addEventListener("resize", adjustGameBoardHeight);
        }
    });

    onDestroy(() => {
        stopGameLoop();
        if (browser) {
            window.removeEventListener("resize", adjustGameBoardHeight);
        }
    });

    function adjustGameBoardHeight() {
        if (gameBoard && browser) {
            gameBoard.style.height = `${window.innerHeight - 50}px`;
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function initializeGame() {
        currentWordIndex = 0;
        raindrops = [];
        score = 0;
        timeRemaining = timeLimit;
        gameStarted = true;
        gameOver = false;
        completedLetters = "";
        words = shuffleArray([
            ...WORDS.round1,
            ...WORDS.round2,
            ...WORDS.round3,
        ]);
    }

    function startGameLoop() {
        gameLoop = setInterval(() => {
            updateGameState();
            if (Math.random() < 0.2) {
                addRaindrop();
            }
            timeRemaining -= 0.08;
            if (timeRemaining <= 0) {
                endGame();
            }
        }, 50);
    }

    function stopGameLoop() {
        if (gameLoop) {
            clearInterval(gameLoop);
        }
    }

    function updateGameState() {
        raindrops = raindrops
            .map((drop) => ({
                ...drop,
                y: drop.y + drop.speed,
            }))
            .filter((drop) => drop.y < gameBoard.clientHeight);
    }

    function addRaindrop() {
        const letter = getWeightedRandomLetter();
        raindrops = [
            ...raindrops,
            {
                x: Math.random() * (gameBoard.clientWidth - 60),
                y: -60,
                id: nanoid(),
                letter: letter,
                speed: Math.random() * 6 + 1,
                selected: false,
            },
        ];
    }

    function getWeightedRandomLetter() {
        const remainingLetters = currentWord;
        const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
        const shuffledAlphabet = alphabet.sort(() => 0.5 - Math.random());
        const someOtherLetters = shuffledAlphabet
            .filter((letter) => {
                return !remainingLetters.includes(letter);
            })
            .slice(0, remainingLetters.length - 1);
        const weightedAlphabet = remainingLetters + someOtherLetters.join("");
        return weightedAlphabet[
            Math.floor(Math.random() * weightedAlphabet.length)
        ];
    }

    function handleClick(raindrop) {
        if (!gameStarted || gameOver) return;
        const { letter, id } = raindrop;

        raindrops = raindrops.filter((drop) => drop.id !== id);
        if (
            currentWord[completedLetters.length].toLowerCase() ===
            letter.toLowerCase()
        ) {
            completedLetters += letter.toLowerCase();

            if (completedLetters.length === currentWord.length) {
                flashScore(50);
                score += 50;
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                });
                currentWordIndex++;
                completedLetters = "";
                if (currentWordIndex >= words.length) {
                    endGame();
                }
            } else {
                score += 10;
                flashScore(10);
            }
        } else {
            score = Math.max(0, score - 5);
            flashScore(-5);
        }
    }

    function flashScore(points) {
        const flashElement = document.createElement("div");
        flashElement.textContent = points > 0 ? `+${points}` : points;
        flashElement.style.position = "absolute";
        flashElement.style.left = "50%";
        flashElement.style.top = "50%";
        flashElement.style.transform = "translate(-50%, -50%)";
        flashElement.style.fontSize = "3rem";
        flashElement.style.color = points > 0 ? "green" : "red";
        flashElement.style.opacity = "1";
        flashElement.style.transition = "opacity 1s";
        gameBoard.appendChild(flashElement);

        setTimeout(() => {
            flashElement.style.opacity = "0";
        }, 50);

        setTimeout(() => {
            gameBoard.removeChild(flashElement);
        }, 1050);
    }

    function startGame() {
        initializeGame();
        startGameLoop();
    }

    function endGame() {
        stopGameLoop();
        gameOver = true;
        gameStarted = false;
    }
</script>

<div class="game-container">
    <div class="game-info">
        <h1>Raining letters</h1>
        <h2>Score: {score}</h2>
        <h2>Time: {Math.ceil(timeRemaining)}s</h2>
    </div>

    <div class="game-board" bind:this={gameBoard}>
        {#each raindrops as raindrop (raindrop.id)}
            <div
                role="button"
                tabindex="0"
                on:keydown={(e) => e.key === "Enter" && handleClick(raindrop)}
                class="raindrop"
                class:selected={raindrop.selected}
                style="left: {raindrop.x}px; top: {raindrop.y}px;"
                on:click={() => handleClick(raindrop)}
            >
                {raindrop.letter}
            </div>
        {/each}
        {#if gameOver}
            <GameOverScreen {score} {startGame} />
        {/if}

        {#if !gameStarted && !gameOver}
            <StartGameScreen {startGame} />
        {/if}

        {#if gameStarted && !gameOver}
            <div class="current-word">
                {#each currentWord.split("") as letter, index}
                    <span class:completed={index < completedLetters.length}
                        >{letter}</span
                    >
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    .game-container {
        width: calc(100% - 2rem);
        padding: 0;
        height: calc(100vh - 4rem);
        display: flex;
        flex-direction: column;
    }
    .game-info {
        width: 100%;
        padding: 0 1rem;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: baseline;
    }

    @media screen and (max-width: 600px) {
        .game-info {
            font-size: 0.7rem;
        }
    }

    .game-board {
        position: relative;
        width: calc(100% - 1rem);
        padding: 1rem;
        overflow: hidden;
        margin: 0 auto;
    }

    .raindrop {
        position: absolute;
        width: 5rem;
        height: 5rem;
        background-color: #1e90ff;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3rem;
        cursor: pointer;
    }

    .current-word {
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        position: absolute;
        bottom: 3rem;
        left: 50%;
        transform: translateX(-50%);
        font-size: 6rem;
        color: rgba(255, 255, 255, 0.8);
        text-align: center;
    }

    .current-word .completed {
        color: rgba(76, 175, 80, 1);
    }

    @keyframes flash {
        0%,
        100% {
            opacity: 0;
        }
        50% {
            opacity: 1;
        }
    }
</style>
