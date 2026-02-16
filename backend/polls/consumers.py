import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Poll
from .serializers import PollSerializer


class PollConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.poll_id = self.scope['url_route']['kwargs']['poll_id']
        self.room_group_name = f'poll_{self.poll_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Send initial poll data
        poll_data = await self.get_poll_data()
        if poll_data:
            await self.send(text_data=json.dumps({
                'type': 'poll_data',
                'poll': poll_data
            }))

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        pass

    async def poll_update(self, event):
        """Receive poll update from room group"""
        poll = event['poll']

        # Send poll update to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'poll_update',
            'poll': poll
        }))

    @database_sync_to_async
    def get_poll_data(self):
        try:
            poll = Poll.objects.get(id=self.poll_id)
            return PollSerializer(poll).data
        except Poll.DoesNotExist:
            return None
