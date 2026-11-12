# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Chunks(models.Model):
    id = models.BigAutoField(primary_key=True)
    document = models.ForeignKey('Documents', models.DO_NOTHING)
    chunk_index = models.IntegerField()
    content = models.TextField()
    embedding_model = models.CharField(max_length=100, blank=True, null=True)
    embedding_json = models.JSONField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"knowledge"."chunks"'
        unique_together = (('document', 'chunk_index'),)


class Documents(models.Model):
    id = models.BigAutoField(primary_key=True)
    title = models.CharField(max_length=250)
    source_url = models.TextField(blank=True, null=True)
    content = models.TextField(blank=True, null=True)
    doc_type = models.CharField(max_length=60, blank=True, null=True)
    status = models.CharField(max_length=30, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"knowledge"."documents"'


from django.contrib.postgres.fields import ArrayField


class RagMessages(models.Model):
    id = models.BigAutoField(primary_key=True)
    session = models.ForeignKey('RagSessions', models.DO_NOTHING)
    role = models.CharField(max_length=20)
    content = models.TextField()
    retrieved_chunk_ids = ArrayField(models.BigIntegerField(), blank=True, null=True)
    model_name = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"knowledge"."rag_messages"'


class RagSessions(models.Model):
    id = models.BigAutoField(primary_key=True)
    user_id = models.BigIntegerField(blank=True, null=True)
    title = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"knowledge"."rag_sessions"'
