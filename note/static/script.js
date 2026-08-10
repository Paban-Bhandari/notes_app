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

    // Mobile sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebarEl = document.getElementById('sidebar');
    const bodyEl = document.body;

    // create overlay if missing
    let mobileOverlay = document.querySelector('.mobile-sidebar-overlay');
    if (!mobileOverlay) {
        mobileOverlay = document.createElement('div');
        mobileOverlay.className = 'mobile-sidebar-overlay';
        document.body.appendChild(mobileOverlay);
    }

    let lastFocusedElementBeforeSidebar = null;
    let sidebarKeydownHandler = null;

    function getFocusableElements(container) {
        if (!container) return [];
        const selectors = 'a[href], area[href], input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable]';
        return Array.from(container.querySelectorAll(selectors)).filter((el) => el.offsetParent !== null);
    }

    const openSidebar = () => {
        if (!sidebarEl) {
            bodyEl.classList.add('sidebar-open');
            if (sidebarToggle) sidebarToggle.setAttribute('aria-expanded', 'true');
            return;
        }

        lastFocusedElementBeforeSidebar = document.activeElement;
        sidebarEl.setAttribute('aria-hidden', 'false');
        bodyEl.classList.add('sidebar-open');
        if (sidebarToggle) sidebarToggle.setAttribute('aria-expanded', 'true');

        const focusable = getFocusableElements(sidebarEl);
        const firstFocusable = focusable[0] || sidebarClose || sidebarEl;
        try { firstFocusable.focus(); } catch (e) {}

        sidebarKeydownHandler = (e) => {
            if (e.key === 'Tab') {
                const list = getFocusableElements(sidebarEl);
                if (list.length === 0) {
                    e.preventDefault();
                    return;
                }
                const first = list[0];
                const last = list[list.length - 1];
                if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                } else if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else if (e.key === 'Escape') {
                closeSidebar();
            }
        };

        document.addEventListener('keydown', sidebarKeydownHandler);
    };

    const closeSidebar = () => {
        if (sidebarKeydownHandler) {
            document.removeEventListener('keydown', sidebarKeydownHandler);
            sidebarKeydownHandler = null;
        }
        if (sidebarEl) sidebarEl.setAttribute('aria-hidden', 'true');
        bodyEl.classList.remove('sidebar-open');
        if (sidebarToggle) sidebarToggle.setAttribute('aria-expanded', 'false');
        try {
            if (lastFocusedElementBeforeSidebar && typeof lastFocusedElementBeforeSidebar.focus === 'function') lastFocusedElementBeforeSidebar.focus();
        } catch (e) {}
        lastFocusedElementBeforeSidebar = null;
    };

    if (sidebarToggle) sidebarToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        openSidebar();
    });

    if (sidebarClose) sidebarClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeSidebar();
    });

    if (mobileOverlay) mobileOverlay.addEventListener('click', closeSidebar);

    // Close sidebar on Escape
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeSidebar();
        }
    });

    const confirmModal = document.getElementById('confirmModal');
    const confirmModalMessageEl = document.getElementById('confirmModalMessage');
    const confirmModalConfirm = document.getElementById('confirmModalConfirm');
    const confirmModalCancel = document.getElementById('confirmModalCancel');
    let activeConfirmForm = null;

    const confirmStyles = {
        base: {
            add: ['bg-slate-400', 'hover:bg-slate-500'],
        },
        'confirm-success': {
            add: ['bg-green-600', 'hover:bg-green-700'],
        },
        'confirm-danger': {
            add: ['bg-rose-600', 'hover:bg-rose-700'],
        },
    };

    const confirmClasses = [
        ...confirmStyles.base.add,
        ...confirmStyles['confirm-success'].add,
        ...confirmStyles['confirm-danger'].add,
    ];

    const openConfirmModal = (message, form) => {
        if (!confirmModal || !confirmModalMessageEl || !confirmModalConfirm) return;
        confirmModalMessageEl.textContent = message;
        confirmModalConfirm.textContent = form.dataset.confirmButton || 'Delete';

        const confirmClass = form.dataset.confirmClass || 'confirm-danger';
        confirmModalConfirm.classList.remove(...confirmClasses);
        confirmModalConfirm.classList.remove('confirm-success', 'confirm-danger');

        if (confirmStyles[confirmClass]) {
            confirmModalConfirm.classList.add(...confirmStyles[confirmClass].add);
            confirmModalConfirm.classList.add(confirmClass);
        }

        activeConfirmForm = form;
        confirmModal.classList.remove('hidden');
        confirmModal.classList.add('flex');
        confirmModal.setAttribute('aria-hidden', 'false');
    };

    const closeConfirmModal = () => {
        if (!confirmModal || !confirmModalConfirm) return;
        confirmModal.classList.remove('flex');
        confirmModal.classList.add('hidden');
        confirmModal.setAttribute('aria-hidden', 'true');
        confirmModalConfirm.textContent = 'Delete';
        confirmModalConfirm.classList.remove(...confirmClasses);
        confirmModalConfirm.classList.remove('confirm-success', 'confirm-danger');
        confirmModalConfirm.classList.add(...confirmStyles.base.add);
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
    const searchInput = searchForm ? searchForm.querySelector('input[name="q"]') : null;
    const searchTimeout = { id: null };

    const performSearch = async (q) => {
        const url = new URL(window.location.href);
        url.searchParams.set('q', q || '');

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
    };

    if (searchForm) {
        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const q = new FormData(form).get('q') || '';
            await performSearch(q);
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const q = e.target.value || '';
            if (searchTimeout.id) {
                clearTimeout(searchTimeout.id);
            }
            searchTimeout.id = setTimeout(() => {
                performSearch(q);
            }, 250);
        });
    }
});

function renderNotes(notes) {
    if (!notes || notes.length === 0) {
        return '<div class="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">No notes yet. Start by creating one.</div>';
    }

    const csrfToken = getCsrfToken();
    const csrfField = csrfToken ? `<input type="hidden" name="csrfmiddlewaretoken" value="${csrfToken}">` : '';

    return notes
        .map((n) => {
            const title = escapeHtml(n.title);
            const content = escapeHtml(n.content);
            const createdAt = escapeHtml(n.created_at);
            const archived = n.archived;
            const important = n.important;
            const deleted = n.deleted;

            const badge = important && !deleted ? '<span class="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">Bookmarked</span>' : '';

            const archiveIcon = archived
                ? '<i class="fa-solid fa-box-open" aria-hidden="true"></i>'
                : '<i class="fa-solid fa-box-archive" aria-hidden="true"></i>';
            const archiveTooltip = archived ? 'Unarchive' : 'Archive';
            const bookmarkIcon = important
                ? '<i class="fa-solid fa-bookmark" aria-hidden="true"></i>'
                : '<i class="fa-regular fa-bookmark" aria-hidden="true"></i>';
            const bookmarkTooltip = important ? 'Remove bookmark' : 'Bookmark';

            const actionButtons = deleted
                ? `
                    <form method="post" action="/notes/${n.id}/restore/" class="inline" data-confirm="Restore this note?" data-confirm-button="Restore" data-confirm-class="confirm-success">
                        ${csrfField}
                        <button type="submit" class="tooltip inline-flex items-center justify-center rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100" aria-label="Restore note" data-tooltip="Restore">Restore</button>
                    </form>
                    <form method="post" action="/notes/${n.id}/delete-permanently/" class="inline" data-confirm="Permanently delete this note?" data-confirm-button="Delete permanently" data-confirm-class="confirm-danger">
                        ${csrfField}
                        <button type="submit" class="tooltip inline-flex items-center justify-center rounded-xl bg-rose-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-700" aria-label="Delete permanently" data-tooltip="Delete permanently"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>
                    </form>
                `
                : `
                    <a class="tooltip inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100" href="/notes/${n.id}/edit/" aria-label="Edit note" data-tooltip="Edit"><i class="fa-solid fa-pen-to-square" aria-hidden="true"></i></a>
                    <a class="tooltip inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100" href="/notes/${n.id}/archive/" aria-label="${archiveTooltip}" data-tooltip="${archiveTooltip}">${archiveIcon}</a>
                    ${archived ? '' : `
                        <a class="tooltip inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100" href="/notes/${n.id}/toggle-important/" aria-label="${bookmarkTooltip}" data-tooltip="${bookmarkTooltip}">
                            ${bookmarkIcon}
                        </a>
                    `}
                    <form method="post" action="/notes/${n.id}/delete/" class="inline" data-confirm="Delete this note?" data-confirm-class="confirm-danger">
                        ${csrfField}
                        <button type="submit" class="tooltip inline-flex items-center justify-center rounded-xl bg-rose-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-700" aria-label="Delete note" data-tooltip="Delete"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>
                    </form>
                `;

            return `
                <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div class="space-y-4">
                            <div class="flex flex-wrap items-center gap-2">
                                <h3 class="text-lg font-semibold text-slate-900">${title}</h3>
                                ${badge}
                            </div>
                            <p class="text-sm leading-6 text-slate-600">${content}</p>
                            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Created: ${createdAt}</p>
                        </div>
                        <div class="flex flex-wrap gap-2">
                            ${actionButtons}
                        </div>
                    </div>
                </article>
            `;
        })
        .join('');
}

function getCsrfToken() {
    const name = 'csrftoken=';
    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
        const trimmed = cookie.trim();
        if (trimmed.startsWith(name)) {
            return trimmed.substring(name.length);
        }
    }

    return '';
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
