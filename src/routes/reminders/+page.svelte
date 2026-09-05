<script lang="ts">
	import { page } from "$app/state";
	import { BellRing, Play, Mail, Smartphone, MessageSquare, CheckCircle2, XCircle, Clock } from "@lucide/svelte";
	let { data } = $props();
	const fmt = (d: Date | null) => d ? new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
	const disp = $derived(page.form?.dispatched);
	const sent = $derived(page.form?.sent);
	const showResult = $derived(disp !== undefined);
	const channelIcon = (c: string) => c === 'email' ? Mail : c === 'whatsapp' ? MessageSquare : Smartphone;
	const statusMeta = (s: string) =>
		s === 'delivered' ? { cls: 'status-valid', Icon: CheckCircle2 }
			: s === 'failed' ? { cls: 'status-cancelled', Icon: XCircle }
			: s === 'sent' ? { cls: 'status-checked_in', Icon: CheckCircle2 }
			: { cls: 'status-pending', Icon: Clock };
	const templateLabel = (t: string) => t.replace('booking-', 'Booking ').replace('-', ' · ').replace(/\b\w/g, (c) => c.toUpperCase());
</script>

<svelte:head><title>Reminders · PetCo</title></svelte:head>

<div class="page-header">
	<div class="title-block">
		<div class="kicker"><BellRing size={13} /> Outreach</div>
		<h1>Reminders</h1>
		<p>Automatic pre-visit reminders plus the delivery log.</p>
	</div>
	<div class="actions">
		<form method="POST" action="?/dispatch">
			<button class="btn btn-primary" type="submit"><Play size={15} /> Run reminder scan</button>
		</form>
	</div>
</div>

{#if showResult}
	<div class="alert alert-success">
		<CheckCircle2 />
		<span>Scan complete — {disp} reminder(s) due, {sent} sent to customers.</span>
	</div>
{/if}

<section class="card">
	<div class="card-head">
		<h2>Notification log</h2>
		<span class="badge badge-neutral">{data.rows.length} recent</span>
	</div>
	<div class="table-wrap">
		{#if data.rows.length === 0}
			<div class="empty-state">
				<div class="empty-icon"><BellRing /></div>
				<h3>No notifications yet</h3>
				<p>Run the scan to queue 24-hour and 2-hour reminders for upcoming visits.</p>
				<form method="POST" action="?/dispatch"><button class="btn btn-primary"><Play size={14} /> Run scan</button></form>
			</div>
		{:else}
		<table>
			<thead><tr><th>Created</th><th>Customer</th><th>Channel</th><th>Template</th><th>To</th><th>Status</th><th>Sent</th></tr></thead>
			<tbody>
			{#each data.rows as n}
				{@const sm = statusMeta(n.status)}
				<tr>
					<td class="small muted">{fmt(n.createdAt)}</td>
					<td class="cell-strong">{n.ownerName}{n.ownerLast ? ` ${n.ownerLast}` : ''}</td>
					<td><span class="badge badge-neutral"><svelte:component this={channelIcon(n.channel)} size={12} /> {n.channel}</span></td>
					<td class="small">{templateLabel(n.template)}</td>
					<td class="small mono">{n.to}</td>
					<td><span class="badge {sm.cls}"><svelte:component this={sm.Icon} size={12} /> {n.status}</span></td>
					<td class="small muted">{fmt(n.sentAt)}</td>
				</tr>
			{/each}
			</tbody>
		</table>
		{/if}
	</div>
</section>
