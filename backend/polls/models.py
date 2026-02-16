from django.db import models
import uuid

class Poll(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.question
    
    class Meta:
        ordering = ['-created_at']

class PollOption(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=200)
    vote_count = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.text} ({self.vote_count} votes)"
    
    class Meta:
        ordering = ['id']

class Vote(models.Model):
    """
    2 TYPES OF FAIRNESS MECHANISMS:
    Track votes for fairness mechanisms:
    1. IP-based limiting
    2. Browser fingerprint (via voter_id from client)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name='votes')
    option = models.ForeignKey(PollOption, on_delete=models.CASCADE, related_name='votes')
    voter_ip = models.GenericIPAddressField()
    voter_fingerprint = models.CharField(max_length=255)  # Browser fingerprint hash
    voted_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        # Ensure one vote per IP+fingerprint per poll
        unique_together = [['poll', 'voter_ip', 'voter_fingerprint']]
        indexes = [
            models.Index(fields=['poll', 'voter_ip']),
            models.Index(fields=['poll', 'voter_fingerprint']),
        ]
    
    def __str__(self):
        return f"Vote for {self.option.text} in {self.poll.question}"