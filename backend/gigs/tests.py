from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Gig

User = get_user_model()


class GigAPITestCase(APITestCase):
    def setUp(self):
        self.seller = User.objects.create_user(
            email="seller@example.com",
            username="seller",
            password="pass1234",
            is_seller=True,
            role="seller",
        )
        self.buyer = User.objects.create_user(
            email="buyer@example.com",
            username="buyer",
            password="pass1234",
            is_seller=False,
            role="buyer",
        )

    def authenticate(self, user):
        self.client.force_authenticate(user=user)

    def test_seller_can_create_gig(self):
        self.authenticate(self.seller)
        url = reverse("gig-list")
        data = {
            "title": "Test Gig",
            "description": "Some description",
            "price": "20.00",
            "delivery_time": 3,
            "revisions": 1,
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Gig.objects.count(), 1)
        gig = Gig.objects.first()
        self.assertEqual(gig.seller, self.seller)

    def test_non_seller_cannot_create_gig(self):
        self.authenticate(self.buyer)
        url = reverse("gig-list")
        data = {
            "title": "Test Gig",
            "description": "Some description",
            "price": "20.00",
            "delivery_time": 3,
            "revisions": 1,
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_owner_can_update_gig(self):
        gig = Gig.objects.create(
            seller=self.seller,
            title="Gig 1",
            description="desc",
            price="25.00",
            delivery_time=2,
            revisions=1,
        )
        self.authenticate(self.seller)
        url = reverse("gig-detail", kwargs={"slug": gig.slug})
        response = self.client.patch(url, {"title": "Updated Title"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        gig.refresh_from_db()
        self.assertEqual(gig.title, "Updated Title")

    def test_other_seller_cannot_update(self):
        other_seller = User.objects.create_user(
            email="other@example.com",
            username="other",
            password="pass1234",
            is_seller=True,
            role="seller",
        )
        gig = Gig.objects.create(
            seller=self.seller,
            title="Gig 1",
            description="desc",
            price="25.00",
            delivery_time=2,
            revisions=1,
        )
        self.authenticate(other_seller)
        url = reverse("gig-detail", kwargs={"slug": gig.slug})
        response = self.client.patch(url, {"title": "Hacked"})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_public_can_list_and_retrieve(self):
        gig = Gig.objects.create(
            seller=self.seller,
            title="Gig 1",
            description="desc",
            price="25.00",
            delivery_time=2,
            revisions=1,
        )
        url = reverse("gig-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data["results"]), 1)

        url = reverse("gig-detail", kwargs={"slug": gig.slug})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["slug"], gig.slug)
