document.addEventListener('DOMContentLoaded', () => {
	const titleInput = document.querySelector('.note-form input[name="title"]');
	if (titleInput) titleInput.focus();

	const addNoteModalEl = document.getElementById('addNoteModal');
	if (addNoteModalEl) {
		addNoteModalEl.addEventListener('shown.bs.modal', () => {
			const modalTitleInput = addNoteModalEl.querySelector('input[name="title"]');
			if (modalTitleInput) modalTitleInput.focus();
		});
	}

	const dateEl = document.getElementById('current-date');
	const timeEl = document.getElementById('current-time');
	if (dateEl && timeEl) {
		const updateClock = () => {
			const now = new Date();
			dateEl.textContent = now.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
			timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
		};

		updateClock();
		setInterval(updateClock, 1000);
	}

	function initExcerpts() {
		document.querySelectorAll('.excerpt').forEach((excerpt) => {
			if (excerpt.nextElementSibling && excerpt.nextElementSibling.classList && excerpt.nextElementSibling.classList.contains('read-more')) {
				excerpt.nextElementSibling.remove();
			}

			if (excerpt.scrollHeight > excerpt.clientHeight + 4) {
				const btn = document.createElement('button');
				btn.type = 'button';
				btn.className = 'read-more';
				btn.textContent = 'Read more';
				btn.addEventListener('click', () => {
					const expanded = excerpt.classList.toggle('expanded');
					btn.textContent = expanded ? 'Show less' : 'Read more';
				});
				excerpt.after(btn);
			}
		});
	}

	initExcerpts();

	const searchForm = document.querySelector('.search-form');
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
					initExcerpts();
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
	if (!notes || notes.length === 0) return '<p class="empty-state">No notes yet. Start by creating one.</p>';
	return notes
		.map((n) => {
			const title = escapeHtml(n.title);
			const content = escapeHtml(n.content);
			return `
				<article class="note-card">
					<div class="note-card-header">
						<h3>${title}</h3>
						<div class="note-actions">
							<a class="btn tiny" href="/notes/${n.id}/edit/">Edit</a>
							<a class="btn tiny danger" href="/notes/${n.id}/delete/" onclick="return confirm('Delete this note?')">Delete</a>
						</div>
					</div>
					<p class="excerpt">${content}</p>
					<div class="meta"><small>Created: ${n.created_at}</small></div>
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
