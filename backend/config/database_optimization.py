# Database Optimization Configuration

import os
from django.db import connection
from django.core.management.base import BaseCommand
from django.db.models import QuerySet
from django.db.models.query import Prefetch
import logging
from typing import List, Dict, Any, Optional
from contextlib import contextmanager
import time

logger = logging.getLogger(__name__)

# Database connection pool settings
DATABASE_POOL_SETTINGS = {
    'CONN_MAX_AGE': 600,  # 10 minutes
    'CONN_HEALTH_CHECKS': True,
    'OPTIONS': {
        'MAX_CONNS': 20,
        'MIN_CONNS': 5,
        'server_side_binding': True,
        'application_name': 'erp_system',
        'connect_timeout': 10,
        'options': '-c default_transaction_isolation=read_committed'
    }
}

# Query optimization settings
QUERY_OPTIMIZATION = {
    'SELECT_RELATED_DEPTH': 3,
    'PREFETCH_RELATED_DEPTH': 2,
    'BULK_CREATE_BATCH_SIZE': 1000,
    'BULK_UPDATE_BATCH_SIZE': 1000,
    'ITERATOR_CHUNK_SIZE': 2000,
}

# Index recommendations for AI/ML models
AI_ML_INDEXES = [
    # AIModel indexes
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_models_type_status ON ai_models(model_type, status);",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_models_created_by_status ON ai_models(created_by_id, status);",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_models_last_run ON ai_models(last_run) WHERE last_run IS NOT NULL;",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_models_accuracy ON ai_models(accuracy) WHERE accuracy IS NOT NULL;",
    
    # TrainingJob indexes
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_training_jobs_model_status ON training_jobs(model_id, status);",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_training_jobs_status_created ON training_jobs(status, created_at);",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_training_jobs_progress ON training_jobs(progress) WHERE status = 'training';",
    
    # ModelPrediction indexes
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_model_predictions_model_created ON model_predictions(model_id, created_at);",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_model_predictions_confidence ON model_predictions(confidence) WHERE confidence IS NOT NULL;",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_model_predictions_created_by ON model_predictions(created_by_id, created_at);",
    
    # BiasDetectionResult indexes
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bias_results_model_score ON bias_detection_results(model_id, overall_score);",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bias_results_detected_at ON bias_detection_results(detected_at);",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bias_results_method ON bias_detection_results(detection_method);",
    
    # GovernancePolicy indexes
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_governance_policies_type_status ON governance_policies(policy_type, status);",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_governance_policies_scope_status ON governance_policies(scope, status);",
    
    # PolicyViolation indexes
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_policy_violations_policy_status ON policy_violations(policy_id, status);",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_policy_violations_model_severity ON policy_violations(model_id, severity);",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_policy_violations_responsible_status ON policy_violations(responsible_id, status);",
    
    # StreamingDataSource indexes
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_streaming_sources_type_status ON streaming_data_sources(source_type, status);",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_streaming_sources_status_message ON streaming_data_sources(status, last_message_at);",
    
    # StreamingEvent indexes
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_streaming_events_source_type ON streaming_events(source_id, event_type);",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_streaming_events_timestamp_severity ON streaming_events(timestamp, severity);",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_streaming_events_processed_created ON streaming_events(processed, created_at);",
]

# Composite indexes for complex queries
COMPOSITE_INDEXES = [
    # Multi-column indexes for common query patterns
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_models_composite ON ai_models(status, model_type, created_at) WHERE status IN ('deployed', 'training');",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_training_jobs_composite ON training_jobs(model_id, status, created_at) WHERE status != 'completed';",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_predictions_composite ON model_predictions(model_id, created_at, confidence) WHERE confidence > 0.5;",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_violations_composite ON policy_violations(responsible_id, status, severity, detected_at) WHERE status != 'resolved';",
]

# Partial indexes for filtered queries
PARTIAL_INDEXES = [
    # Indexes for active/important records only
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_active_models ON ai_models(id, name) WHERE status IN ('deployed', 'training', 'validating');",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_running_jobs ON training_jobs(id, model_id, progress) WHERE status IN ('training', 'validating');",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_high_confidence_predictions ON model_predictions(id, model_id, created_at) WHERE confidence > 0.8;",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_critical_violations ON policy_violations(id, policy_id, model_id) WHERE severity = 'critical' AND status != 'resolved';",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recent_events ON streaming_events(id, source_id, event_type) WHERE created_at > NOW() - INTERVAL '7 days';",
]

# JSON field indexes for better performance
JSON_INDEXES = [
    # GIN indexes for JSON fields
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_models_parameters_gin ON ai_models USING GIN (parameters);",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_models_architecture_gin ON ai_models USING GIN (architecture);",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_training_metrics_gin ON training_jobs USING GIN (training_metrics);",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prediction_data_gin ON model_predictions USING GIN (input_data);",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bias_metrics_gin ON bias_detection_results USING GIN (metrics);",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_streaming_data_gin ON streaming_events USING GIN (data);",
]


class QueryOptimizer:
    """Database query optimization utilities"""
    
    @staticmethod
    def optimize_queryset(queryset: QuerySet, select_related: List[str] = None, 
                         prefetch_related: List[str] = None) -> QuerySet:
        """Apply common optimizations to a queryset"""
        
        if select_related:
            queryset = queryset.select_related(*select_related)
        
        if prefetch_related:
            queryset = queryset.prefetch_related(*prefetch_related)
        
        return queryset
    
    @staticmethod
    def get_ai_models_optimized():
        """Get AI models with optimized queries"""
        from apps.ai_ml.models import AIModel
        
        return AIModel.objects.select_related(
            'created_by'
        ).prefetch_related(
            Prefetch(
                'training_jobs',
                queryset=TrainingJob.objects.select_related().order_by('-created_at')[:5]
            ),
            Prefetch(
                'predictions',
                queryset=ModelPrediction.objects.select_related('created_by').order_by('-created_at')[:10]
            )
        )
    
    @staticmethod
    def get_training_jobs_with_models():
        """Get training jobs with model data"""
        from apps.ai_ml.models import TrainingJob
        
        return TrainingJob.objects.select_related(
            'model',
            'model__created_by'
        ).order_by('-created_at')
    
    @staticmethod
    def get_predictions_with_context():
        """Get predictions with full context"""
        from apps.ai_ml.models import ModelPrediction
        
        return ModelPrediction.objects.select_related(
            'model',
            'model__created_by',
            'created_by'
        ).order_by('-created_at')
    
    @staticmethod
    def get_policy_violations_dashboard():
        """Get policy violations for dashboard"""
        from apps.ai_ml.models import PolicyViolation
        
        return PolicyViolation.objects.select_related(
            'policy',
            'model',
            'model__created_by',
            'responsible',
            'resolved_by'
        ).filter(
            status__in=['open', 'in_progress']
        ).order_by('-detected_at')


class DatabaseAnalyzer:
    """Database performance analysis utilities"""
    
    @staticmethod
    def analyze_slow_queries(limit: int = 10) -> List[Dict[str, Any]]:
        """Analyze slow queries from PostgreSQL logs"""
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    query,
                    calls,
                    total_time,
                    mean_time,
                    rows,
                    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
                FROM pg_stat_statements 
                ORDER BY total_time DESC 
                LIMIT %s;
            """, [limit])
            
            columns = [col[0] for col in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    @staticmethod
    def get_table_sizes() -> List[Dict[str, Any]]:
        """Get table sizes for optimization planning"""
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    schemaname,
                    tablename,
                    attname,
                    n_distinct,
                    correlation,
                    most_common_vals,
                    most_common_freqs
                FROM pg_stats 
                WHERE schemaname = 'public'
                ORDER BY tablename, attname;
            """)
            
            columns = [col[0] for col in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    @staticmethod
    def get_index_usage() -> List[Dict[str, Any]]:
        """Get index usage statistics"""
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    schemaname,
                    tablename,
                    indexname,
                    idx_tup_read,
                    idx_tup_fetch,
                    idx_scan
                FROM pg_stat_user_indexes 
                ORDER BY idx_scan DESC;
            """)
            
            columns = [col[0] for col in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    @staticmethod
    def get_cache_hit_ratio() -> float:
        """Get database cache hit ratio"""
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) AS cache_hit_ratio
                FROM pg_statio_user_tables;
            """)
            
            result = cursor.fetchone()
            return float(result[0]) if result and result[0] else 0.0


@contextmanager
def query_debugger(query_name: str):
    """Context manager for debugging query performance"""
    start_time = time.time()
    initial_queries = len(connection.queries)
    
    try:
        yield
    finally:
        end_time = time.time()
        final_queries = len(connection.queries)
        
        execution_time = end_time - start_time
        query_count = final_queries - initial_queries
        
        logger.info(f"Query Debug - {query_name}:")
        logger.info(f"  Execution time: {execution_time:.3f}s")
        logger.info(f"  Query count: {query_count}")
        
        if query_count > 10:
            logger.warning(f"High query count detected for {query_name}")
        
        if execution_time > 1.0:
            logger.warning(f"Slow execution detected for {query_name}")


def create_database_indexes():
    """Create all recommended database indexes"""
    with connection.cursor() as cursor:
        logger.info("Creating AI/ML database indexes...")
        
        # Create basic indexes
        for index_sql in AI_ML_INDEXES:
            try:
                cursor.execute(index_sql)
                logger.info(f"Created index: {index_sql[:50]}...")
            except Exception as e:
                logger.error(f"Failed to create index: {str(e)}")
        
        # Create composite indexes
        for index_sql in COMPOSITE_INDEXES:
            try:
                cursor.execute(index_sql)
                logger.info(f"Created composite index: {index_sql[:50]}...")
            except Exception as e:
                logger.error(f"Failed to create composite index: {str(e)}")
        
        # Create partial indexes
        for index_sql in PARTIAL_INDEXES:
            try:
                cursor.execute(index_sql)
                logger.info(f"Created partial index: {index_sql[:50]}...")
            except Exception as e:
                logger.error(f"Failed to create partial index: {str(e)}")
        
        # Create JSON indexes
        for index_sql in JSON_INDEXES:
            try:
                cursor.execute(index_sql)
                logger.info(f"Created JSON index: {index_sql[:50]}...")
            except Exception as e:
                logger.error(f"Failed to create JSON index: {str(e)}")
        
        logger.info("Database index creation completed")


def optimize_database_settings():
    """Apply database optimization settings"""
    optimization_queries = [
        # Connection settings
        "ALTER SYSTEM SET max_connections = 200;",
        "ALTER SYSTEM SET shared_buffers = '256MB';",
        "ALTER SYSTEM SET effective_cache_size = '1GB';",
        "ALTER SYSTEM SET maintenance_work_mem = '64MB';",
        "ALTER SYSTEM SET checkpoint_completion_target = 0.9;",
        "ALTER SYSTEM SET wal_buffers = '16MB';",
        "ALTER SYSTEM SET default_statistics_target = 100;",
        "ALTER SYSTEM SET random_page_cost = 1.1;",
        "ALTER SYSTEM SET effective_io_concurrency = 200;",
        
        # Query planner settings
        "ALTER SYSTEM SET enable_seqscan = on;",
        "ALTER SYSTEM SET enable_indexscan = on;",
        "ALTER SYSTEM SET enable_bitmapscan = on;",
        "ALTER SYSTEM SET enable_hashjoin = on;",
        "ALTER SYSTEM SET enable_mergejoin = on;",
        "ALTER SYSTEM SET enable_nestloop = on;",
        
        # Logging settings for monitoring
        "ALTER SYSTEM SET log_min_duration_statement = 1000;",
        "ALTER SYSTEM SET log_checkpoints = on;",
        "ALTER SYSTEM SET log_connections = on;",
        "ALTER SYSTEM SET log_disconnections = on;",
        "ALTER SYSTEM SET log_lock_waits = on;",
        
        # Auto vacuum settings
        "ALTER SYSTEM SET autovacuum = on;",
        "ALTER SYSTEM SET autovacuum_max_workers = 3;",
        "ALTER SYSTEM SET autovacuum_naptime = '1min';",
        "ALTER SYSTEM SET autovacuum_vacuum_threshold = 50;",
        "ALTER SYSTEM SET autovacuum_analyze_threshold = 50;",
    ]
    
    with connection.cursor() as cursor:
        for query in optimization_queries:
            try:
                cursor.execute(query)
                logger.info(f"Applied setting: {query}")
            except Exception as e:
                logger.error(f"Failed to apply setting {query}: {str(e)}")
        
        # Reload configuration
        try:
            cursor.execute("SELECT pg_reload_conf();")
            logger.info("Database configuration reloaded")
        except Exception as e:
            logger.error(f"Failed to reload configuration: {str(e)}")


# Export commonly used functions
__all__ = [
    'QueryOptimizer',
    'DatabaseAnalyzer',
    'query_debugger',
    'create_database_indexes',
    'optimize_database_settings',
    'DATABASE_POOL_SETTINGS',
    'QUERY_OPTIMIZATION',
]
