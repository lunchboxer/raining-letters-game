<script>
    import { onMount, onDestroy } from "svelte";
    import { WORDS } from "$lib/words";
    import confetti from "canvas-confetti";
    import { nanoid } from "nanoid";
    import { browser } from "$app/environment";
    import GameOverScreen from "$lib/game-over-screen.svelte";
    import StartGameScreen from "$lib/start-game-screen.svelte";
    import { Howl } from "howler";

    const DEFUALTTIMELIMIT = 60;

    let words = [];
    let settings = {
        rainbowMode: false,
        timeLimit: DEFUALTTIMELIMIT,
        playSounds: true,
        wordSets: {
            round1: true,
            round2: true,
            round3: true,
        },
    };

    const correctLetterSound = new Howl({
        src: ["/correct_letter.mp3"],
    });

    const correctWordSound = new Howl({
        src: ["/correct_word.mp3"],
    });

    const losePointsSound = new Howl({
        src: ["/lose_points.mp3"],
    });

    const gameEndSound = new Howl({
        src: ["/game_end.mp3"],
    });

    let currentWordIndex = 0;
    let isPaused = false;
    let raindrops = [];
    let settingsOpen = false;
    let gameBoard;
    let gameLoop;
    let score = 0;
    let timeRemaining = settings.timeLimit;
    let gameStarted = false;
    let gameOver = false;
    let completedLetters = "";

    let audioBuffer = {};
    const BUFFER_SIZE = 5;

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

    function preloadAudio(wordIndex) {
        const end = Math.min(wordIndex + BUFFER_SIZE, words.length);
        for (let i = wordIndex; i < end; i++) {
            if (!audioBuffer[words[i]]) {
                audioBuffer[words[i]] = new Howl({
                    src: [`/audio/${words[i]}.mp3`],
                    preload: true,
                });
            }
        }
    }

    function playWordAudio() {
        if (settings.playSounds && audioBuffer[words[currentWordIndex]]) {
            audioBuffer[words[currentWordIndex]].play();
        }
    }

    function getRandomColor() {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 100%, 70%)`;
    }

    function adjustGameBoardHeight() {
        if (gameBoard && browser) {
            gameBoard.style.height = `${window.innerHeight}px`;
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
        timeRemaining = settings.timeLimit;
        gameStarted = true;
        gameOver = false;
        completedLetters = "";
        updateWordList();
        playWordAudio();
    }

    function startGameLoop() {
        gameLoop = setInterval(() => {
            updateGameState();
            if (!isPaused) {
                if (Math.random() < 0.2) {
                    addRaindrop();
                }
                timeRemaining -= 0.08;
                if (timeRemaining <= 0) {
                    endGame();
                }
            }
        }, 50);
    }

    function stopGameLoop() {
        if (gameLoop) {
            clearInterval(gameLoop);
        }
    }

    function updateGameState() {
        if (isPaused) return;
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
                color: settings.rainbowMode ? getRandomColor() : "#bbddee",
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
    function updateWordList() {
        const newWords = shuffleArray([
            ...(settings.wordSets.round1 ? WORDS.round1 : []),
            ...(settings.wordSets.round2 ? WORDS.round2 : []),
            ...(settings.wordSets.round3 ? WORDS.round3 : []),
        ]);
        const newAudioBuffer = {};
        newWords.forEach((word) => {
            if (audioBuffer[word]) {
                newAudioBuffer[word] = audioBuffer[word];
            }
        });

        words = newWords;
        audioBuffer = newAudioBuffer;
        preloadAudio(0);
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
                currentWordIndex++;
                completedLetters = "";
                confetti({
                    particleCount: 200,
                    spread: 80,
                    origin: { y: 0.6 },
                });
                if (settings.playSounds) {
                    correctWordSound.play();
                    correctWordSound.on("end", () => {
                        completedLetters = "";
                        if (currentWordIndex >= words.length) {
                            endGame();
                        } else {
                            preloadAudio(currentWordIndex);
                            playWordAudio();
                        }
                    });
                } else if (currentWordIndex >= words.length) {
                    endGame();
                } else {
                    preloadAudio(currentWordIndex);
                }
            } else {
                score += 10;
                if (settings.playSounds) correctLetterSound.play();
                flashScore(10);
            }
        } else {
            score = Math.max(0, score - 5);
            if (settings.playSounds) losePointsSound.play();
            flashScore(-5);
        }
    }

    function flashScore(points) {
        const flashElement = document.createElement("div");
        flashElement.textContent = points > 0 ? `+${points}` : points;
        flashElement.style.position = "absolute";
        flashElement.style.left = "50%";
        flashElement.style.top = "50%";
        flashElement.style.zIndex = "100";
        flashElement.style.transform = "translate(-50%, -50%)";
        flashElement.style.fontSize = "5rem";
        flashElement.style.color = points > 0 ? "#99ff99" : "#ff8888";
        flashElement.style.opacity = "1";
        flashElement.style.transition = "opacity 1.5s";
        gameBoard.appendChild(flashElement);

        setTimeout(() => {
            flashElement.style.opacity = "0";
        }, 50);

        setTimeout(() => {
            gameBoard.removeChild(flashElement);
        }, 1050);
    }
    function handleSettingsChange(event) {
        settings = event.detail;
        if (gameStarted) {
            updateWordList();
        }
    }

    function startGame() {
        initializeGame();
        startGameLoop();
    }

    function endGame() {
        stopGameLoop();
        if (settings.playSounds) gameEndSound.play();
        gameOver = true;
        gameStarted = false;
    }
</script>

<div class="game-container">
    <div class="game-info">
        <div>
            <h1>Raining letters</h1>
            <h2>Score: {score}</h2>
            <h2>Time: {Math.ceil(timeRemaining)}s</h2>
        </div>
    </div>

    <div class="game-board" bind:this={gameBoard}>
        {#each raindrops as raindrop (raindrop.id)}
            <div
                role="button"
                tabindex="0"
                on:keydown={(e) => e.key === "Enter" && handleClick(raindrop)}
                class="raindrop"
                class:selected={raindrop.selected}
                style="left: {raindrop.x}px; top: {raindrop.y}px; background-color: {raindrop.color};"
                on:click={() => handleClick(raindrop)}
            >
                {raindrop.letter}
            </div>
        {/each}
        {#if gameOver && !settingsOpen}
            <GameOverScreen {score} {startGame} />
        {/if}

        {#if !gameStarted && !gameOver && !settingsOpen}
            <StartGameScreen
                {startGame}
                {settings}
                on:change={handleSettingsChange}
            />
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
        width: calc(100% - 1rem);
        padding: 0;
        height: 100vh;
        display: flex;
        flex-direction: column;
    }
    .game-info {
        position: absolute;
        z-index: 5;
        top: 0;
        left: 0;
        width: calc(100% - 3rem);
        display: flex;
        padding-left: 1rem;
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
        z-index: 10;
        width: 5rem;
        height: 5rem;
        color: black;
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
        z-index: 20;
        left: 50%;
        transform: translateX(-50%);
        font-size: 6rem;
        color: rgba(255, 255, 255, 0.8);
        text-align: center;
    }

    .current-word .completed {
        color: rgba(90, 255, 90, 1);
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
