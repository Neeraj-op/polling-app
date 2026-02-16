from rest_framework import serializers
from .models import Poll, PollOption, Vote

class PollOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PollOption
        fields = ['id', 'text', 'vote_count']
        read_only_fields = ['id', 'vote_count']

class PollSerializer(serializers.ModelSerializer):
    options = PollOptionSerializer(many=True)
    total_votes = serializers.SerializerMethodField()
    
    class Meta:
        model = Poll
        fields = ['id', 'question', 'options', 'created_at', 'is_active', 'total_votes']
        read_only_fields = ['id', 'created_at']
    
    def get_total_votes(self, obj):
        return sum(option.vote_count for option in obj.options.all())
    
    def create(self, validated_data):
        options_data = validated_data.pop('options')
        poll = Poll.objects.create(**validated_data)
        
        for option_data in options_data:
            PollOption.objects.create(poll=poll, **option_data)
        
        return poll

class VoteSerializer(serializers.Serializer):
    option_id = serializers.UUIDField()
    voter_fingerprint = serializers.CharField(max_length=255)