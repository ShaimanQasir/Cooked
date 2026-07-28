from django.core.cache import cache
from typing import Callable, Any, Optional, List
import logging

logger = logging.getLogger(__name__)

# Default Cache Timeouts (in seconds)
DEFAULT_CACHE_TIMEOUT = 300       # 5 minutes for general dynamic data
POPULAR_RECIPES_TIMEOUT = 600     # 10 minutes for popular recipes
AUX_DATA_TIMEOUT = 3600           # 1 hour for auxiliary data (cuisines, dietary)

def get_cached_data(key: str) -> Optional[Any]:
    """
    Safely retrieves cached value by key.
    Returns None if cache miss or error.
    """
    try:
        return cache.get(key)
    except Exception as e:
        logger.warning(f"Cache GET error for key '{key}': {str(e)}")
        return None

def set_cached_data(key: str, data: Any, timeout: int = DEFAULT_CACHE_TIMEOUT) -> None:
    """
    Safely stores value in cache with specified timeout.
    """
    try:
        cache.set(key, data, timeout=timeout)
    except Exception as e:
        logger.warning(f"Cache SET error for key '{key}': {str(e)}")

def delete_cached_keys(*keys: str) -> None:
    """
    Safely removes one or multiple specific cache keys.
    Usage: delete_cached_keys('recipes_list_anon', 'popular_recipes')
    """
    for key in keys:
        try:
            cache.delete(key)
        except Exception as e:
            logger.warning(f"Cache DELETE error for key '{key}': {str(e)}")

def delete_cache_pattern(pattern: str) -> None:
    """
    Deletes all cache keys matching pattern (e.g. '*recipes_list_*').
    Supports django-redis pattern matching with fallback to explicit key deletion.
    """
    try:
        if hasattr(cache, 'delete_pattern'):
            cache.delete_pattern(pattern)
        else:
            delete_cached_keys('recipes_list_anon', 'popular_recipes_list', 'cookbooks_list_all')
    except Exception as e:
        logger.warning(f"Cache delete_pattern error for '{pattern}': {str(e)}")

def get_or_set_cache(key: str, fetch_callback: Callable[[], Any], timeout: int = DEFAULT_CACHE_TIMEOUT) -> Any:
    """
    Generic parameterized cache wrapper.
    Attempts cache lookup; on miss, executes fetch_callback(), stores result in cache, and returns it.
    Eliminates repetitive cache boilerplate across views.
    """
    cached = get_cached_data(key)
    if cached is not None:
        return cached

    fresh_data = fetch_callback()
    if fresh_data is not None:
        set_cached_data(key, fresh_data, timeout=timeout)
    return fresh_data

def invalidate_recipe_caches(user_id: Optional[int] = None) -> None:
    """
    Invalidates ALL recipe lists, popular recipes, and cookbook cache entries across all users.
    Triggers automatically on CREATE, UPDATE, and DELETE operations.
    """
    delete_cache_pattern('*recipes_list_*')
    delete_cache_pattern('*popular_recipes*')
    delete_cache_pattern('*cookbooks_list*')
    if user_id:
        delete_cached_keys(f'recipes_list_{user_id}', f'cookbooks_list_{user_id}')

def invalidate_cookbook_caches(user_id: Optional[int] = None) -> None:
    """
    Invalidates ALL cookbook cache entries upon create, update, or delete.
    """
    delete_cache_pattern('*cookbooks_list*')
    if user_id:
        delete_cached_keys(f'cookbooks_list_{user_id}')

def invalidate_grocery_caches(user_id: Optional[int] = None) -> None:
    """
    Invalidates grocery item caches upon create, update, or delete.
    """
    delete_cache_pattern('*grocery_list*')
    if user_id:
        delete_cached_keys(f'grocery_list_{user_id}')
