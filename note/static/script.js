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

    const confirmModal = document.getElementById('confirmModal');
    const confirmModalMessageEl = document.getElementById('confirmModalMessage');
    const confirmModalConfirm = document.getElementById('confirmModalConfirm');
    const confirmModalCancel = document.getElementById('confirmModalCancel');
    let activeConfirmForm = null;

    const openConfirmModal = (message, form) => {
        if (!confirmModal || !confirmModalMessageEl) return;
        confirmModalMessageEl.textContent = message;
        activeConfirmForm = form;
        confirmModal.classList.remove('hidden');
        confirmModal.classList.add('flex');
        confirmModal.setAttribute('aria-hidden', 'false');
    };

    const closeConfirmModal = () => {
        if (!confirmModal) return;
        confirmModal.classList.remove('flex');
        confirmModal.classList.add('hidden');
        confirmModal.setAttribute('aria-hidden', 'true');
        activeConfirmForm = null;
    };

    document.addEventListener('submit', (event) => {
        const form = event.target.closest('form[data-confirm]');
        if (!form) return;

        const message = form.dataset.confirm;
        if (message) {
            event.preventDefault();
            openConfirmModal(message, form);
        }
    });

    if (confirmModalCancel) {
        confirmModalCancel.addEventListener('click', closeConfirmModal);
    }

    if (confirmModalConfirm) {
        confirmModalConfirm.addEventListener('click', () => {
            if (activeConfirmForm) {
                activeConfirmForm.submit();
            }
            closeConfirmModal();
        });
    }

    if (confirmModal) {
        confirmModal.addEventListener('click', (event) => {
            if (event.target === confirmModal) {
                closeConfirmModal();
            }
        });
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
            const folder = n.folder ? `<span class="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">${escapeHtml(n.folder)}</span>` : '';
            const important = n.important ? '<span class="rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">Bookmarked</span>' : '';
            const archiveLabel = n.archived ? 'Restore' : 'Archive';
            const importantLabel = n.important ? 'Unbookmark' : 'Bookmark';

            return `
                <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div class="space-y-4 w-full sm:max-w-[65%]">
                            <div class="flex flex-wrap gap-2 items-center">
                                <h3 class="text-lg font-semibold text-slate-900">${title}</h3>
                                ${folder}
                                ${important}
                            </div>
                            <p class="text-sm leading-6 text-slate-600">${content}</p>
                            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Created: ${n.created_at}</p>
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <a class="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50" href="/notes/${n.id}/edit/">Edit</a>
                            <a class="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-100" href="/notes/${n.id}/archive/">${archiveLabel}</a>
                            <a class="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100" href="/notes/${n.id}/toggle-important/">${importantLabel}</a>
                            <form method="post" action="/notes/${n.id}/delete/" class="inline" data-confirm="Delete this note?">
                                <button type="submit" class="rounded-xl bg-rose-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-700">Delete</button>
                            </form>
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
