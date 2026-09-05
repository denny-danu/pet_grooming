<script lang="ts">
	import { page } from "$app/state";
	let { data } = $props();
	const fmt = (d: Date | null) => d ? new Date(d).toLocaleString() : '—';
	const disp = $derived(page.form?.dispatched);
	const sent = $derived(page.form?.sent);
</script>

<svelte:head><title>Reminders · PetCo</title></svelte:head>

<div class="spread">
	<h1>Reminders</h1>
	<form method="POST" action="?/dispatch">
		<button class="primary" type="submit">Run reminder scan</button>
	</form>
</div>

{#if disp !== undefined}
	<div class="error ok">Scanned: {disp} due · {sent} delivered</div>
{/if}

<section class="card">
	<h2>Notification log</h2>
	{#if data.rows.length === 0}
		<div class="empty">No notifications yet</div>
	{:else}
	<table>
		<thead><tr><th>Created</th><th>Customer</th><th>Channel</th><th>Template</th><th>To</th><th>Status</th><th>Sent</th></tr></thead>
		<tbody>
		{#each data.rows as n}
			<tr>
				<td>{fmt(n.createdAt)}</td>
				<td>{n.ownerName} {n.ownerLast ?? ''}</td>
				<td><span class="badge">{n.channel}</span></td>
				<td class="small">{n.template}</td>
				<td class="small">{n.to}</td>
				<td><span class="badge {n.status === 'delivered' ? 'valid' : n.status === 'failed' ? 'cancelled' : 'pending'}">{n.status}</span></td>
				<td class="small">{fmt(n.sentAt)}</td>
			</tr>
		{/each}
		</tbody>
	</table>
	{/if}
</section>

<style>
	.ok { background: #ecfdf5; color: #047857; border-color: #a7f3d0; }
</style>
