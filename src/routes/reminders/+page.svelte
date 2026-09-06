<script lang="ts">
	import { page } from "$app/state";
	import { makeT } from "$lib/i18n/t";
	import {
		BellRing,
		Play,
		Mail,
		Smartphone,
		MessageSquare,
		CheckCircle2,
		XCircle,
		Clock,
		Sparkles,
		Send,
		Filter
	} from "@lucide/svelte";

	let { data } = $props();
	const t = $derived(makeT(page.data.locale ?? "en"));

	let selectedChannel = $state<string>('all');
	let selectedStatus = $state<string>('all');

	const fmt = (d: Date | string | null) =>
		d
			? new Date(d).toLocaleString(undefined, {
					month: 'short',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit'
			  })
			: '—';

	const disp = $derived(page.form?.dispatched);
	const sent = $derived(page.form?.sent);
	const showResult = $derived(disp !== undefined);

	function channelIcon(c: string) {
		if (c === 'email') return Mail;
		if (c === 'whatsapp') return MessageSquare;
		return Smartphone;
	}

	function statusMeta(s: string) {
		if (s === 'delivered') return { cls: 'badge-success', Icon: CheckCircle2 };
		if (s === 'failed') return { cls: 'badge-danger', Icon: XCircle };
		if (s === 'sent') return { cls: 'badge-info', Icon: CheckCircle2 };
		return { cls: 'badge-warning', Icon: Clock };
	}

	function templateLabel(t: string) {
		return t
			.replace('booking-', 'Booking · ')
			.replace('-', ' ')
			.replace(/\b\w/g, (c) => c.toUpperCase());
	}

	const deliveredCount = $derived(
		data.rows.filter((r) => r.status === 'delivered' || r.status === 'sent').length
	);
	const deliveryRate = $derived(
		data.rows.length > 0 ? Math.round((deliveredCount / data.rows.length) * 100) : 100
	);

	const filteredRows = $derived(
		data.rows.filter((r) => {
			const matchChan = selectedChannel === 'all' || r.channel === selectedChannel;
			const matchStat = selectedStatus === 'all' || r.status === selectedStatus;
			return matchChan && matchStat;
		})
	);
</script>

<svelte:head>
	<title>Reminders &amp; Outreach · PetCo</title>
</svelte:head>

<div class="page-header">
	<div class="title-block">
		<div class="kicker"><BellRing size={13} /> {t['rem.kicker']()}</div>
		<h1>{t['rem.title']()}</h1>
		<p class="subtitle">{t['rem.subtitle']()}</p>
	</div>
	<div class="actions">
		<form method="POST" action="/reminders?/dispatch">
			<button class="btn btn-primary" type="submit">
				<Play size={15} />
				<span>Run Reminder Scan Now</span>
			</button>
		</form>
	</div>
</div>

{#if showResult}
	<div class="alert alert-success mb">
		<CheckCircle2 />
		<span>
			Scan complete — <strong>{disp}</strong> reminder(s) queued for today's visits, <strong>{sent}</strong> sent to customers.
		</span>
	</div>
{/if}

<!-- Outreach Metrics Strip -->
<div class="stat-grid" style="margin-bottom: var(--sp-6);">
	<div class="stat-card">
		<div class="stat-top">
			<div class="stat-icon purple">
				<Send size={18} />
			</div>
			<span class="stat-trend up">Total</span>
		</div>
		<div class="stat-value">{data.rows.length}</div>
		<div class="stat-label">Notifications Dispatched</div>
	</div>

	<div class="stat-card">
		<div class="stat-top">
			<div class="stat-icon green">
				<CheckCircle2 size={18} />
			</div>
			<span class="stat-trend up">High</span>
		</div>
		<div class="stat-value">{deliveryRate}%</div>
		<div class="stat-label">Delivery Success Rate</div>
	</div>

	<div class="stat-card">
		<div class="stat-top">
			<div class="stat-icon blue">
				<MessageSquare size={18} />
			</div>
			<span class="stat-trend neutral">Multi-channel</span>
		</div>
		<div class="stat-value">3</div>
		<div class="stat-label">Active Outreach Channels</div>
	</div>

	<div class="stat-card">
		<div class="stat-top">
			<div class="stat-icon amber">
				<Clock size={18} />
			</div>
			<span class="stat-trend up">Auto</span>
		</div>
		<div class="stat-value">24h / 2h</div>
		<div class="stat-label">Pre-visit Lead Time</div>
	</div>
</div>

<!-- Filters Bar -->
<div class="card mb">
	<div class="toolbar spread">
		<div class="row gap-2">
			<span class="small faint font-semibold">Channel:</span>
			<div class="segmented">
				<button class={selectedChannel === 'all' ? 'active' : ''} onclick={() => selectedChannel = 'all'}>
					<Sparkles size={13} />
					<span>All</span>
				</button>
				<button class={selectedChannel === 'whatsapp' ? 'active' : ''} onclick={() => selectedChannel = 'whatsapp'}>
					<MessageSquare size={13} />
					<span>WhatsApp</span>
				</button>
				<button class={selectedChannel === 'sms' ? 'active' : ''} onclick={() => selectedChannel = 'sms'}>
					<Smartphone size={13} />
					<span>SMS</span>
				</button>
				<button class={selectedChannel === 'email' ? 'active' : ''} onclick={() => selectedChannel = 'email'}>
					<Mail size={13} />
					<span>Email</span>
				</button>
			</div>
		</div>

		<div class="row gap-2">
			<span class="small faint font-semibold">Status:</span>
			<div class="segmented">
				<button class={selectedStatus === 'all' ? 'active' : ''} onclick={() => selectedStatus = 'all'}>
					<BellRing size={13} />
					<span>All</span>
				</button>
				<button class={selectedStatus === 'delivered' ? 'active' : ''} onclick={() => selectedStatus = 'delivered'}>
					<CheckCircle2 size={13} />
					<span>Delivered</span>
				</button>
				<button class={selectedStatus === 'sent' ? 'active' : ''} onclick={() => selectedStatus = 'sent'}>
					<Send size={13} />
					<span>Sent</span>
				</button>
				<button class={selectedStatus === 'pending' ? 'active' : ''} onclick={() => selectedStatus = 'pending'}>
					<Clock size={13} />
					<span>Pending</span>
				</button>
				<button class={selectedStatus === 'failed' ? 'active' : ''} onclick={() => selectedStatus = 'failed'}>
					<XCircle size={13} />
					<span>Failed</span>
				</button>
			</div>
		</div>
	</div>
</div>

<!-- Notification Logs Table -->
<section class="card">
	<div class="card-head">
		<h2>
			<BellRing size={16} />
			Dispatched Notification Records
		</h2>
		<span class="badge badge-neutral">{filteredRows.length} shown</span>
	</div>

	<div class="table-wrap">
		{#if filteredRows.length === 0}
			<div class="empty-state" style="padding: var(--sp-10);">
				<div class="empty-icon"><BellRing /></div>
				<h3>No notifications recorded</h3>
				<p>Run the reminder scan to queue pre-visit SMS, WhatsApp, and email alerts for upcoming appointments.</p>
				<form method="POST" action="/reminders?/dispatch">
					<button class="btn btn-primary" type="submit">
						<Play size={14} /> <span>Run Reminder Scan</span>
					</button>
				</form>
			</div>
		{:else}
			<table>
				<thead>
					<tr>
						<th>Created At</th>
						<th>Customer / Recipient</th>
						<th>Channel</th>
						<th>Template</th>
						<th>Sent Destination</th>
						<th>Status</th>
						<th>Delivered Time</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredRows as n}
						{@const sm = statusMeta(n.status)}
						{@const ChanIcon = channelIcon(n.channel)}
						{@const StatusIcon = sm.Icon}
						<tr>
							<td class="small muted mono">{fmt(n.createdAt)}</td>
							<td>
								<div class="cell-strong">
									{n.ownerName ? `${n.ownerName} ${n.ownerLast ?? ''}` : 'Customer'}
								</div>
							</td>
							<td>
								<span class="badge badge-neutral">
									<ChanIcon size={12} />
									{n.channel}
								</span>
							</td>
							<td class="small font-semibold">
								{templateLabel(n.template)}
							</td>
							<td class="small mono">{n.to}</td>
							<td>
								<span class="badge {sm.cls}">
									<StatusIcon size={12} />
									{n.status}
								</span>
							</td>
							<td class="small muted mono">{fmt(n.sentAt)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</section>
