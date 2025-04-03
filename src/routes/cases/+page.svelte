<script lang="ts">
	import { onMount } from 'svelte';

	interface Case {
		type: 'Follow-ups' | 'Strikes';
		day: string;
		severity: 'B' | 'C';
	}

	interface CasesData {
		'Follow-ups': Record<string, Case>;
		Strikes: Record<string, Case>;
	}

	// Alert system
	let alertMessage: string = '';
	type AlertType = 'success' | 'error' | 'warning';
	let alertType: AlertType = 'success';
	let alertTimeout: ReturnType<typeof setTimeout> | null = null;

	// Modal system
	let showDeleteModal = false;
	let modalCaseNumber = '';
	let modalCaseType: 'Follow-ups' | 'Strikes' = 'Follow-ups';

	// Case data
	let casesData: CasesData = {
		'Follow-ups': {},
		Strikes: {}
	};

	let searchQuery = '';
	let filteredCasesData: CasesData = {
		'Follow-ups': {},
		Strikes: {}
	};

	// UI state
	let screenSize: 'small' | 'medium' | 'large' = 'large';
	let activeTab: 'Follow-ups' | 'Strikes' = 'Follow-ups';

	const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

	function getSchedule(startDay: string): { first: string; second: string; third: string } {
		const weekdayIndices: Record<string, number> = {
			Monday: 0,
			Tuesday: 1,
			Wednesday: 2,
			Thursday: 3,
			Friday: 4
		};

		const startDayIndex = weekdayIndices[startDay];
		const firstFollowUpIndex = (startDayIndex + 2) % 5;
		const secondFollowUpIndex = (firstFollowUpIndex + 2) % 5;
		const thirdFollowUpIndex = (secondFollowUpIndex + 2) % 5;

		return {
			first: weekdays[firstFollowUpIndex],
			second: weekdays[secondFollowUpIndex],
			third: weekdays[thirdFollowUpIndex]
		};
	}

	function loadCases(): void {
		const storedCases = localStorage.getItem('cases');
		if (storedCases) {
			casesData = JSON.parse(storedCases);
			filterCases();
		}
	}

	function editCase(caseType: 'Follow-ups' | 'Strikes', caseNumber: string): void {
		window.location.href = `/?edit=${caseNumber}`;
	}

	function deleteCase(caseType: 'Follow-ups' | 'Strikes', caseNumber: string): void {
		modalCaseNumber = caseNumber;
		modalCaseType = caseType;
		showDeleteModal = true;
	}

	function confirmDelete(): void {
		delete casesData[modalCaseType][modalCaseNumber];
		localStorage.setItem('cases', JSON.stringify(casesData));
		loadCases();

		showAlert(`Case ${modalCaseNumber} deleted successfully!`, 'success');
		showDeleteModal = false;
	}

	function closeModal(): void {
		showDeleteModal = false;
	}

	function filterCases(): void {
		if (!searchQuery.trim()) {
			filteredCasesData = { ...casesData };
			return;
		}

		const query = searchQuery.toLowerCase().trim();

		const filteredFollowUps: Record<string, Case> = {};
		Object.entries(casesData['Follow-ups']).forEach(([caseNumber, caseData]) => {
			if (
				caseNumber.toLowerCase().includes(query) ||
				caseData.day.toLowerCase().includes(query) ||
				caseData.severity.toLowerCase().includes(query)
			) {
				filteredFollowUps[caseNumber] = caseData;
			}
		});

		const filteredStrikes: Record<string, Case> = {};
		Object.entries(casesData['Strikes']).forEach(([caseNumber, caseData]) => {
			if (
				caseNumber.toLowerCase().includes(query) ||
				caseData.day.toLowerCase().includes(query) ||
				caseData.severity.toLowerCase().includes(query)
			) {
				filteredStrikes[caseNumber] = caseData;
			}
		});

		filteredCasesData = {
			'Follow-ups': filteredFollowUps,
			Strikes: filteredStrikes
		};
	}

	function handleSearchInput(): void {
		filterCases();
	}

	function clearSearch(): void {
		searchQuery = '';
		filterCases();
	}

	function showAlert(message: string, type: AlertType): void {
		// Clear any existing timeout
		if (alertTimeout) {
			clearTimeout(alertTimeout);
		}

		alertMessage = message;
		alertType = type;

		// Auto-dismiss after 5 seconds
		alertTimeout = setTimeout(() => {
			alertMessage = '';
		}, 5000);
	}

	function updateScreenSize(): void {
		const width = window.innerWidth;
		if (width < 600) {
			screenSize = 'small';
		} else if (width < 1024) {
			screenSize = 'medium';
		} else {
			screenSize = 'large';
		}
	}

	function setActiveTab(tab: 'Follow-ups' | 'Strikes'): void {
		activeTab = tab;
	}

	onMount(() => {
		loadCases();
		updateScreenSize();

		// Add resize listener
		window.addEventListener('resize', updateScreenSize);

		// Clean up the listener when component is destroyed
		return () => {
			window.removeEventListener('resize', updateScreenSize);
			if (alertTimeout) {
				clearTimeout(alertTimeout);
			}
		};
	});
</script>

<!-- Modal Dialog -->
{#if showDeleteModal}
	<div
		class="modal-overlay"
		on:click={closeModal}
		role="button"
		tabindex="0"
		on:keydown={(e) => e.key === 'Enter' && closeModal()}
	>
		<div class="modal-content" on:click|stopPropagation role="none">
			<h3>Confirm Deletion</h3>
			<p>Are you sure you want to permanently delete case <strong>{modalCaseNumber}</strong>?</p>
			<div class="modal-actions">
				<button class="secondary" on:click={closeModal}>Cancel</button>
				<button class="contrast" on:click={confirmDelete}>Delete Case</button>
			</div>
		</div>
	</div>
{/if}

<!-- Main Content -->
<section>
	<!-- Alert Container -->
	{#if alertMessage}
		<article class="notification {alertType}" role="alert">
			<button aria-label="Close" class="close" on:click|preventDefault={() => (alertMessage = '')}
			></button>
			{alertMessage}
		</article>
	{/if}

	<!-- Header and Navigation -->
	<div class="header-container">
		<h2>Case Management</h2>
		<a href="/" role="button" class="outline back-button">Back to Home</a>
	</div>

	<div class="search-container">
		<input
			type="search"
			placeholder="Search cases by number, day, or severity..."
			bind:value={searchQuery}
			on:input={handleSearchInput}
		/>
		{#if searchQuery}
			<button class="outline clear-button" on:click={clearSearch}>Clear</button>
		{/if}
	</div>

	<!-- Mobile/Tablet Tabs -->
	{#if screenSize !== 'large'}
		<div class="tabs">
			<button
				class={activeTab === 'Follow-ups' ? 'active' : ''}
				on:click={() => setActiveTab('Follow-ups')}
			>
				Follow-up Cases
			</button>
			<button
				class={activeTab === 'Strikes' ? 'active' : ''}
				on:click={() => setActiveTab('Strikes')}
			>
				Strike Cases
			</button>
		</div>
	{/if}

	<!-- Follow-up Cases -->
	{#if screenSize === 'large' || activeTab === 'Follow-ups'}
		<div class="case-section">
			<h3>Follow-up Cases</h3>
			{#if Object.keys(filteredCasesData['Follow-ups']).length === 0}
				<p><em>No follow-up cases found{searchQuery ? ' matching your search' : ''}.</em></p>
			{:else}
				<div class="overflow-auto">
					<table class={screenSize === 'small' ? 'compact-table' : ''}>
						<thead>
							<tr>
								<th>Case Number</th>
								<th>Last Contact</th>
								<th>Severity</th>
								{#if screenSize !== 'small'}
									<th>1st Follow-up</th>
									<th>2nd Follow-up</th>
									<th>3rd Follow-up</th>
								{/if}
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each Object.entries(filteredCasesData['Follow-ups']) as [caseNumber, caseData]}
								{@const schedule = getSchedule(caseData.day)}
								<tr>
									<td>{caseNumber}</td>
									<td>{caseData.day}</td>
									<td>{caseData.severity}</td>
									{#if screenSize !== 'small'}
										<td>{schedule.first}</td>
										<td>{schedule.second}</td>
										<td>{schedule.third}</td>
									{/if}
									<td class="action-column">
										{#if screenSize === 'small'}
											<details class="schedule-details">
												<summary>Schedule</summary>
												<div class="schedule-content">
													<p>1st: {schedule.first}</p>
													<p>2nd: {schedule.second}</p>
													<p>3rd: {schedule.third}</p>
												</div>
											</details>
										{/if}
										<div class="action-buttons">
											<button class="secondary" on:click={() => editCase('Follow-ups', caseNumber)}>
												{screenSize === 'small' ? '✏️' : 'Edit'}
											</button>
											<button
												class="contrast"
												on:click={() => deleteCase('Follow-ups', caseNumber)}
											>
												{screenSize === 'small' ? '🗑️' : 'Delete'}
											</button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Strike Cases -->
	{#if screenSize === 'large' || activeTab === 'Strikes'}
		<div class="case-section">
			<h3>Strike Cases</h3>
			{#if Object.keys(filteredCasesData['Strikes']).length === 0}
				<p><em>No strike cases found{searchQuery ? ' matching your search' : ''}.</em></p>
			{:else}
				<div class="overflow-auto">
					<table class={screenSize === 'small' ? 'compact-table' : ''}>
						<thead>
							<tr>
								<th>Case Number</th>
								<th>Last Contact</th>
								<th>Severity</th>
								{#if screenSize !== 'small'}
									<th>1st Strike</th>
									<th>2nd Strike</th>
									<th>3rd Strike</th>
								{/if}
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each Object.entries(filteredCasesData['Strikes']) as [caseNumber, caseData]}
								{@const schedule = getSchedule(caseData.day)}
								<tr>
									<td>{caseNumber}</td>
									<td>{caseData.day}</td>
									<td>{caseData.severity}</td>
									{#if screenSize !== 'small'}
										<td>{schedule.first}</td>
										<td>{schedule.second}</td>
										<td>{schedule.third} (Close)</td>
									{/if}
									<td class="action-column">
										{#if screenSize === 'small'}
											<details class="schedule-details">
												<summary>Schedule</summary>
												<div class="schedule-content">
													<p>1st: {schedule.first}</p>
													<p>2nd: {schedule.second}</p>
													<p>3rd: {schedule.third} (Close)</p>
												</div>
											</details>
										{/if}
										<div class="action-buttons">
											<button class="secondary" on:click={() => editCase('Strikes', caseNumber)}>
												{screenSize === 'small' ? '✏️' : 'Edit'}
											</button>
											<button class="contrast" on:click={() => deleteCase('Strikes', caseNumber)}>
												{screenSize === 'small' ? '🗑️' : 'Delete'}
											</button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/if}
</section>

<style>
	/* Modal Styles */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.7);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.modal-content {
		background: var(--card-background-color);
		padding: 2rem;
		border-radius: var(--border-radius);
		max-width: 500px;
		width: 90%;
		box-shadow: var(--card-box-shadow);
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 1.5rem;
	}

	/* Header and Layout */
	.header-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.header-container h2 {
		margin: 0;
	}

	.back-button {
		margin: 0;
	}

	/* Tabs for mobile/tablet */
	.tabs {
		display: flex;
		margin-bottom: 1rem;
		border-bottom: 1px solid var(--muted-border-color);
	}

	.tabs button {
		flex: 1;
		background: none;
		border: none;
		padding: 0.75rem;
		margin: 0;
		border-radius: 0;
		font-weight: 600;
		cursor: pointer;
		color: var(--muted-color);
		border-bottom: 3px solid transparent;
	}

	.tabs button.active {
		color: var(--primary);
		border-bottom: 3px solid var(--primary);
	}

	/* Case sections */
	.case-section {
		margin-bottom: 2rem;
	}

	/* Search and other form elements */
	.search-container {
		margin-bottom: 1.5rem;
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.search-container input {
		flex: 1;
		min-width: 200px;
	}

	.search-container button {
		margin-bottom: 0;
	}

	/* Table styles */
	.overflow-auto {
		overflow-x: auto;
		border-radius: var(--border-radius);
		border: 1px solid var(--muted-border-color);
	}

	table {
		margin-bottom: 0;
	}

	/* Compact tables for small screens */
	.compact-table th,
	.compact-table td {
		padding: 0.5rem;
		font-size: 0.9rem;
	}

	.action-column {
		min-width: 100px;
	}

	.action-buttons {
		display: flex;
		gap: 0.5rem;
	}

	/* Schedule dropdown for mobile */
	.schedule-details {
		margin-bottom: 0.5rem;
	}

	.schedule-details summary {
		cursor: pointer;
		color: var(--primary);
		font-weight: 500;
	}

	.schedule-content {
		background: var(--card-sectionning-background-color);
		padding: 0.5rem;
		border-radius: var(--border-radius);
		margin-top: 0.25rem;
	}

	.schedule-content p {
		margin: 0.25rem 0;
	}

	/* Notification/Alert styles */
	.notification {
		margin-bottom: 1rem;
		position: relative;
		padding-right: 2.5rem;
		animation: fadeIn 0.3s;
	}

	.notification.success {
		background-color: var(--form-element-valid-focus-color);
		border-color: var(--form-element-valid-border-color);
	}

	.notification.error {
		background-color: var(--form-element-invalid-focus-color);
		border-color: var(--form-element-invalid-border-color);
	}

	.notification.warning {
		background-color: #fff3cd;
		border-color: #ffecb5;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.close {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0;
	}

	.close::after {
		content: '×';
		font-size: 1.25rem;
		line-height: 1;
	}

	/* Media queries already handled by screenSize reactive variable */
</style>
