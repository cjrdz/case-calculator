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

		alertMessage = `Case ${modalCaseNumber} deleted successfully!`;
		alertType = 'success';
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

	onMount(() => {
		loadCases();
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

	<h2>Case Management</h2>

	<div class="search-container">
		<input
			type="search"
			placeholder="Search cases by number, day, or severity..."
			bind:value={searchQuery}
			on:input={handleSearchInput}
		/>
		{#if searchQuery}
			<button class="outline" on:click={clearSearch}>Clear</button>
		{/if}
	</div>

	<h3>Follow-up Cases</h3>
	{#if Object.keys(filteredCasesData['Follow-ups']).length === 0}
		<p><em>No follow-up cases found{searchQuery ? ' matching your search' : ''}.</em></p>
	{:else}
		<div class="overflow-auto">
			<table>
				<thead>
					<tr>
						<th>Case Number</th>
						<th>Last Contact</th>
						<th>Severity</th>
						<th>1st Follow-up</th>
						<th>2nd Follow-up</th>
						<th>3rd Follow-up</th>
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
							<td>{schedule.first}</td>
							<td>{schedule.second}</td>
							<td>{schedule.third}</td>
							<td>
								<button class="secondary" on:click={() => editCase('Follow-ups', caseNumber)}
									>Edit</button
								>
								<button class="contrast" on:click={() => deleteCase('Follow-ups', caseNumber)}
									>Delete</button
								>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	<h3>Strike Cases</h3>
	{#if Object.keys(filteredCasesData['Strikes']).length === 0}
		<p><em>No strike cases found{searchQuery ? ' matching your search' : ''}.</em></p>
	{:else}
		<div class="overflow-auto">
			<table>
				<thead>
					<tr>
						<th>Case Number</th>
						<th>Last Contact</th>
						<th>Severity</th>
						<th>1st Strike</th>
						<th>2nd Strike</th>
						<th>3rd Strike</th>
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
							<td>{schedule.first}</td>
							<td>{schedule.second}</td>
							<td>{schedule.third} (Close)</td>
							<td>
								<button class="secondary" on:click={() => editCase('Strikes', caseNumber)}
									>Edit</button
								>
								<button class="contrast" on:click={() => deleteCase('Strikes', caseNumber)}
									>Delete</button
								>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	<a href="/" role="button" class="outline">Back to Home</a>
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

	/* Existing Styles */
	.overflow-auto {
		overflow-x: auto;
	}

	.search-container {
		margin-bottom: 1.5rem;
		display: flex;
		gap: 1rem;
	}

	.search-container button {
		margin-bottom: 0;
	}

	.notification {
		margin-bottom: 1rem;
		position: relative;
		padding-right: 2.5rem;
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
</style>
