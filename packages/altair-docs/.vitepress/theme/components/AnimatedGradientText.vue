<template>
    <div class="animated-gradient-text">
        <div class="gradient-background gradient-border" />
        <slot></slot>
    </div>
</template>

<style>
.animated-gradient-text {
    --bg-size: 300%;
    --bg-gradient: rgba(255, 255, 255, 0.4);

    position: relative;

    display: flex;
    gap: 0.25rem;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    max-width: fit-content;
    margin: 0 auto;
    padding: 0.375rem 1rem;
    border-radius: 99999rem;

    font-weight: 500;
    background: var(--bg-gradient);

    box-shadow: inset 0 -8px 10px rgba(143, 223, 255, 0.12);
    backdrop-filter: blur(1px);

    transition: box-shadow 0.5s ease-out, gap 0.3s ease-out;
    white-space: nowrap;

    svg {
        height: 1rem;
        fill: var(--vp-c-text-1);
    }

    &>span:first-of-type {
        transition: margin-right 0.3s ease-out;
    }
}

.dark .animated-gradient-text {
    --bg-gradient: rgba(0, 0, 0, 0.4);
}

.animated-gradient-text:hover {
    gap: 0.5rem;
    box-shadow: inset 0 -5px 10px rgba(143, 223, 255, 0.35);

    &>span:first-of-type {
        margin-right: -0.25rem;
    }
}

.gradient-border {
    position: absolute;
    inset: 0px;

    display: block;
    height: 100%;
    width: 100%;
    padding: 1px;
    border-radius: inherit;

    mask-composite: subtract !important;
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
}

.gradient-background {
    background: linear-gradient(to right, rgba(255, 170, 64, 0.8), rgba(156, 64, 255, 0.8), rgba(255, 170, 64, 0.8));
    background-size: var(--bg-size) 100%;
    animation: gradient 8s linear infinite;
}

.dark .gradient-background {
    background-image: linear-gradient(to right, rgba(255, 170, 64, 0.6), rgba(156, 64, 255, 0.6), rgba(255, 170, 64, 0.6));
}

.gradient-text {
    color: #0000;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

@keyframes gradient {
    to {
        background-position: var(--bg-size) 0px;
    }
}
</style>