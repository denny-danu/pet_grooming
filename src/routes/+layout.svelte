<script lang="ts">
	import "../app.css";
	import { page } from "$app/state";
	import {
		LayoutDashboard,
		Users,
		CalendarDays,
		LogIn,
		BellRing,
		PawPrint,
		LogOut
	} from "@lucide/svelte";
	let { children } = $props();

	const isActive = (base: string) => page.url.pathname === base || page.url.pathname.startsWith(base + "/");

	function initials(name: string) {
		return name.split(/\s+/).map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?";
	}
</script>

<svelte:head>
	<title>PetCo</title>
</svelte:head>

{#if page.url.pathname !== '/login'}
<div class="shell">
	<aside class="sidebar">
		<a href="/" class="brand">
			<span class="brand-mark"><PawPrint size={17} strokeWidth={2.2} /></span>
			<span class="brand-name">PetCo</span>
		</a>

		<nav class="nav">
			<a href="/" class={page.url.pathname === '/' ? 'active' : ''}>
				<LayoutDashboard size={17} /> <span>Dashboard</span>
			</a>
			<a href="/customers" class={isActive('/customers') ? 'active' : ''}>
				<Users size={17} /> <span>Customers</span>
			</a>
			<a href="/bookings" class={isActive('/bookings') ? 'active' : ''}>
				<CalendarDays size={17} /> <span>Bookings</span>
			</a>
			<a href="/check-in" class={isActive('/check-in') ? 'active' : ''}>
				<LogIn size={17} /> <span>Check-in</span>
			</a>
			<a href="/reminders" class={isActive('/reminders') ? 'active' : ''}>
				<BellRing size={17} /> <span>Reminders</span>
			</a>
		</nav>

		<div class="sidebar-foot">
			{#if page.data.user}
				<div class="who">
					<span class="avatar">{initials(page.data.user.name)}</span>
					<div class="who-text">
						<div class="who-name">{page.data.user.name}</div>
						<div class="who-role">{page.data.user.role}</div>
					</div>
				</div>
				<form method="POST" action="/logout">
					<button class="logout-btn" type="submit"><LogOut size={15} /> <span>Sign out</span></button>
				</form>
			{/if}
		</div>
	</aside>
	<main class="main">
		<div class="page">
			{@render children()}
		</div>
	</main>
</div>
{:else}
	{@render children()}
{/if}

<style>
	.shell { display: flex; min-height: 100vh; }
	.sidebar {
		width: 236px; flex-shrink: 0;
		background: var(--ink);
		background: linear-gradient(180deg, #171c2c 0%, #10162a 100%);
		color: #a6b0c8;
		display: flex; flex-direction: column;
		position: sticky; top: 0; height: 100vh;
	}
	.brand {
		display: flex; align-items: center; gap: 10px;
		padding: 18px 18px 16px; color: #fff; text-decoration: none;
	}
	.brand-mark {
		width: 30px; height: 30px; border-radius: 9px;
		background: linear-gradient(135deg, #6d5ef2, #4f46e5);
		display: grid; place-items: center;
		box-shadow: var(--shadow-md);
	}
	.brand-name { font-size: 16px; font-weight: 700; letter-spacing: -0.01em; }
	.nav { display: flex; flex-direction: column; gap: 2px; padding: 10px 10px; flex: 1; }
	.nav a {
		display: flex; align-items: center; gap: 11px;
		padding: 8px 11px; border-radius: 8px;
		color: #a6b0c8; font-size: 13.5px; font-weight: 500; text-decoration: none;
		transition: background 120ms ease, color 120ms ease;
	}
	.nav a svg { opacity: 0.8; }
	.nav a:hover { background: rgba(255, 255, 255, 0.06); color: #e5e9f5; }
	.nav a.active { background: var(--primary); color: #fff; box-shadow: var(--shadow-sm); }
	.nav a.active svg { opacity: 1; }
	.sidebar-foot { border-top: 1px solid rgba(255, 255, 255, 0.08); padding: 12px 10px; display: flex; flex-direction: column; gap: 8px; }
	.who { display: flex; align-items: center; gap: 9px; padding: 4px 4px; }
	.who-text { min-width: 0; }
	.who-name { font-size: 12.5px; font-weight: 600; color: #e5e9f5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.who-role { font-size: 11px; color: #6f7b9c; text-transform: capitalize; }
	.logout-btn {
		display: flex; align-items: center; gap: 8px; width: 100%;
		background: transparent; border: none; color: #a6b0c8;
		font-size: 12.5px; font-weight: 500; padding: 7px 11px; border-radius: 8px; cursor: pointer;
		text-align: left;
	}
	.logout-btn:hover { background: rgba(255, 255, 255, 0.06); color: #fff; }
	.main { flex: 1; min-width: 0; padding: var(--sp-6); }
	@media (max-width: 860px) {
		.sidebar { width: 72px; }
		.brand-name, .nav a span, .who-text, .logout-btn span { display: none; }
		.nav a { justify-content: center; padding: 10px; }
		.brand { justify-content: center; }
		.sidebar-foot { align-items: center; }
		.main { padding: var(--sp-4); }
	}
</style>
