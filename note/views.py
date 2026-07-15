from django.shortcuts import render

# Create your views here.
def home(request):
    context = {
        "title" : "My Notes",
        "username":"Paban"
    }
    return render (request,"home.html",context)