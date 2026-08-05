from django.shortcuts import get_object_or_404, redirect, render
from django.http import JsonResponse
from .models import Note


def home(request):
    query = request.GET.get("q", "").strip()

    if request.method == "POST":
        title = request.POST.get("title", "").strip()
        content = request.POST.get("content", "").strip()

        if title and content:
            Note.objects.create(title=title, content=content)

        return redirect("home")

    notes = Note.objects.all().order_by("-id")
    if query:
        notes = notes.filter(title__icontains=query) | notes.filter(content__icontains=query)

    # Return JSON for AJAX search requests to keep responses light-weight
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        notes_list = [
            {
                "id": n.id,
                "title": n.title,
                "content": n.content,
                "created_at": n.created_at.strftime("%b %d, %Y %H:%M"),
            }
            for n in notes
        ]
        return JsonResponse({"notes": notes_list})

    return render(request, "home.html", {"notes": notes, "query": query})


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