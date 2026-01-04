class TimePicker {
	constructor() {
		this.activeInput = null;
		this.container = null;
		this.init();
	}

	init() {
		// Create picker DOM
		this.createPickerDOM();

		// Event delegation for opening picker
		document.addEventListener('click', (e) => {
			if (e.target.classList.contains('time-input')) {
				this.openPicker(e.target);
			} else if (!this.container.contains(e.target) && this.container.classList.contains('active')) {
				this.closePicker();
			}
		});
	}

	createPickerDOM() {
		this.container = document.createElement('div');
		this.container.className = 'custom-time-picker';

		// Header
		const header = document.createElement('div');
		header.className = 'picker-header';
		header.innerHTML = '<span>Select Time</span>';

		// Body (Columns)
		const body = document.createElement('div');
		body.className = 'picker-body';

		// Hours
		const hoursCol = this.createColumn('hours', 24);
		// Minutes
		const minutesCol = this.createColumn('minutes', 60); // 0-59

		body.appendChild(hoursCol);
		body.appendChild(document.createTextNode(':'));
		body.appendChild(minutesCol);

		// Footer (Actions)
		const footer = document.createElement('div');
		footer.className = 'picker-footer';

		const cancelBtn = document.createElement('button');
		cancelBtn.textContent = 'Cancel';
		cancelBtn.className = 'picker-btn secondary';
		cancelBtn.onclick = () => this.closePicker();

		const setBtn = document.createElement('button');
		setBtn.textContent = 'Set Time';
		setBtn.className = 'picker-btn primary';
		setBtn.onclick = () => this.setTime();

		footer.appendChild(cancelBtn);
		footer.appendChild(setBtn);

		this.container.appendChild(header);
		this.container.appendChild(body);
		this.container.appendChild(footer);

		document.body.appendChild(this.container);
	}

	createColumn(type, count) {
		const col = document.createElement('div');
		col.className = `picker-column ${type}-column`;

		for (let i = 0; i < count; i++) {
			const val = i.toString().padStart(2, '0');
			const item = document.createElement('div');
			item.className = 'picker-item';
			item.textContent = val;
			item.dataset.value = val;
			item.onclick = (e) => {
				// Remove active class from siblings
				col.querySelectorAll('.picker-item').forEach(el => el.classList.remove('selected'));
				e.target.classList.add('selected');
				this.updatePreview();
			};
			col.appendChild(item);
		}
		return col;
	}

	openPicker(input) {
		this.activeInput = input;

		// Position logic
		const rect = input.getBoundingClientRect();
		this.container.style.top = `${rect.bottom + window.scrollY + 5}px`;
		this.container.style.left = `${rect.left + window.scrollX}px`;
		// Ensure it doesn't go off screen
		// (Simplified positioning)

		// Parse current value
		const currentVal = input.value;
		if (currentVal && currentVal.includes(':')) {
			const [h, m] = currentVal.split(':');
			this.selectItem('hours', h);
			this.selectItem('minutes', m);
		} else {
			// Default to current time or 00:00
			const now = new Date();
			this.selectItem('hours', now.getHours().toString().padStart(2, '0'));
			this.selectItem('minutes', now.getMinutes().toString().padStart(2, '0'));
		}

		this.container.classList.add('active');
	}

	selectItem(type, value) {
		const col = this.container.querySelector(`.${type}-column`);
		const item = Array.from(col.children).find(el => el.dataset.value === value);
		if (item) {
			col.querySelectorAll('.picker-item').forEach(el => el.classList.remove('selected'));
			item.classList.add('selected');
			item.scrollIntoView({ block: 'center' }); // Auto scroll
		}
	}

	updatePreview() {
		// Optional: Live preview in input? No, wait for Set.
	}

	setTime() {
		if (!this.activeInput) return;

		const h = this.container.querySelector('.hours-column .selected')?.dataset.value || '00';
		const m = this.container.querySelector('.minutes-column .selected')?.dataset.value || '00';

		this.activeInput.value = `${h}:${m}`;

		// Trigger input event for validation
		this.activeInput.dispatchEvent(new Event('input', { bubbles: true }));

		this.closePicker();
	}

	closePicker() {
		this.container.classList.remove('active');
		this.activeInput = null;
	}
}
