<script lang="ts">
	import { onMount } from 'svelte';

	// Case data structure
	let caseNumber: string = '';
	let scheduleType: 'Follow-ups' | 'Strikes' = 'Follow-ups';
	let lastContactDay: string = 'Monday';
	let severityLevel: 'B' | 'C' = 'B';

	// Alert system state management
	let alertMessage: string = '';
	type AlertType = 'success' | 'error' | 'warning';
	let alertType: AlertType = 'success';

	// Available weekdays for selection
	const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

	// Function to reset the form fields
	function resetForm(): void {
		caseNumber = '';
		scheduleType = 'Follow-ups';
		lastContactDay = 'Monday';
		severityLevel = 'B';
	}

	// Function to add a new case
	function addCase(): void {
		if (!caseNumber) {
			alertMessage = 'Please enter a case number';
			alertType = 'error';
			return;
		}

		//   Check if the case already exists
		const storedCases = localStorage.getItem('cases');
		let cases = storedCases ? JSON.parse(storedCases) : { 'Follow-ups': {}, Strikes: {} };

		if (cases[scheduleType][caseNumber]) {
			alertMessage = `Case ${caseNumber} already exists. Use the Update button to modify it.`;
			alertType = 'error';
			return;
		}

		//   Add the new case
		cases[scheduleType][caseNumber] = {
			type: scheduleType,
			day: lastContactDay,
			severity: severityLevel
		};

		//   Store the updated cases in localStorage
		localStorage.setItem('cases', JSON.stringify(cases));
		alertMessage = `Case ${caseNumber} has been added successfully!`;
		alertType = 'success';
		//   Calculate follow-up dates
		calculateDates(caseNumber, lastContactDay, severityLevel);
		window.location.href = '/cases';
	}

	// Function to update an existing case
	function updateCase(): void {
		if (!caseNumber) {
			alertMessage = 'Please enter a case number';
			alertType = 'error';
			return;
		}

		//   Check if the case exists
		const storedCases = localStorage.getItem('cases');
		let cases = storedCases ? JSON.parse(storedCases) : { 'Follow-ups': {}, Strikes: {} };

		//   Check if the case exists in the selected schedule type
		if (!cases[scheduleType][caseNumber]) {
			alertMessage = `Case ${caseNumber} does not exist. Use the Add button to create it.`;
			alertType = 'error';
			return;
		}

		//   Update the case
		cases[scheduleType][caseNumber] = {
			type: scheduleType,
			day: lastContactDay,
			severity: severityLevel
		};

		//   Store the updated cases in localStorage
		localStorage.setItem('cases', JSON.stringify(cases));
		alertMessage = `Case ${caseNumber} has been updated successfully!`;
		alertType = 'success';

		//   Calculate follow-up dates
		calculateDates(caseNumber, lastContactDay, severityLevel);
		window.location.href = '/cases';
	}

	// Function to view all cases
	function viewCases(): void {
		window.location.href = '/cases';
	}

	// Function to calculate follow-up dates
	function calculateDates(caseNum: string, startDay: string, severity: string): void {
		const weekdayIndices: Record<string, number> = {
			Monday: 0,
			Tuesday: 1,
			Wednesday: 2,
			Thursday: 3,
			Friday: 4
		};

		//   Calculate follow-up dates based on the start day
		const startDayIndex = weekdayIndices[startDay];
		const firstFollowUpIndex = (startDayIndex + 2) % 5;
		const secondFollowUpIndex = (firstFollowUpIndex + 2) % 5;
		const thirdFollowUpIndex = (secondFollowUpIndex + 2) % 5;

		//   Get the follow-up days
		const firstFollowUp = weekdays[firstFollowUpIndex];
		const secondFollowUp = weekdays[secondFollowUpIndex];
		const thirdFollowUp = weekdays[thirdFollowUpIndex];

		//   Display the follow-up schedule
		console.log(`Case ${caseNum} (${severity}) schedule:`);
		console.log(`- First: ${firstFollowUp}`);
		console.log(`- Second: ${secondFollowUp}`);
		console.log(`- Third: ${thirdFollowUp} (Case will be closed after this)`);
	}

	// Function to handle deletion of a case
	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const editCaseNumber = urlParams.get('edit');

		if (editCaseNumber) {
			const storedCases = localStorage.getItem('cases');
			if (storedCases) {
				const cases = JSON.parse(storedCases);

				if (cases['Follow-ups'][editCaseNumber]) {
					const caseData = cases['Follow-ups'][editCaseNumber];
					caseNumber = editCaseNumber;
					scheduleType = 'Follow-ups';
					lastContactDay = caseData.day;
					severityLevel = caseData.severity;
				} else if (cases['Strikes'][editCaseNumber]) {
					const caseData = cases['Strikes'][editCaseNumber];
					caseNumber = editCaseNumber;
					scheduleType = 'Strikes';
					lastContactDay = caseData.day;
					severityLevel = caseData.severity;
				}
			}
		}
	});
</script>

<section>
	<!-- Alert Container -->
	{#if alertMessage}
		<article class="notification {alertType}" role="alert">
			<button
				aria-label="Close"
				class="close"
				data-close
				on:click|preventDefault={() => (alertMessage = '')}
			></button>
			{alertMessage}
		</article>
	{/if}

	<!-- Main home form -->
	<h2>Create or Update Cases</h2>

	<form on:submit|preventDefault>
		<div class="grid">
			<label for="caseNumber">
				Case Number
				<input
					type="text"
					id="caseNumber"
					placeholder="Enter case number"
					bind:value={caseNumber}
					required
				/>
			</label>
		</div>

		<div class="grid">
			<label for="scheduleType">
				Schedule Type
				<select id="scheduleType" bind:value={scheduleType}>
					<option value="Follow-ups">Follow-ups</option>
					<option value="Strikes">Strikes</option>
				</select>
			</label>

			<label for="lastContactDay">
				Last Contact Day
				<select id="lastContactDay" bind:value={lastContactDay}>
					{#each weekdays as day}
						<option value={day}>{day}</option>
					{/each}
				</select>
			</label>
		</div>

		<fieldset>
			<legend>Severity Level</legend>
			<label for="severityB">
				<input type="radio" id="severityB" name="severity" value="B" bind:group={severityLevel} />
				Severity B
			</label>
			<label for="severityC">
				<input type="radio" id="severityC" name="severity" value="C" bind:group={severityLevel} />
				Severity C
			</label>
		</fieldset>

		<div class="grid">
			<button type="button" id="add" on:click={addCase}>Add Case</button>
			<button type="button" id="update" class="outline" on:click={updateCase}>Update Case</button>
			<button type="button" on:click={resetForm}>Reset Data</button>
		</div>
	</form>
</section>

<!-- Notification style -->
<style>
	.notification {
		margin-bottom: 1rem;
		position: relative;
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
