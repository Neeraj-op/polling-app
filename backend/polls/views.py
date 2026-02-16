from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Poll, PollOption, Vote
from .serializers import PollSerializer, VoteSerializer

def get_client_ip(request):
    """Extract client IP from request, handling proxies"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

class PollViewSet(viewsets.ModelViewSet):
    queryset = Poll.objects.all()
    serializer_class = PollSerializer
    
    def retrieve(self, request, pk=None):
        """Get poll details"""
        poll = get_object_or_404(Poll, pk=pk)
        serializer = self.get_serializer(poll)
        
        # Check if user has already voted
        voter_ip = get_client_ip(request)
        voter_fingerprint = request.GET.get('fingerprint', '')
        
        has_voted = Vote.objects.filter(
            poll=poll,
            voter_ip=voter_ip,
            voter_fingerprint=voter_fingerprint
        ).exists()
        
        data = serializer.data
        data['has_voted'] = has_voted
        
        return Response(data)
    
    @action(detail=True, methods=['post'])
    def vote(self, request, pk=None):
        """
        Cast a vote with anti-abuse mechanisms:
        1. IP-based limiting: One vote per IP per poll
        2. Fingerprint-based limiting: One vote per browser fingerprint per poll
        """
        poll = get_object_or_404(Poll, pk=pk)
        
        if not poll.is_active:
            return Response(
                {'error': 'This poll is no longer active'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = VoteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        option_id = serializer.validated_data['option_id']
        voter_fingerprint = serializer.validated_data['voter_fingerprint']
        voter_ip = get_client_ip(request)
        
        # Verify option belongs to this poll
        option = get_object_or_404(PollOption, pk=option_id, poll=poll)
        
        # Check if user has already voted (both IP and fingerprint)
        existing_vote = Vote.objects.filter(
            poll=poll,
            voter_ip=voter_ip,
            voter_fingerprint=voter_fingerprint
        ).first()
        
        if existing_vote:
            return Response(
                {'error': 'You have already voted in this poll'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create vote record
        try:
            Vote.objects.create(
                poll=poll,
                option=option,
                voter_ip=voter_ip,
                voter_fingerprint=voter_fingerprint
            )
            
            # Increment vote count
            option.vote_count += 1
            option.save()
            
            # Broadcast update via WebSocket
            channel_layer = get_channel_layer()
            poll_data = PollSerializer(poll).data
            
            async_to_sync(channel_layer.group_send)(
                f'poll_{poll.id}',
                {
                    'type': 'poll_update',
                    'poll': poll_data
                }
            )
            
            return Response(poll_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': 'Failed to record vote'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )