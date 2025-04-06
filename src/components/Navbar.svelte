<!-- src/components/Navbar.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';

	// Initialize with a default value, will be updated in onMount
	let isDarkTheme = false;

	function toggleTheme() {
		// Toggle the theme state
		isDarkTheme = !isDarkTheme;

		// Apply the theme to the document
		const newTheme = isDarkTheme ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', newTheme);

		// Save the theme preference to localStorage
		localStorage.setItem('theme', newTheme);
	}

	onMount(() => {
		// Get the saved theme from localStorage or use default
		const savedTheme = localStorage.getItem('theme') || 'light';

		// Update the component state to match the saved theme
		isDarkTheme = savedTheme === 'dark';

		// Make sure the document has the correct theme attribute
		document.documentElement.setAttribute('data-theme', savedTheme);
	});
</script>

<nav class="container-fluid">
	<ul>
		<li><strong>Case Calculator</strong></li>
	</ul>
	<ul>
		<li><a href="/">Home</a></li>
		<li><a href="/cases">View Cases</a></li>
		<li>
			<!-- Button to toggle between light and dark themes -->
			<button class="outline" on:click={toggleTheme}>
				{#if isDarkTheme}
					<!-- Show dark theme icon and label when dark theme is active -->
					🌙 Dark
				{:else}
					<!-- Show light theme icon and label when light theme is active -->
					☀️ Light
				{/if}
			</button>
		</li>
	</ul>
</nav>
