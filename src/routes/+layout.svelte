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
		LogOut,
		Shield,
		Plus,
		Menu,
		X,
		Hotel,
		ShoppingBag,
		CreditCard,
		Fish,
		Scissors,
		PanelLeftClose,
		PanelLeftOpen,
		Building2,
		Lock,
		Settings,
		ChevronDown,
		Check,
		MapPin
	} from "@lucide/svelte";
	import { onMount } from "svelte";
	let { children } = $props();

	let mobileNavOpen = $state(false);
	let branchMenuOpen = $state(false);
	let branchMenuElement = $state<HTMLDivElement | undefined>(undefined);
	let userCollapsed = $state<boolean | null>(null);

	const selectedBranchName = $derived(
		page.data.activeBranchId
			? page.data.branches.find((branch: { id: number; name: string }) => branch.id === page.data.activeBranchId)?.name ?? "Selected branch"
			: "All branches"
	);

	const isPos = $derived(page.url.pathname === "/pos" || page.url.pathname.startsWith("/pos/"));
	const isCollapsed = $derived(userCollapsed !== null ? userCollapsed : isPos);

	const isActive = (base: string) => {
		if (base === "/") return page.url.pathname === "/";
		return page.url.pathname === base || page.url.pathname.startsWith(base + "/");
	};

	function initials(name: string) {
		return name
			.split(/\s+/)
			.map((n) => n[0])
			.slice(0, 2)
			.join("")
			.toUpperCase() || "?";
	}

	function closeMobileNav() {
		mobileNavOpen = false;
	}

	function toggleBranchMenu() {
		branchMenuOpen = !branchMenuOpen;
	}

	function handleBranchChange(value: number) {
		const url = new URL(window.location.href);

		if (value > 0) url.searchParams.set("branch", String(value));
		else url.searchParams.delete("branch");

		branchMenuOpen = false;
		window.location.href = url.toString();
	}

	onMount(() => {
		const handlePointerDown = (event: PointerEvent) => {
			if (!branchMenuElement?.contains(event.target as Node)) branchMenuOpen = false;
		};
		const handleKeydown = (event: KeyboardEvent) => {
			if (event.key === "Escape") branchMenuOpen = false;
		};

		window.addEventListener("pointerdown", handlePointerDown);
		window.addEventListener("keydown", handleKeydown);

		return () => {
			window.removeEventListener("pointerdown", handlePointerDown);
			window.removeEventListener("keydown", handleKeydown);
		};
	});
</script>

<svelte:head>
	<title>PetCo · Pet CRM, Grooming &amp; Hotel</title>
</svelte:head>

{#if page.url.pathname !== "/login"}
	<div class="app-shell">
		<aside class:collapsed={isCollapsed} class:mobile-open={mobileNavOpen} class="sidebar" aria-label="Primary navigation">
			<div class="sidebar-header">
				<a class="sidebar-brand" href="/" aria-label="PetCo dashboard">
					<span class="sidebar-brand-mark"><PawPrint size={17} /></span>
					<span class="sidebar-brand-name">PetCo</span>
				</a>
			</div>
			<nav class="nav">
				<div class="nav-section-label">Operations</div>
				<a href="/" class:active={isActive("/")} onclick={closeMobileNav} title="Dashboard">
					<LayoutDashboard size={17} />
					<span>Dashboard</span>
				</a>
				<a href="/check-in" class:active={isActive("/check-in")} onclick={closeMobileNav} title="Today's Check-in">
					<LogIn size={17} />
					<span>Today's Check-in</span>
				</a>
				<a href="/bookings" class:active={isActive("/bookings")} onclick={closeMobileNav} title="Schedule & Bookings">
					<CalendarDays size={17} />
					<span>Schedule &amp; Bookings</span>
				</a>
				<a href="/hotel-roster" class:active={isActive("/hotel-roster")} onclick={closeMobileNav} title="Hotel Care Roster">
					<Hotel size={17} />
					<span>Hotel Care Roster</span>
				</a>

				<div class="nav-section-label">Pet Shop &amp; Retail</div>
				<a href="/pos" class:active={isActive("/pos")} onclick={closeMobileNav} title="POS Cashier">
					<CreditCard size={17} />
					<span>POS Cashier</span>
				</a>
				<a href="/shop" class:active={isActive("/shop")} onclick={closeMobileNav} title="Products & Stock">
					<ShoppingBag size={17} />
					<span>Products &amp; Stock</span>
				</a>

				<div class="nav-section-label">Specialized Services</div>
				<a href="/aquarium" class:active={isActive("/aquarium")} onclick={closeMobileNav} title="Aquarium Hub">
					<Fish size={17} />
					<span>Aquarium Hub</span>
				</a>
				<a href="/grooming-cuts" class:active={isActive("/grooming-cuts")} onclick={closeMobileNav} title="Grooming Cut Cards">
					<Scissors size={17} />
					<span>Grooming Cut Cards</span>
				</a>

				<div class="nav-section-label">CRM &amp; Outreach</div>
				<a href="/customers" class:active={isActive("/customers")} onclick={closeMobileNav} title="Customers & Pets">
					<Users size={17} />
					<span>Customers &amp; Pets</span>
				</a>
				<a href="/reminders" class:active={isActive("/reminders")} onclick={closeMobileNav} title="Reminders & Logs">
					<BellRing size={17} />
					<span>Reminders &amp; Logs</span>
				</a>

				<div class="nav-section-label">Administration</div>
				<a href="/staff" class:active={isActive("/staff")} onclick={closeMobileNav} title="Staff & Team">
					<Shield size={17} />
					<span>Staff &amp; Team</span>
				</a>
				<a href="/settings" class:active={isActive("/settings")} onclick={closeMobileNav} title="Store Settings">
					<Settings size={17} />
					<span>Store Settings</span>
				</a>
			</nav>
		</aside>

		<div class="main-stack">
			{#if mobileNavOpen}
				<button class="mobile-backdrop" type="button" aria-label="Close navigation" onclick={closeMobileNav}></button>
			{/if}

			<header class="content-top-bar">
				<div class="topbar-left">
					<button class="mobile-menu-btn" type="button" aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"} onclick={() => (mobileNavOpen = !mobileNavOpen)}>
						{#if mobileNavOpen}<X size={20} />{:else}<Menu size={20} />{/if}
					</button>
					<button
						class="collapse-toggle-btn"
						type="button"
						onclick={() => (userCollapsed = !isCollapsed)}
						aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
						title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
					>
						{#if isCollapsed}<PanelLeftOpen size={17} />{:else}<PanelLeftClose size={17} />{/if}
					</button>
				</div>

				<div class="topbar-center">
					{#if page.data.isHeadOffice}
						<div class="branch-menu" bind:this={branchMenuElement}>
							<button
								class="branch-switcher-trigger"
								type="button"
								aria-haspopup="menu"
								aria-expanded={branchMenuOpen}
								aria-label="Choose branch view"
								onclick={toggleBranchMenu}
							>
								<span class="branch-trigger-icon"><Building2 size={15} /></span>
								<span class="branch-trigger-copy">
									<span class="branch-trigger-label">Branch view</span>
									<strong>{selectedBranchName}</strong>
								</span>
								<span class:open={branchMenuOpen} class="branch-trigger-chevron"><ChevronDown size={14} /></span>
							</button>

							{#if branchMenuOpen}
								<div class="branch-popover" role="menu" aria-label="Available branches">
									<div class="branch-popover-heading">Switch data scope</div>
									<button
										class:active={page.data.activeBranchId == null}
										class="branch-option"
										type="button"
										role="menuitemradio"
										aria-checked={page.data.activeBranchId == null}
										onclick={() => handleBranchChange(0)}
									>
										<span class="branch-option-icon"><Building2 size={16} /></span>
										<span class="branch-option-copy"><strong>All branches</strong><small>Consolidated headquarters view</small></span>
										{#if page.data.activeBranchId == null}<span class="branch-option-check"><Check size={16} /></span>{/if}
									</button>
									{#each page.data.branches as branch}
										<button
											class:active={page.data.activeBranchId === branch.id}
											class="branch-option"
											type="button"
											role="menuitemradio"
											aria-checked={page.data.activeBranchId === branch.id}
											onclick={() => handleBranchChange(branch.id)}
										>
											<span class="branch-option-icon">{#if branch.isHeadOffice}<Building2 size={16} />{:else}<MapPin size={16} />{/if}</span>
											<span class="branch-option-copy"><strong>{branch.name}</strong><small>{branch.isHeadOffice ? "Head office" : "Branch location"}</small></span>
											{#if page.data.activeBranchId === branch.id}<span class="branch-option-check"><Check size={16} /></span>{/if}
										</button>
									{/each}
								</div>
							{/if}
						</div>
					{:else if page.data.currentBranch || page.data.user?.branchName}
						<div class="branch-locked-pill" title="Data is private to your assigned branch">
							<Lock size={13} />
							<span>{page.data.currentBranch?.name ?? page.data.user?.branchName ?? "Assigned Branch"}</span>
						</div>
					{/if}
				</div>

				<div class="topbar-right">
					<a href="/bookings/new" class="btn btn-primary btn-sm topbar-quick-btn"><Plus size={15} strokeWidth={2.5} /><span>New Booking</span></a>
					{#if page.data.user}
						<div class="user-menu-wrap">
							<span class="user-avatar-topbar" title={page.data.user.name}>{initials(page.data.user.name)}</span>
							<div class="user-menu-meta">
								<div class="user-name-top">{page.data.user.name}</div>
								<div class="user-role-top">{page.data.user.role}</div>
							</div>
							<form method="POST" action="/logout" class="logout-form-top">
								<button class="btn-logout-top" type="submit" aria-label="Sign out" title="Sign out"><LogOut size={16} /><span class="logout-text">Sign out</span></button>
							</form>
						</div>
					{/if}
				</div>
			</header>

			<main class="main">
				<div class:page-fullwidth={isPos} class="page">
					{@render children()}
				</div>
			</main>
		</div>
	</div>
{:else}
	{@render children()}
{/if}

<style>
	.app-shell {
		min-height: 100vh;
		background: var(--bg);
	}

	.sidebar {
		position: fixed;
		inset: 0 auto 0 0;
		z-index: 600;
		width: 256px;
		height: 100vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		background: #0f172a;
		color: #94a3b8;
		border-right: 1px solid rgba(255, 255, 255, 0.08);
		box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
		transition: width 200ms cubic-bezier(0.4, 0, 0.2, 1), transform 220ms ease;
	}

	.sidebar.collapsed { width: 72px; }

	.nav {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 3px;
		overflow-y: auto;
		padding: 18px 12px;
	}

	.nav-section-label {
		padding: 8px 10px 4px;
		color: #64748b;
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.09em;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.nav a {
		position: relative;
		display: flex;
		align-items: center;
		gap: 11px;
		min-height: 40px;
		padding: 8px 12px;
		border-radius: var(--r-md);
		color: #94a3b8;
		font-size: 13px;
		font-weight: 600;
		text-decoration: none;
		white-space: nowrap;
		transition: background 130ms ease, color 130ms ease;
	}

	.nav a:hover { background: rgba(255, 255, 255, 0.06); color: #f8fafc; }
	.nav a.active { background: rgba(99, 102, 241, 0.16); color: #fff; box-shadow: inset 0 0 0 1px rgba(99, 102, 241, 0.3); }
	.nav a.active::before { content: ""; position: absolute; inset: 6px auto 6px 0; width: 3px; border-radius: 0 3px 3px 0; background: #818cf8; box-shadow: 0 0 8px #6366f1; }

	.sidebar.collapsed .nav { align-items: center; padding: 18px 10px; }
	.sidebar.collapsed .nav-section-label { display: none; }
	.sidebar.collapsed .nav a span { display: none; }
	.sidebar.collapsed .nav a { justify-content: center; width: 44px; height: 44px; padding: 10px; }

	.main-stack {
		min-width: 0;
		min-height: 100vh;
		margin-left: 256px;
		transition: margin-left 200ms cubic-bezier(0.4, 0, 0.2, 1);
	}

	.sidebar.collapsed ~ .main-stack { margin-left: 72px; }

	.content-top-bar {
		position: sticky;
		top: 0;
		z-index: 500;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 18px;
		height: 58px;
		padding: 10px 22px;
		background: #fff;
		border-bottom: 1px solid var(--border);
		box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
	}

	.topbar-left, .topbar-right, .user-menu-wrap { display: flex; align-items: center; }
	.topbar-left { gap: 10px; flex-shrink: 0; }
	.topbar-right { gap: 12px; flex-shrink: 0; }

	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 8px;
		height: 58px;
		min-height: 58px;
		padding: 10px 12px;
		box-sizing: border-box;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.sidebar-brand {
		display: flex;
		align-items: center;
		gap: 9px;
		min-width: 0;
		color: #fff;
		font-size: 14px;
		font-weight: 800;
		letter-spacing: -0.02em;
		text-decoration: none;
	}

	.sidebar-brand-mark {
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		flex-shrink: 0;
		border-radius: 9px;
		background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
		box-shadow: 0 3px 8px rgba(79, 70, 229, 0.35);
	}

	.sidebar-brand-name { white-space: nowrap; }

	.collapse-toggle-btn, .mobile-menu-btn {
		display: grid;
		place-items: center;
		width: 34px;
		height: 34px;
		flex-shrink: 0;
		padding: 0;
		border: 1px solid var(--border);
		border-radius: var(--r-md);
		color: var(--muted);
		background: transparent;
		cursor: pointer;
	}

	.collapse-toggle-btn:hover, .mobile-menu-btn:hover { color: var(--ink); background: var(--surface-3); }
	.sidebar.collapsed .sidebar-header { padding-inline: 6px; }
	.sidebar.collapsed .sidebar-brand-mark { width: 26px; height: 26px; }
	.sidebar.collapsed .sidebar-brand-name { display: none; }
	.mobile-menu-btn { display: none; }


	.topbar-center { display: flex; align-items: center; justify-content: flex-start; flex: 0 1 auto; min-width: 0; margin-right: auto; }
	.branch-menu { position: relative; }
	.branch-switcher-trigger {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: 9px;
		min-width: 220px;
		max-width: min(420px, 100%);
		padding: 7px 11px;
		border: 1px solid var(--primary-border);
		border-radius: 14px;
		color: var(--primary);
		background: linear-gradient(135deg, var(--primary-soft), #fff);
		box-shadow: 0 4px 12px rgba(79, 70, 229, 0.08);
		text-align: left;
		cursor: pointer;
		transition: border-color 130ms ease, box-shadow 130ms ease, transform 130ms ease;
	}

	.branch-switcher-trigger:hover, .branch-switcher-trigger:focus-visible {
		border-color: var(--primary);
		box-shadow: 0 6px 18px rgba(79, 70, 229, 0.14);
		outline: none;
	}

	.branch-switcher-trigger:active { transform: translateY(1px); }
	.branch-trigger-icon { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 9px; color: #fff; background: var(--primary); }
	.branch-trigger-copy { display: flex; min-width: 0; flex-direction: column; gap: 1px; }
	.branch-trigger-label { color: var(--muted); font-size: 9px; font-weight: 800; letter-spacing: 0.08em; line-height: 1; text-transform: uppercase; }
	.branch-trigger-copy strong { overflow: hidden; color: var(--ink); font-size: 12px; font-weight: 750; text-overflow: ellipsis; white-space: nowrap; }
	.branch-trigger-chevron { display: grid; place-items: center; color: var(--muted); transition: transform 150ms ease; }
	.branch-trigger-chevron.open { transform: rotate(180deg); }

	.branch-popover {
		position: absolute;
		top: calc(100% + 10px);
		left: 50%;
		z-index: 700;
		width: min(350px, calc(100vw - 32px));
		padding: 8px;
		border: 1px solid var(--border);
		border-radius: 16px;
		background: #fff;
		box-shadow: 0 18px 45px rgba(15, 23, 42, 0.18);
		transform: translateX(-50%);
	}

	.branch-popover-heading { padding: 7px 10px 8px; color: var(--muted); font-size: 10px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
	.branch-option { display: grid; grid-template-columns: 30px minmax(0, 1fr) auto; align-items: center; gap: 9px; width: 100%; padding: 9px 10px; border: 1px solid transparent; border-radius: 11px; color: var(--ink); background: transparent; text-align: left; cursor: pointer; }
	.branch-option:hover, .branch-option:focus-visible { border-color: var(--primary-border); background: var(--primary-soft); outline: none; }
	.branch-option.active { border-color: var(--primary-border); background: var(--primary-soft); }
	.branch-option-icon { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 9px; color: var(--primary); background: #fff; box-shadow: inset 0 0 0 1px var(--primary-border); }
	.branch-option-copy { display: flex; min-width: 0; flex-direction: column; gap: 2px; }
	.branch-option-copy strong { overflow: hidden; font-size: 12px; font-weight: 750; text-overflow: ellipsis; white-space: nowrap; }
	.branch-option-copy small { overflow: hidden; color: var(--muted); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
	.branch-option-check { color: var(--primary); }
	.branch-locked-pill { display: inline-flex; align-items: center; gap: 8px; max-width: min(420px, 100%); padding: 8px 13px; border: 1px solid var(--primary-border); border-radius: 14px; color: var(--primary); background: var(--primary-soft); font-size: 12px; font-weight: 700; }
	.branch-locked-pill span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

	.user-menu-wrap { gap: 10px; padding: 4px 8px; border: 1px solid var(--border); border-radius: var(--r-full); background: var(--surface-2); }
	.user-avatar-topbar { display: grid; place-items: center; width: 30px; height: 30px; flex-shrink: 0; border-radius: 50%; color: #fff; background: linear-gradient(135deg, #3b82f6, #1d4ed8); font-size: 11px; font-weight: 700; }
	.user-menu-meta { min-width: 0; line-height: 1.2; }
	.user-name-top { max-width: 140px; overflow: hidden; color: var(--ink); font-size: 12px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
	.user-role-top { color: var(--primary); font-size: 10px; font-weight: 700; text-transform: capitalize; }
	.logout-form-top { margin: 0; }
	.btn-logout-top { display: inline-flex; align-items: center; gap: 5px; padding: 5px 9px; border: 1px solid var(--border); border-radius: var(--r-full); color: var(--muted); background: transparent; font-size: 11px; font-weight: 600; cursor: pointer; white-space: nowrap; }
	.btn-logout-top:hover { border-color: var(--danger-border); color: var(--danger); background: var(--danger-bg); }

	.main { min-width: 0; padding: var(--sp-6) var(--sp-8); }
	.page { min-width: 0; }
	.page-fullwidth { max-width: 100% !important; }
	.mobile-backdrop { display: none; }

	@media (max-width: 960px) {
		.sidebar { width: 280px; transform: translateX(-100%); transition: none; }
		.sidebar.collapsed { width: 280px; }
		.sidebar.mobile-open { transform: translateX(0); }
		.sidebar.collapsed .nav { align-items: stretch; padding: 18px 12px; }
		.sidebar.collapsed .nav a { justify-content: flex-start; width: auto; height: auto; padding: 8px 12px; }
		.sidebar.collapsed .nav a span { display: inline; }
		.sidebar.collapsed .nav-section-label { display: block; }
		.sidebar.collapsed .sidebar-header { gap: 8px; padding: 10px 12px; }
		.sidebar.collapsed .sidebar-brand-mark { width: 32px; height: 32px; }
		.sidebar.collapsed .sidebar-brand-name { display: inline; }
		.main-stack, .sidebar.collapsed ~ .main-stack { margin-left: 0; }
		.mobile-menu-btn { display: grid; }
		.mobile-backdrop { position: fixed; inset: 0; z-index: 550; display: block; width: 100%; height: 100%; border: 0; background: rgba(15, 23, 42, 0.62); backdrop-filter: blur(3px); cursor: default; }
		.content-top-bar { padding: 10px 16px; }
		.main { padding: var(--sp-4); }
		.user-menu-meta, .logout-text, .topbar-quick-btn span { display: none; }
		.topbar-quick-btn { padding: 7px 9px; }
	}

	@media (max-width: 560px) {
		.content-top-bar { gap: 8px; }
		.topbar-center { justify-content: flex-start; }
		.branch-switcher-trigger { min-width: 0; max-width: 46vw; padding-inline: 8px; }
		.branch-trigger-label { display: none; }
		.branch-trigger-icon { width: 24px; height: 24px; }
		.topbar-right { gap: 6px; }
		.user-menu-wrap { padding-inline: 4px; }
		.main { padding: 12px; }
	}
</style>
