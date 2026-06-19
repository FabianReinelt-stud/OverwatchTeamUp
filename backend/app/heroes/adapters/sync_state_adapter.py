from django.utils import timezone

from heroes.models import SyncState


class SyncStateAdapter:
    def get_last_synced_at(self):
        state = SyncState.objects.first()
        return state.last_synced_at if state else None

    def update_last_synced_at(self):
        SyncState.objects.update_or_create(id=1, defaults={"last_synced_at": timezone.now()})
