document.addEventListener('DOMContentLoaded', () => {
	// Auto-focus the title input when the compose form is present
	const titleInput = document.querySelector('.note-form input[name="title"]');
	if (titleInput) titleInput.focus();

	// Initialize collapsible excerpts
	function initExcerpts() {
		document.querySelectorAll('.excerpt').forEach((excerpt) => {
			// remove existing control if re-initializing
			if (excerpt.nextElementSibling && excerpt.nextElementSibling.classList && excerpt.nextElementSibling.classList.contains('read-more')) {
				excerpt.nextElementSibling.remove();
			}

			const computed = window.getComputedStyle(excerpt);
			const lineClamp = computed.getPropertyValue('-webkit-line-clamp');
			// if clamped (or content overflows), add a control
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

	// Async search: fetch same page and replace notes-list
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
