from django.shortcuts import get_object_or_404, redirect, render
from .models import Note


def home(request):
    if request.method == "POST":
        title = request.POST.get("title", "").strip()
        content = request.POST.get("content", "").strip()

        if title and content:
            Note.objects.create(title=title, content=content)

        return redirect("home")

    notes = Note.objects.all().order_by("-id")
    return render(request, "home.html", {"notes": notes})


def edit_note(request, note_id):
    note = get_object_or_404(Note, id=note_id)

    if request.method == "POST":
        title = request.POST.get("title", "").strip()
        content = request.POST.get("content", "").strip()

        if title and content:
            note.title = title
            note.content = content
            note.save()

        return redirect("home")

    return render(request, "edit_note.html", {"note": note})


def delete_note(request, note_id):
    note = get_object_or_404(Note, id=note_id)
    note.delete()
    return redirect("home")