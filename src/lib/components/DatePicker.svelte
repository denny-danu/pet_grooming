<script lang="ts">
	import {
		Calendar as CalendarIcon,
		ChevronLeft,
		ChevronRight,
		X,
		Sparkles,
		Clock
	} from "@lucide/svelte";

	let {
		value = $bindable(""),
		id,
		name,
		label,
		placeholder = "Select date...",
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
		"January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December"
	];
	const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

	const formattedDisplay = $derived(() => {
		if (!value) return "";
		const d = new Date(value + "T00:00:00");
		if (isNaN(d.getTime())) return value;
		return d.toLocaleDateString(undefined, {
			weekday: "short",
			month: "short",
			day: "numeric",
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
		const popoverHeight = 350; // height of popover
		const popoverWidth = 310;
		const spaceBelow = window.innerHeight - rect.bottom;
		const spaceAbove = rect.top;

		// Dynamic vertical placement: if space below is too small and space above is larger, open TOP
		if (spaceBelow < popoverHeight && spaceAbove > spaceBelow) {
			placement = "top";
		} else {
			placement = "bottom";
		}

		// Dynamic horizontal alignment: if close to right edge, align right
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

<div class="custom-datepicker-container {isOpen ? 'is-active-container' : ''}">
	{#if label}
		<label for={id} class="datepicker-label">
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
		class="datepicker-trigger {isOpen ? 'is-open' : ''} {value ? 'has-value' : ''}"
		onclick={toggleOpen}
		onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleOpen(); } }}
		role="button"
		tabindex="0"
		aria-expanded={isOpen}
		aria-haspopup="dialog"
	>
		<span class="trigger-icon">
			<CalendarIcon size={16} />
		</span>

		<span class="trigger-text {value ? 'selected-text' : 'placeholder-text'}">
			{formattedDisplay() || placeholder}
		</span>

		{#if value}
			<button
				type="button"
				class="clear-btn"
				onclick={(e) => {
					e.stopPropagation();
					value = "";
					if (onchange) onchange("");
				}}
				title="Clear date"
			>
				<X size={13} />
			</button>
		{/if}
	</div>

	<!-- Popover Calendar with Dynamic Viewport Placement -->
	{#if isOpen}
		<div
			class="datepicker-popover placement-{placement} align-{align}"
			bind:this={popoverRef}
			role="dialog"
			tabindex="-1"
			aria-label="Calendar date picker"
		>
			<!-- Quick Presets Toolbar -->
			{#if showPresets}
				<div class="popover-presets">
					<button
						type="button"
						class="pop-preset-btn"
						onclick={() => selectPreset(0)}
					>
						Today
					</button>
					<button
						type="button"
						class="pop-preset-btn"
						onclick={() => selectPreset(1)}
					>
						Tomorrow
					</button>
					<button
						type="button"
						class="pop-preset-btn"
						onclick={() => selectPreset(2)}
					>
						+2 Days
					</button>
					<button
						type="button"
						class="pop-preset-btn"
						onclick={() => selectPreset(7)}
					>
						+1 Week
					</button>
				</div>
			{/if}

			<!-- Month & Year Navigator -->
			<div class="calendar-nav">
				<button
					type="button"
					class="nav-btn"
					onclick={prevMonth}
					aria-label="Previous month"
				>
					<ChevronLeft size={16} />
				</button>

				<div class="month-year-title">
					<span class="month-name">{monthNames[viewMonth]}</span>
					<span class="year-name">{viewYear}</span>
				</div>

				<button
					type="button"
					class="nav-btn"
					onclick={nextMonth}
					aria-label="Next month"
				>
					<ChevronRight size={16} />
				</button>
			</div>

			<!-- Weekdays Row -->
			<div class="weekdays-grid">
				{#each dayNames as dn}
					<span class="weekday-header">{dn}</span>
				{/each}
			</div>

			<!-- Days Matrix Grid (42 cells) -->
			<div class="days-grid">
				{#each calendarDays() as d}
					<button
						type="button"
						class="day-cell {d.isCurrentMonth ? 'in-month' : 'out-month'} {d.isToday ? 'is-today' : ''} {d.isSelected ? 'is-selected' : ''}"
						disabled={d.isDisabled}
						onclick={() => selectDate(d.dateStr)}
					>
						<span class="day-number">{d.dayNum}</span>
					</button>
				{/each}
			</div>

			<!-- Footer quick actions -->
			<div class="popover-footer">
				<button
					type="button"
					class="btn-footer-today"
					onclick={() => {
						const now = new Date();
						viewYear = now.getFullYear();
						viewMonth = now.getMonth();
						selectDate(now.toISOString().slice(0, 10));
					}}
				>
					<Sparkles size={12} />
					<span>Jump to Today</span>
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.custom-datepicker-container {
		position: relative;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.custom-datepicker-container.is-active-container {
		z-index: 999;
	}

	.datepicker-label {
		font-size: 12.5px;
		font-weight: 600;
		color: var(--ink-2);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.datepicker-trigger {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
		height: 40px;
		min-height: 40px;
		padding: 0 12px 0 38px;
		border-radius: var(--r-md);
		border: 1px solid var(--border-strong);
		background: var(--surface);
		color: var(--ink);
		font-size: 13.5px;
		cursor: pointer;
		text-align: left;
		transition: all 140ms ease;
		box-shadow: var(--shadow-xs);
		user-select: none;
	}

	.datepicker-trigger:hover {
		border-color: var(--faint);
		background: var(--surface-2);
	}

	.datepicker-trigger.is-open,
	.datepicker-trigger:focus-visible {
		border-color: var(--primary);
		box-shadow: var(--focus);
		background: var(--surface);
		outline: none;
	}

	.trigger-icon {
		position: absolute;
		left: 12px;
		top: 50%;
		transform: translateY(-50%);
		color: var(--primary);
		pointer-events: none;
		display: grid;
		place-items: center;
	}

	.trigger-text {
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-family: inherit;
	}

	.selected-text {
		color: var(--ink);
		font-weight: 600;
	}

	.placeholder-text {
		color: var(--faint);
	}

	.clear-btn {
		background: var(--surface-3);
		border: none;
		color: var(--muted);
		width: 20px;
		height: 20px;
		border-radius: var(--r-full);
		display: grid;
		place-items: center;
		cursor: pointer;
		padding: 0;
		margin-left: 6px;
		transition: all 120ms ease;
	}

	.clear-btn:hover {
		background: var(--danger-bg);
		color: var(--danger);
	}

	/* Floating Popover with Dynamic Positioning */
	.datepicker-popover {
		position: absolute;
		width: 308px;
		background: #ffffff !important;
		background-color: #ffffff !important;
		border: 1px solid var(--border);
		border-radius: var(--r-xl);
		box-shadow: 0 20px 40px -8px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.08);
		padding: 14px;
		z-index: 9999;
	}

	/* Pop Out Below */
	.datepicker-popover.placement-bottom {
		top: calc(100% + 6px);
		bottom: auto;
		animation: popInBottom 140ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	/* Pop Out Above (when trigger is near bottom of viewport) */
	.datepicker-popover.placement-top {
		bottom: calc(100% + 6px);
		top: auto;
		animation: popInTop 140ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.datepicker-popover.align-left {
		left: 0;
		right: auto;
	}

	.datepicker-popover.align-right {
		right: 0;
		left: auto;
	}

	.popover-presets {
		display: flex;
		align-items: center;
		gap: 4px;
		padding-bottom: 10px;
		margin-bottom: 10px;
		border-bottom: 1px solid var(--border-subtle);
		overflow-x: auto;
	}

	.pop-preset-btn {
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--r-full);
		padding: 3px 8px;
		font-size: 11px;
		font-weight: 600;
		color: var(--ink-2);
		cursor: pointer;
		white-space: nowrap;
		transition: all 120ms ease;
	}

	.pop-preset-btn:hover {
		background: var(--primary-soft);
		border-color: var(--primary-border);
		color: var(--primary);
	}

	.calendar-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 10px;
	}

	.nav-btn {
		width: 28px;
		height: 28px;
		border-radius: var(--r-md);
		background: var(--surface-2);
		border: 1px solid var(--border);
		color: var(--ink-2);
		display: grid;
		place-items: center;
		cursor: pointer;
		transition: all 120ms ease;
	}

	.nav-btn:hover {
		background: var(--primary-soft);
		color: var(--primary);
		border-color: var(--primary-border);
	}

	.month-year-title {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 13.5px;
		font-weight: 700;
		color: var(--ink);
	}

	.year-name {
		color: var(--primary);
	}

	.weekdays-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 2px;
		margin-bottom: 4px;
		text-align: center;
	}

	.weekday-header {
		font-size: 11px;
		font-weight: 700;
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		padding: 4px 0;
	}

	.days-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 3px;
	}

	.day-cell {
		width: 100%;
		height: 32px;
		border-radius: var(--r-md);
		border: 1px solid transparent;
		background: transparent;
		color: var(--ink);
		font-size: 12px;
		font-weight: 600;
		display: grid;
		place-items: center;
		cursor: pointer;
		transition: all 110ms ease;
		padding: 0;
	}

	.day-cell.out-month {
		color: var(--faint-2);
		font-weight: 400;
	}

	.day-cell.in-month:hover {
		background: var(--primary-soft);
		color: var(--primary);
	}

	.day-cell.is-today {
		border-color: var(--primary-border);
		background: var(--surface-2);
		color: var(--primary);
		font-weight: 700;
	}

	.day-cell.is-selected {
		background: var(--primary) !important;
		color: #ffffff !important;
		font-weight: 700;
		box-shadow: 0 2px 6px rgba(79, 70, 229, 0.4);
	}

	.day-cell[disabled] {
		opacity: 0.25;
		cursor: not-allowed;
		pointer-events: none;
	}

	.popover-footer {
		margin-top: 10px;
		padding-top: 8px;
		border-top: 1px solid var(--border-subtle);
		display: flex;
		justify-content: center;
	}

	.btn-footer-today {
		background: transparent;
		border: none;
		color: var(--primary);
		font-size: 11.5px;
		font-weight: 700;
		display: inline-flex;
		align-items: center;
		gap: 5px;
		cursor: pointer;
		padding: 3px 8px;
		border-radius: var(--r-md);
		transition: all 120ms ease;
	}

	.btn-footer-today:hover {
		background: var(--primary-soft);
	}

	@keyframes popInBottom {
		from {
			opacity: 0;
			transform: scale(0.96) translateY(-6px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	@keyframes popInTop {
		from {
			opacity: 0;
			transform: scale(0.96) translateY(6px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}
</style>
