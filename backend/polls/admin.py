from django.contrib import admin
from .models import Poll, PollOption, Vote

@admin.register(Poll)
class PollAdmin(admin.ModelAdmin):
    list_display = ['question', 'created_at', 'is_active']
    list_filter = ['is_active', 'created_at']
    search_fields = ['question']

@admin.register(PollOption)
class PollOptionAdmin(admin.ModelAdmin):
    list_display = ['text', 'poll', 'vote_count']
    list_filter = ['poll']
    search_fields = ['text']

@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ['poll', 'option', 'voter_ip', 'voted_at']
    list_filter = ['poll', 'voted_at']
    search_fields = ['voter_ip', 'voter_fingerprint']