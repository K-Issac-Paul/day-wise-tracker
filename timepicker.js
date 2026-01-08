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

		// Hours (1-12)
		const hoursCol = this.createColumn('hours', 12, 1);
		// Minutes (00-59)
		const minutesCol = this.createColumn('minutes', 60, 0);
		// AM/PM
		const ampmCol = this.createAmPmColumn();

		body.appendChild(hoursCol);
		body.appendChild(document.createTextNode(':'));
		body.appendChild(minutesCol);
		body.appendChild(document.createTextNode(' '));
		body.appendChild(ampmCol);

		// Footer (Actions)
		const footer = document.createElement('div');
		footer.className = 'picker-footer';

		const cancelBtn = document.createElement('button');
		cancelBtn.textContent = 'Cancel';
		cancelBtn.className = 'picker-btn secondary';
		cancelBtn.onclick = (e) => {
			e.preventDefault(); // Prevent form submission
			this.closePicker();
		};

		const setBtn = document.createElement('button');
		setBtn.textContent = 'Set Time';
		setBtn.className = 'picker-btn primary';
		setBtn.onclick = (e) => {
			e.preventDefault(); // Prevent form submission
			this.setTime();
		};

		footer.appendChild(cancelBtn);
		footer.appendChild(setBtn);

		this.container.appendChild(header);
		this.container.appendChild(body);
		this.container.appendChild(footer);

		document.body.appendChild(this.container);
	}

	createColumn(type, count, startFrom) {
		const col = document.createElement('div');
		col.className = `picker-column ${type}-column`;

		for (let i = 0; i < count; i++) {
			let val = (i + startFrom).toString().padStart(2, '0');
			const item = document.createElement('div');
			item.className = 'picker-item';
			item.textContent = val;
			item.dataset.value = val;
			item.onclick = (e) => {
				// Remove active class from siblings
				col.querySelectorAll('.picker-item').forEach(el => el.classList.remove('selected'));
				e.target.classList.add('selected');
			};
			col.appendChild(item);
		}
		return col;
	}

	createAmPmColumn() {
		const col = document.createElement('div');
		col.className = `picker-column ampm-column`;

		['AM', 'PM'].forEach(val => {
			const item = document.createElement('div');
			item.className = 'picker-item';
			item.textContent = val;
			item.dataset.value = val;
			item.onclick = (e) => {
				col.querySelectorAll('.picker-item').forEach(el => el.classList.remove('selected'));
				e.target.classList.add('selected');
			};
			col.appendChild(item);
		});
		return col;
	}

	openPicker(input) {
		this.activeInput = input;

		// Position logic
		const rect = input.getBoundingClientRect();
		const pickerWidth = 280;
		const pickerHeight = 350; // Approx height

		let top = rect.bottom + window.scrollY + 8;
		let left = rect.left + window.scrollX;

		// Check if it goes off screen on the right
		if (left + pickerWidth > window.innerWidth) {
			left = window.innerWidth - pickerWidth - 20;
		}

		// Check if it goes off screen on the bottom
		if (top + pickerHeight > window.innerHeight + window.scrollY) {
			top = rect.top + window.scrollY - pickerHeight - 8;
		}

		this.container.style.top = `${top}px`;
		this.container.style.left = `${left}px`;

		// Parse current value
		const currentVal = input.value;
		let h = '12', m = '00', ampm = 'AM';

		if (currentVal) {
			const parts = currentVal.split(' ');
			if (parts.length === 2) {
				const timeParts = parts[0].split(':');
				if (timeParts.length === 2) {
					h = timeParts[0].padStart(2, '0');
					m = timeParts[1].padStart(2, '0');
					ampm = parts[1];
				}
			}
		} else {
			// Default to current time rounded to 30 mins
			const now = new Date();
			let hour = now.getHours();
			let mins = now.getMinutes();
			if (mins === 60) {
				hour++;
				mins = 0;
			}
			m = mins.toString().padStart(2, '0');
			ampm = hour >= 12 ? 'PM' : 'AM';
			hour = hour % 12 || 12;
			h = hour.toString().padStart(2, '0');
		}

		this.selectItem('hours', h);
		this.selectItem('minutes', m);
		this.selectAmPm(ampm);

		this.container.classList.add('active');
	}

	selectItem(type, value) {
		const col = this.container.querySelector(`.${type}-column`);
		if (!col) return;

		const items = col.querySelectorAll('.picker-item');
		items.forEach(el => el.classList.remove('selected'));

		const item = Array.from(items).find(el => el.dataset.value === value);
		if (item) {
			item.classList.add('selected');
			// Use setTimeout to ensure the container is visible for scrollIntoView
			setTimeout(() => {
				item.scrollIntoView({ block: 'center', behavior: 'smooth' });
			}, 50);
		}
	}

	selectAmPm(value) {
		const col = this.container.querySelector(`.ampm-column`);
		if (!col) return;

		const items = col.querySelectorAll('.picker-item');
		items.forEach(el => el.classList.remove('selected'));

		const item = Array.from(items).find(el => el.dataset.value === value);
		if (item) {
			item.classList.add('selected');
		}
	}

	setTime() {
		if (!this.activeInput) return;

		const h = this.container.querySelector('.hours-column .selected')?.dataset.value || '12';
		const m = this.container.querySelector('.minutes-column .selected')?.dataset.value || '00';
		const ampm = this.container.querySelector('.ampm-column .selected')?.dataset.value || 'AM';

		const timeString = `${h}:${m} ${ampm}`;
		this.activeInput.value = timeString;

		// Trigger input event for validation
		this.activeInput.dispatchEvent(new Event('input', { bubbles: true }));
		this.activeInput.dispatchEvent(new Event('change', { bubbles: true }));

		this.closePicker();
	}

	closePicker() {
		this.container.classList.remove('active');
		this.activeInput = null;
	}
}
