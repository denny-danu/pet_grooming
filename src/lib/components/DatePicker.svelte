<script lang="ts">
	import {
		Calendar as CalendarIcon,
		ChevronLeft,
		ChevronRight,
		X,
		Sparkles
	} from "@lucide/svelte";

	let {
		value = $bindable(""),
		id,
		name,
		label,
		placeholder = "Pilih tanggal...",
		min,
		max,
		required = false,
		showPresets = true,
		onchange
	}: {
		value?: string;
		id?: string;
		name?: string;
		label?: string;
		placeholder?: string;
		min?: string;
		max?: string;
		required?: boolean;
		showPresets?: boolean;
		onchange?: (val: string) => void;
	} = $props();

	let isOpen = $state(false);
	let popoverRef: HTMLDivElement | undefined = $state();
	let triggerRef: HTMLDivElement | undefined = $state();

	// Dynamic placement state
	let placement = $state<"bottom" | "top">("bottom");
	let align = $state<"left" | "right">("left");

	// Active month being viewed in calendar
	let viewYear = $state(new Date().getFullYear());
	let viewMonth = $state(new Date().getMonth()); // 0-indexed

	// Sync view month/year when value changes
	$effect(() => {
		if (value) {
			const d = new Date(value);
			if (!isNaN(d.getTime())) {
				viewYear = d.getFullYear();
				viewMonth = d.getMonth();
			}
		}
	});

	const monthNames = [
		"Januari", "Februari", "Maret", "April", "Mei", "Juni",
		"Juli", "Agustus", "September", "Oktober", "November", "Desember"
	];
	const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

	const formattedDisplay = $derived(() => {
		if (!value) return "";
		const d = new Date(value + "T00:00:00");
		if (isNaN(d.getTime())) return value;
		return d.toLocaleDateString("id-ID", {
			weekday: "short",
			day: "numeric",
			month: "short",
			year: "numeric"
		});
	});

	// Compute days matrix for the view month (42 days)
	const calendarDays = $derived(() => {
		const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
		const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);
		const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun
		const daysInMonth = lastDayOfMonth.getDate();

		const days: {
			dateStr: string;
			dayNum: number;
			isCurrentMonth: boolean;
			isToday: boolean;
			isSelected: boolean;
			isDisabled: boolean;
		}[] = [];

		const todayStr = new Date().toISOString().slice(0, 10);

		// Prior month trailing days
		const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();
		for (let i = startDayOfWeek - 1; i >= 0; i--) {
			const dayNum = prevMonthLastDay - i;
			const d = new Date(viewYear, viewMonth - 1, dayNum);
			const dateStr = d.toISOString().slice(0, 10);
			days.push({
				dateStr,
				dayNum,
				isCurrentMonth: false,
				isToday: dateStr === todayStr,
				isSelected: dateStr === value,
				isDisabled: checkDisabled(dateStr)
			});
		}

		// Current month days
		for (let i = 1; i <= daysInMonth; i++) {
			const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
			days.push({
				dateStr,
				dayNum: i,
				isCurrentMonth: true,
				isToday: dateStr === todayStr,
				isSelected: dateStr === value,
				isDisabled: checkDisabled(dateStr)
			});
		}

		// Next month leading days to complete grid of 42
		const remaining = 42 - days.length;
		for (let i = 1; i <= remaining; i++) {
			const d = new Date(viewYear, viewMonth + 1, i);
			const dateStr = d.toISOString().slice(0, 10);
			days.push({
				dateStr,
				dayNum: i,
				isCurrentMonth: false,
				isToday: dateStr === todayStr,
				isSelected: dateStr === value,
				isDisabled: checkDisabled(dateStr)
			});
		}

		return days;
	});

	function checkDisabled(dateStr: string): boolean {
		if (min && dateStr < min) return true;
		if (max && dateStr > max) return true;
		return false;
	}

	function updatePlacement() {
		if (!triggerRef) return;
		const rect = triggerRef.getBoundingClientRect();
		const popoverHeight = 360;
		const popoverWidth = 320;
		const spaceBelow = window.innerHeight - rect.bottom;
		const spaceAbove = rect.top;

		if (spaceBelow < popoverHeight && spaceAbove > spaceBelow) {
			placement = "top";
		} else {
			placement = "bottom";
		}

		const spaceRight = window.innerWidth - rect.left;
		if (spaceRight < popoverWidth) {
			align = "right";
		} else {
			align = "left";
		}
	}

	function toggleOpen() {
		if (!isOpen) {
			updatePlacement();
			isOpen = true;
		} else {
			isOpen = false;
		}
	}

	function prevMonth() {
		if (viewMonth === 0) {
			viewMonth = 11;
			viewYear -= 1;
		} else {
			viewMonth -= 1;
		}
	}

	function nextMonth() {
		if (viewMonth === 11) {
			viewMonth = 0;
			viewYear += 1;
		} else {
			viewMonth += 1;
		}
	}

	function selectDate(dateStr: string) {
		value = dateStr;
		isOpen = false;
		if (onchange) onchange(dateStr);
	}

	function selectPreset(daysFromToday: number) {
		const d = new Date();
		d.setDate(d.getDate() + daysFromToday);
		const dateStr = d.toISOString().slice(0, 10);
		selectDate(dateStr);
	}

	function handleWindowClick(e: MouseEvent) {
		if (isOpen && popoverRef && triggerRef) {
			const target = e.target as Node;
			if (!popoverRef.contains(target) && !triggerRef.contains(target)) {
				isOpen = false;
			}
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Escape" && isOpen) {
			isOpen = false;
		}
	}
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleKeydown} onscroll={updatePlacement} onresize={updatePlacement} />

<div class="neo-datepicker-wrap {isOpen ? 'is-active' : ''}">
	{#if label}
		<label for={id} class="neo-datepicker-label">
			<span>{label}</span>
			{#if required}<span class="req">*</span>{/if}
		</label>
	{/if}

	<!-- Hidden input for standard SvelteKit form submissions -->
	{#if name}
		<input type="hidden" {name} {value} {required} />
	{/if}

	<!-- Trigger Container -->
	<div
		{id}
		bind:this={triggerRef}
		class="neo-datepicker-trigger {isOpen ? 'is-open' : ''} {value ? 'has-val' : ''}"
		onclick={toggleOpen}
		onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleOpen(); } }}
		role="button"
		tabindex="0"
		aria-expanded={isOpen}
		aria-haspopup="dialog"
	>
		<span class="neo-trigger-icon">
			<CalendarIcon size={16} strokeWidth={2.4} />
		</span>

		<span class="neo-trigger-text {value ? 'is-filled' : 'is-placeholder'}">
			{formattedDisplay() || placeholder}
		</span>

		{#if value}
			<button
				type="button"
				class="neo-clear-btn"
				onclick={(e) => {
					e.stopPropagation();
					value = "";
					if (onchange) onchange("");
				}}
				title="Hapus tanggal"
				aria-label="Hapus tanggal"
			>
				<X size={12} strokeWidth={2.8} />
			</button>
		{/if}
	</div>

	<!-- Popover Calendar -->
	{#if isOpen}
		<div
			class="neo-calendar-popover placement-{placement} align-{align}"
			bind:this={popoverRef}
			role="dialog"
			tabindex="-1"
			aria-label="Kalender pemilih tanggal"
		>
			<!-- Presets Toolbar -->
			{#if showPresets}
				<div class="neo-pop-presets">
					<button type="button" class="preset-pill-btn" onclick={() => selectPreset(0)}>[ Hari Ini ]</button>
					<button type="button" class="preset-pill-btn" onclick={() => selectPreset(1)}>[ Besok ]</button>
					<button type="button" class="preset-pill-btn" onclick={() => selectPreset(2)}>[ +2 Hari ]</button>
					<button type="button" class="preset-pill-btn" onclick={() => selectPreset(7)}>[ +7 Hari ]</button>
				</div>
			{/if}

			<!-- Month & Year Navigator Header -->
			<div class="neo-cal-header">
				<button
					type="button"
					class="cal-nav-btn"
					onclick={prevMonth}
					aria-label="Bulan sebelumnya"
					title="Bulan sebelumnya"
				>
					<ChevronLeft size={16} strokeWidth={2.6} />
				</button>

				<div class="cal-title-box">
					<span class="m-name">{monthNames[viewMonth]}</span>
					<span class="y-name">{viewYear}</span>
				</div>

				<button
					type="button"
					class="cal-nav-btn"
					onclick={nextMonth}
					aria-label="Bulan berikutnya"
					title="Bulan berikutnya"
				>
					<ChevronRight size={16} strokeWidth={2.6} />
				</button>
			</div>

			<!-- Weekdays Grid -->
			<div class="neo-weekdays-row">
				{#each dayNames as dn}
					<span class="weekday-tag">{dn}</span>
				{/each}
			</div>

			<!-- Days Grid (42 cells) -->
			<div class="neo-days-grid">
				{#each calendarDays() as d}
					<button
						type="button"
						class="neo-day-btn"
						class:in-month={d.isCurrentMonth}
						class:out-month={!d.isCurrentMonth}
						class:is-today={d.isToday}
						class:is-selected={d.isSelected}
						disabled={d.isDisabled}
						onclick={() => selectDate(d.dateStr)}
					>
						<span>{d.dayNum}</span>
					</button>
				{/each}
			</div>

			<!-- Footer -->
			<div class="neo-cal-footer">
				<button
					type="button"
					class="neo-today-shortcut"
					onclick={() => {
						const now = new Date();
						viewYear = now.getFullYear();
						viewMonth = now.getMonth();
						selectDate(now.toISOString().slice(0, 10));
					}}
				>
					<Sparkles size={13} />
					<span>Lompat ke Hari Ini</span>
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.neo-datepicker-wrap {
		position: relative;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.neo-datepicker-wrap.is-active {
		z-index: 999;
	}

	.neo-datepicker-label {
		font-family: "JetBrains Mono", monospace;
		font-size: 11px;
		font-weight: 850;
		color: #0f172a;
		letter-spacing: 0.04em;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.req {
		color: #ef4444;
	}

	/* Trigger */
	.neo-datepicker-trigger {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
		height: 42px;
		min-height: 42px;
		padding: 0 12px 0 38px;
		border: 2px solid #0f172a;
		border-radius: 6px;
		background: #ffffff;
		color: #0f172a;
		font-size: 13px;
		font-weight: 750;
		cursor: pointer;
		text-align: left;
		box-shadow: 2px 2px 0px #0f172a;
		transition: all 100ms ease;
		user-select: none;
	}

	.neo-datepicker-trigger:hover {
		background: #fefce8;
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px #0f172a;
	}

	.neo-datepicker-trigger.is-open {
		border-color: #4f46e5;
		background: #fefce8;
		box-shadow: 3px 3px 0px #4f46e5;
	}

	.neo-trigger-icon {
		position: absolute;
		left: 12px;
		top: 50%;
		transform: translateY(-50%);
		color: #4f46e5;
		pointer-events: none;
		display: grid;
		place-items: center;
	}

	.neo-trigger-text.is-placeholder {
		color: #64748b;
		font-weight: 500;
	}

	.neo-trigger-text.is-filled {
		color: #0f172a;
		font-weight: 800;
	}

	.neo-clear-btn {
		margin-left: auto;
		width: 20px;
		height: 20px;
		border-radius: 4px;
		background: #facc15;
		border: 1.5px solid #0f172a;
		color: #0f172a;
		display: grid;
		place-items: center;
		cursor: pointer;
		box-shadow: 1px 1px 0px #0f172a;
	}

	.neo-clear-btn:hover {
		background: #ef4444;
		color: #ffffff;
	}

	/* Popover Window */
	.neo-calendar-popover {
		position: absolute;
		z-index: 1000;
		width: 310px;
		background: #ffffff;
		border: 2.5px solid #0f172a;
		border-radius: 10px;
		padding: 16px;
		box-shadow: 6px 6px 0px #0f172a;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.neo-calendar-popover.placement-bottom {
		top: calc(100% + 8px);
	}

	.neo-calendar-popover.placement-top {
		bottom: calc(100% + 8px);
	}

	.neo-calendar-popover.align-left {
		left: 0;
	}

	.neo-calendar-popover.align-right {
		right: 0;
	}

	/* Presets Toolbar */
	.neo-pop-presets {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		padding-bottom: 10px;
		border-bottom: 2px dashed #cbd5e1;
	}

	.preset-pill-btn {
		font-family: "JetBrains Mono", monospace;
		font-size: 10.5px;
		font-weight: 850;
		padding: 3px 7px;
		border: 1.5px solid #0f172a;
		border-radius: 4px;
		background: #faf8f5;
		color: #0f172a;
		cursor: pointer;
		box-shadow: 1px 1px 0px #0f172a;
		transition: all 80ms ease;
	}

	.preset-pill-btn:hover {
		background: #facc15;
		transform: translate(-1px, -1px);
	}

	/* Header */
	.neo-cal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.cal-nav-btn {
		width: 28px;
		height: 28px;
		border: 1.5px solid #0f172a;
		border-radius: 5px;
		background: #f1f5f9;
		color: #0f172a;
		display: grid;
		place-items: center;
		cursor: pointer;
		box-shadow: 1.5px 1.5px 0px #0f172a;
	}

	.cal-nav-btn:hover {
		background: #fef08a;
		transform: translate(-1px, -1px);
	}

	.cal-title-box {
		display: flex;
		align-items: center;
		gap: 6px;
		font-family: "Cabinet Grotesk", "Outfit", sans-serif;
		font-size: 14.5px;
		font-weight: 950;
		color: #0f172a;
		background: #fef08a;
		border: 1.5px solid #0f172a;
		padding: 2px 10px;
		border-radius: 5px;
		box-shadow: 2px 2px 0px #0f172a;
	}

	/* Weekdays */
	.neo-weekdays-row {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 2px;
		text-align: center;
	}

	.weekday-tag {
		font-family: "JetBrains Mono", monospace;
		font-size: 10px;
		font-weight: 900;
		color: #64748b;
	}

	/* Days Matrix */
	.neo-days-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 3px;
	}

	.neo-day-btn {
		height: 32px;
		display: grid;
		place-items: center;
		border: 1px solid transparent;
		border-radius: 4px;
		background: transparent;
		font-size: 12px;
		font-weight: 750;
		color: #0f172a;
		cursor: pointer;
		transition: all 80ms ease;
	}

	.neo-day-btn.out-month {
		color: #cbd5e1;
		font-weight: 500;
	}

	.neo-day-btn.in-month:hover:not(:disabled) {
		background: #fef08a;
		border-color: #0f172a;
		box-shadow: 1.5px 1.5px 0px #0f172a;
	}

	.neo-day-btn.is-today {
		border: 1.5px solid #0f172a;
		background: #eff6ff;
	}

	.neo-day-btn.is-selected {
		background: #4f46e5 !important;
		color: #ffffff !important;
		border: 1.5px solid #0f172a !important;
		box-shadow: 2px 2px 0px #0f172a !important;
		font-weight: 900;
	}

	.neo-day-btn:disabled {
		opacity: 0.25;
		cursor: not-allowed;
		text-decoration: line-through;
	}

	/* Footer */
	.neo-cal-footer {
		padding-top: 8px;
		border-top: 1.5px dashed #cbd5e1;
	}

	.neo-today-shortcut {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 6px;
		border: 1.5px solid #0f172a;
		border-radius: 5px;
		background: #faf8f5;
		color: #0f172a;
		font-family: "JetBrains Mono", monospace;
		font-size: 10.5px;
		font-weight: 850;
		cursor: pointer;
		box-shadow: 1.5px 1.5px 0px #0f172a;
	}

	.neo-today-shortcut:hover {
		background: #fef08a;
		transform: translate(-1px, -1px);
	}
</style>
