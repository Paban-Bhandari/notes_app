document.addEventListener('DOMContentLoaded', () => {
	const titleInput = document.querySelector('.note-form input[name="title"]');
	if (titleInput) titleInput.focus();

	const addNoteModalEl = document.getElementById('addNoteModal');
	const openModalBtn = document.querySelector('[data-open-modal]');
	const closeModalBtns = document.querySelectorAll('[data-close-modal]');

	const openModal = () => {
		if (addNoteModalEl) {
			addNoteModalEl.classList.remove('hidden');
			addNoteModalEl.classList.add('flex');
			const modalTitleInput = addNoteModalEl.querySelector('input[name="title"]');
			if (modalTitleInput) modalTitleInput.focus();
		}
	};

	const closeModal = () => {
		if (addNoteModalEl) {
			addNoteModalEl.classList.remove('flex');
			addNoteModalEl.classList.add('hidden');
		}
	};

	if (openModalBtn) openModalBtn.addEventListener('click', openModal);
	closeModalBtns.forEach((btn) => btn.addEventListener('click', closeModal));

	if (addNoteModalEl) {
		addNoteModalEl.addEventListener('click', (event) => {
			if (event.target === addNoteModalEl) closeModal();
		});
	}

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') closeModal();
	});

	const dateEl = document.getElementById('current-date');
	const timeEl = document.getElementById('current-time');
	if (dateEl && timeEl) {
		const updateClock = () => {
			const now = new Date();
			dateEl.textContent = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
			timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
		};

		updateClock();
		setInterval(updateClock, 1000);
	}

	const searchForm = document.querySelector('form[method="get"]');
	if (searchForm) {
		searchForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			const form = e.currentTarget;
			const q = new FormData(form).get('q') || '';
			const url = new URL(window.location.href);
			url.searchParams.set('q', q);

			try {
				const res = await fetch(url.toString(), { headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' } });
				if (!res.ok) return window.location.assign(url.toString());
				const data = await res.json();
				const curList = document.querySelector('.notes-list');
				if (data && Array.isArray(data.notes) && curList) {
					curList.innerHTML = renderNotes(data.notes);
				} else {
					window.location.assign(url.toString());
				}
			} catch (err) {
				console.error('Search error', err);
				window.location.assign(url.toString());
			}
		});
	}
});

function renderNotes(notes) {
	if (!notes || notes.length === 0) return '<div class="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">No notes yet. Start by creating one.</div>';
	return notes
		.map((n) => {
			const title = escapeHtml(n.title);
			const content = escapeHtml(n.content);
			return `
				<article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
					<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<h3 class="text-lg font-semibold text-slate-900">${title}</h3>
							<p class="mt-2 text-sm leading-6 text-slate-600">${content}</p>
							<p class="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">Created: ${n.created_at}</p>
						</div>
						<div class="flex gap-2">
							<a class="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50" href="/notes/${n.id}/edit/">Edit</a>
							<a class="rounded-xl bg-rose-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-700" href="/notes/${n.id}/delete/" onclick="return confirm('Delete this note?')">Delete</a>
						</div>
					</div>
				</article>
			`;
		})
		.join('');
}

function escapeHtml(str) {
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}
