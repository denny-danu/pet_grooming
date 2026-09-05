<script lang="ts">
	import "../app.css";
	import { page } from "$app/state";
	let { children } = $props();
</script>

<svelte:head>
	<title>PetCo</title>
</svelte:head>

{#if page.url.pathname !== '/login'}
<div class="app">
	<nav>
		<div class="brand">🐾 PetCo</div>
		<a href="/" class={page.url.pathname === '/' ? 'active' : ''}>Dashboard</a>
		<a href="/customers" class={page.url.pathname.startsWith('/customers') ? 'active' : ''}>Customers</a>
		<a href="/bookings" class={page.url.pathname.startsWith('/bookings') ? 'active' : ''}>Bookings</a>
		<a href="/check-in" class={page.url.pathname.startsWith('/check-in') ? 'active' : ''}>Check-in</a>
		<a href="/reminders" class={page.url.pathname.startsWith('/reminders') ? 'active' : ''}>Reminders</a>
		<div class="spacer"></div>
		{#if page.data.user}
			<span class="who">{page.data.user.name}</span>
			<form method="POST" action="/logout"><button class="link-btn">Logout</button></form>
		{/if}
	</nav>
	<main>
		{@render children()}
	</main>
</div>
{:else}
	{@render children()}
{/if}

<style>
	.app { display: flex; min-height: 100vh; }
	nav {
		width: 210px; background: #1c1f2b; color: #cfd2e0;
		display: flex; flex-direction: column; padding: 16px 12px; gap: 2px; flex-shrink: 0;
	}
	.brand { font-weight: 700; font-size: 18px; color: #fff; padding: 4px 12px 16px; }
	nav a { color: #cfd2e0; text-decoration: none; padding: 8px 12px; border-radius: 8px; font-size: 14px; }
	nav a:hover { background: #2a2e40; color: #fff; }
	nav a.active { background: var(--primary); color: #fff; }
	.spacer { flex: 1; }
	.who { padding: 8px 12px; font-size: 12px; opacity: .7; }
	.link-btn { background: none; border: none; color: #cfd2e0; padding: 8px 12px; text-align: left; width: 100%; font-size: 14px; }
	.link-btn:hover { background: #2a2e40; color: #fff; }
	main { flex: 1; padding: 24px 28px; min-width: 0; }
</style>
