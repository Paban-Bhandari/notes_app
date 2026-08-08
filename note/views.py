from django.shortcuts import get_object_or_404, redirect, render
from django.http import JsonResponse
from django.urls import reverse
from .models import Note


def about(request):
    return render(request, "about.html")


def home(request):
    query = request.GET.get("q", "").strip()
    view_filter = request.GET.get("view", "all").strip().lower()

    if request.method == "POST":
        title = request.POST.get("title", "").strip()
        content = request.POST.get("content", "").strip()

        if title and content:
            Note.objects.create(title=title, content=content)

        return redirect(reverse("home"))

    notes = Note.objects.all()
    if view_filter == "trash":
        notes = notes.filter(deleted=True)
    elif view_filter == "archived":
        notes = notes.filter(archived=True, deleted=False)
    elif view_filter == "important":
        notes = notes.filter(important=True, archived=False, deleted=False)
    else:
        notes = notes.filter(archived=False, deleted=False)

    if query:
        notes = notes.filter(title__icontains=query) | notes.filter(content__icontains=query)

    notes = notes.order_by("-updated_at", "-created_at")

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        notes_list = [
            {
                "id": n.id,
                "title": n.title,
                "content": n.content,
                "created_at": n.created_at.strftime("%b %d, %Y %H:%M"),
                "archived": n.archived,
                "important": n.important,
                "deleted": n.deleted,
            }
            for n in notes
        ]
        return JsonResponse({"notes": notes_list})

    return render(request, "home.html", {
        "notes": notes,
        "query": query,
        "view_filter": view_filter,
        "active_view": view_filter,
    })


def edit_note(request, note_id):
    note = get_object_or_404(Note, id=note_id)

    if request.method == "POST":
        title = request.POST.get("title", "").strip()
        content = request.POST.get("content", "").strip()
        important = request.POST.get("important") == "on"

        if title and content:
            note.title = title
            note.content = content
            note.important = important
            note.save()

        return redirect("home")

    return render(request, "edit_note.html", {"note": note})


def archive_note(request, note_id):
    note = get_object_or_404(Note, id=note_id)
    if not note.deleted:
        note.archived = not note.archived
        note.save()
    return redirect(request.META.get("HTTP_REFERER", reverse("home")))


def toggle_important_note(request, note_id):
    note = get_object_or_404(Note, id=note_id)
    if not note.deleted:
        note.important = not note.important
        note.save()
    return redirect(request.META.get("HTTP_REFERER", reverse("home")))


def delete_note(request, note_id):
    note = get_object_or_404(Note, id=note_id)
    if note.deleted:
        note.delete()
    else:
        note.deleted = True
        note.save()
    return redirect(request.META.get("HTTP_REFERER", reverse("home")))


def restore_note(request, note_id):
    note = get_object_or_404(Note, id=note_id)
    if note.deleted:
        note.deleted = False
        note.save()
    return redirect(request.META.get("HTTP_REFERER", reverse("home")))


def delete_permanently(request, note_id):
    note = get_object_or_404(Note, id=note_id)
    note.delete()
    return redirect(request.META.get("HTTP_REFERER", reverse("home")))
