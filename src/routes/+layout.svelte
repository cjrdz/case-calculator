<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '@picocss/pico';
	import Navbar from '../components/Navbar.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		// Initialize theme from localStorage if available
		const savedTheme = localStorage.getItem('theme') || 'light';
		document.documentElement.setAttribute('data-theme', savedTheme);
	});
</script>

<!-- Navbar -->
<Navbar />

<!-- Main -->
<main class="container">
	<slot />
</main>

<!-- Footer -->
<footer class="container-fluid">
	<div class="container footer-container">
		<div class="grid">
			<small class="margin-bottom-0"> © 2025 Case Calculator - Open Source </small>
			<div class="github-link">
				<a
					href="https://github.com/cjrdz"
					target="_blank"
					rel="noopener noreferrer"
					class="secondary"
				>
					<svg aria-hidden="true" class="icon" viewBox="0 0 16 16" width="16" height="16">
						<path
							fill="currentColor"
							d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
						></path>
					</svg>
					GitHub
				</a>
			</div>
		</div>
	</div>
</footer>

<!-- Footer style -->
<style>
	footer {
		margin-top: auto;
		padding: 2rem 0;
		border-top: 1px solid var(--muted-border-color);
		background-color: var(--background-color);
		text-align: center;
	}

	.footer-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.github-link a {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		font-weight: bold;
		color: var(--primary-color);
		transition:
			opacity 0.2s ease,
			transform 0.2s ease;
	}

	.github-link a:hover {
		opacity: 0.8;
		transform: scale(1.05);
	}

	.icon {
		width: 1.5rem;
		height: 1.5rem;
		vertical-align: middle;
	}

	@media (max-width: 768px) {
		.footer-container {
			text-align: center;
		}
	}
</style>
