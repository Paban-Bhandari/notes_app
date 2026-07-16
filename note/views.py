from django.shortcuts import render

# Create your views here.
def home(request):
    context = {
        "title" : "My Notes",
        "username":"Paban",
        "logged_in":True,
        "notes": [
            "Learn Django",
            "Complete Internship Task",
            "Push Code to GitHub",
            "Watch Django Tutorial"
        ]
    }
    return render (request,"home.html",context)