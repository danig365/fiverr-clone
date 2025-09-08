from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/users/", include("users.urls")),
    path("api/auth/", include("users.urls")),  # 🔥 added
    path("api/", include("gigs.urls")),  # ✅ include gigs endpoints
    path("api/chat/", include("chat.urls")),  # ✅ include chat endpoints
    path("api/orders/", include("orders.urls")),
    path("api/payments/", include("payments.urls")),
    path("api/", include("notifications.urls")),
    path("api/", include("reviews.urls")),  
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
