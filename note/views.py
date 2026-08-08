from django.shortcuts import get_object_or_404, redirect, render
from django.http import JsonResponse
from django.urls import reverse
from .models import Folder, Note


def about(request):
    return render(request, "about.html")


def home(request):
    query = request.GET.get("q", "").strip()
    view_filter = request.GET.get("view", "all").strip().lower()

    if request.method == "POST":
        title = request.POST.get("title", "").strip()
        content = request.POST.get("content", "").strip()
        folder_id = request.POST.get("folder")
        folder = Folder.objects.filter(id=folder_id).first() if folder_id else None

        if title and content:
            Note.objects.create(title=title, content=content, folder=folder)

        redirect_url = reverse("home")
        if folder:
            redirect_url += f"?view=all"
        return redirect(redirect_url)

    notes = Note.objects.all()
    if view_filter == "archived":
        notes = notes.filter(archived=True)
    elif view_filter == "important":
        notes = notes.filter(important=True, archived=False)
    else:
        notes = notes.filter(archived=False)

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
                "folder": n.folder.name if n.folder else None,
            }
            for n in notes
        ]
        return JsonResponse({"notes": notes_list})

    return render(request, "home.html", {
        "notes": notes,
        "query": query,
        "view_filter": view_filter,
        "folders": Folder.objects.order_by("name"),
        "active_folder": "",
    })


def folder_list(request):
    folders = Folder.objects.order_by("name")
    return render(request, "folders.html", {
        "folders": folders,
        "active_folder": "",
        "active_view": "all",
    })


def folder_detail(request, folder_id):
    folder = get_object_or_404(Folder, id=folder_id)
    query = request.GET.get("q", "").strip()

    notes = folder.notes.filter(archived=False)
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
                "folder": n.folder.name if n.folder else None,
            }
            for n in notes
        ]
        return JsonResponse({"notes": notes_list})

    return render(request, "folder_detail.html", {
        "folder": folder,
        "notes": notes,
        "query": query,
        "folders": Folder.objects.order_by("name"),
        "active_folder": str(folder.id),
        "active_view": "all",
    })


def create_folder(request):
    if request.method == "POST":
        folder_name = request.POST.get("name", "").strip()
        if folder_name:
            Folder.objects.get_or_create(name=folder_name)
    return redirect("folder_list")


def delete_folder(request, folder_id):
    folder = get_object_or_404(Folder, id=folder_id)
    if request.method == "POST":
        folder.delete()
        return redirect("folder_list")
    return render(request, "confirm_delete_folder.html", {"folder": folder})


def edit_note(request, note_id):
    note = get_object_or_404(Note, id=note_id)

    if request.method == "POST":
        title = request.POST.get("title", "").strip()
        content = request.POST.get("content", "").strip()
        folder_id = request.POST.get("folder")
        important = request.POST.get("important") == "on"
        folder = Folder.objects.filter(id=folder_id).first() if folder_id else None

        if title and content:
            note.title = title
            note.content = content
            note.folder = folder
            note.important = important
            note.save()

        return redirect("home")

    return render(request, "edit_note.html", {"note": note, "folders": Folder.objects.order_by("name")})


def archive_note(request, note_id):
    note = get_object_or_404(Note, id=note_id)
    note.archived = not note.archived
    note.save()
    return redirect(request.META.get("HTTP_REFERER", reverse("home")))


def toggle_important_note(request, note_id):
    note = get_object_or_404(Note, id=note_id)
    note.important = not note.important
    note.save()
    return redirect(request.META.get("HTTP_REFERER", reverse("home")))


def delete_note(request, note_id):
    note = get_object_or_404(Note, id=note_id)
    note.delete()
    return redirect(request.META.get("HTTP_REFERER", reverse("home")))
