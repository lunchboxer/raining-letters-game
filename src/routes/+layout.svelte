<script>
    import "../app.css";
    import Footer from "$lib/footer.svelte";
</script>

<main>
    <slot />

    <Footer />
</main>

<style>
    main {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
</style>
