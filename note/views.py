from django.shortcuts import render
from .models import Note

def home(request):
    notes = Note.objects.all().order_by("-id")
    return render(request, "home.html", {"notes": notes})