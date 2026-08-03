from django.shortcuts import redirect, render
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