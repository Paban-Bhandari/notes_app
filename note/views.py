from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.shortcuts import get_object_or_404, redirect, render
from django.http import JsonResponse
from django.urls import reverse
from .models import Note


def home(request):
    query = request.GET.get("q", "").strip()
    view_filter = request.GET.get("view", "all").strip().lower()

    if request.method == "POST":
        if not request.user.is_authenticated:
            return redirect("login")

        title = request.POST.get("title", "").strip()
        content = request.POST.get("content", "").strip()

        if title and content:
            Note.objects.create(title=title, content=content, owner=request.user)

        return redirect(reverse("home"))

    if request.user.is_authenticated:
        notes = Note.objects.filter(owner=request.user)
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
    else:
        notes = Note.objects.none()


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


def login_view(request):
    if request.user.is_authenticated:
        return redirect("home")

    if request.method == "POST":
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect("home")
    else:
        form = AuthenticationForm(request)

    return render(request, "login.html", {"form": form})


def signup_view(request):
    if request.user.is_authenticated:
        return redirect("home")

    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect("home")
    else:
        form = UserCreationForm()

    return render(request, "signup.html", {"form": form})


def logout_view(request):
    logout(request)
    return redirect("home")


@login_required(login_url='login')
def edit_note(request, note_id):
    note = get_object_or_404(Note, id=note_id, owner=request.user)

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


@login_required(login_url='login')
def archive_note(request, note_id):
    note = get_object_or_404(Note, id=note_id, owner=request.user)
    if not note.deleted:
        note.archived = not note.archived
        note.save()
    return redirect(request.META.get("HTTP_REFERER", reverse("home")))


@login_required(login_url='login')
def toggle_important_note(request, note_id):
    note = get_object_or_404(Note, id=note_id, owner=request.user)
    if not note.deleted:
        note.important = not note.important
        note.save()
    return redirect(request.META.get("HTTP_REFERER", reverse("home")))


@login_required(login_url='login')
def delete_note(request, note_id):
    note = get_object_or_404(Note, id=note_id, owner=request.user)
    if note.deleted:
        note.delete()
    else:
        note.deleted = True
        note.save()
    return redirect(request.META.get("HTTP_REFERER", reverse("home")))


@login_required(login_url='login')
def restore_note(request, note_id):
    note = get_object_or_404(Note, id=note_id, owner=request.user)
    if note.deleted:
        note.deleted = False
        note.save()
    return redirect(request.META.get("HTTP_REFERER", reverse("home")))


@login_required(login_url='login')
def delete_permanently(request, note_id):
    note = get_object_or_404(Note, id=note_id, owner=request.user)
    note.delete()
    return redirect(request.META.get("HTTP_REFERER", reverse("home")))
