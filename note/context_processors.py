from .models import Folder


def folder_navigation(request):
    return {
        "folders": Folder.objects.order_by("name"),
        "active_folder": request.GET.get("folder", ""),
        "active_view": request.GET.get("view", "all"),
    }
