# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class AiTasks(models.Model):
    id = models.BigAutoField(primary_key=True)
    requested_by = models.BigIntegerField(blank=True, null=True)
    task_type = models.CharField(max_length=80)
    model_name = models.CharField(max_length=120, blank=True, null=True)
    input_reference = models.JSONField(blank=True, null=True)
    output = models.JSONField(blank=True, null=True)
    status = models.CharField(max_length=30, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    finished_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"intelligence"."ai_tasks"'


class CvEvaluations(models.Model):
    id = models.BigAutoField(primary_key=True)
    cv_id = models.BigIntegerField()
    task = models.ForeignKey(AiTasks, models.DO_NOTHING, blank=True, null=True)
    rubric_version = models.CharField(max_length=80, blank=True, null=True)
    score = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    feedback = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"intelligence"."cv_evaluations"'


class MatchResults(models.Model):
    id = models.BigAutoField(primary_key=True)
    cv_id = models.BigIntegerField()
    job_id = models.BigIntegerField()
    algorithm_version = models.CharField(max_length=80)
    tfidf_cosine = models.DecimalField(max_digits=7, decimal_places=5, blank=True, null=True)
    skill_score = models.DecimalField(max_digits=7, decimal_places=5, blank=True, null=True)
    experience_score = models.DecimalField(max_digits=7, decimal_places=5, blank=True, null=True)
    hybrid_score = models.DecimalField(max_digits=7, decimal_places=5, blank=True, null=True)
    explanation = models.JSONField(blank=True, null=True)
    computed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"intelligence"."match_results"'
        unique_together = (('cv_id', 'job_id', 'algorithm_version'),)


class MockInterviews(models.Model):
    id = models.BigAutoField(primary_key=True)
    user_id = models.BigIntegerField()
    job_id = models.BigIntegerField(blank=True, null=True)
    rubric = models.ForeignKey('Rubrics', models.DO_NOTHING, blank=True, null=True)
    status = models.CharField(max_length=30, blank=True, null=True)
    questions = models.JSONField(blank=True, null=True)
    transcript = models.JSONField(blank=True, null=True)
    content_score = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    speech_metrics = models.JSONField(blank=True, null=True)
    dialogue_metrics = models.JSONField(blank=True, null=True)
    started_at = models.DateTimeField(blank=True, null=True)
    finished_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"intelligence"."mock_interviews"'


class PromptTemplates(models.Model):
    id = models.BigAutoField(primary_key=True)
    code = models.CharField(max_length=80)
    version = models.IntegerField()
    template = models.TextField()
    model_hint = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"intelligence"."prompt_templates"'
        unique_together = (('code', 'version'),)


class Recommendations(models.Model):
    id = models.BigAutoField(primary_key=True)
    candidate_id = models.BigIntegerField()
    job_id = models.BigIntegerField()
    match_result = models.ForeignKey(MatchResults, models.DO_NOTHING, blank=True, null=True)
    topsis_score = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    rank_position = models.IntegerField(blank=True, null=True)
    weights = models.JSONField(blank=True, null=True)
    generated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"intelligence"."recommendations"'


class Rubrics(models.Model):
    id = models.BigAutoField(primary_key=True)
    code = models.CharField(unique=True, max_length=80)
    title = models.CharField(max_length=160)
    criteria = models.JSONField()

    class Meta:
        managed = False
        db_table = '"intelligence"."rubrics"'
