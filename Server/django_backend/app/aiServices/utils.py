from typing import Dict, Any, List
from ..userProfile.models import UserProfile

def get_ai_user_preferences(user) -> Dict[str, Any]:
    """
    Extracts user preferences from the UserProfile and formats them for the AI service.
    """
    try:
        profile = user.profile
    except UserProfile.DoesNotExist:
        return {
            "dietary_restrictions": [],
            "preferences_summary": "No user profile found."
        }

    # 1. Array of Dietary Restrictions (Allergies + Dietary Preferences)
    dietary_restrictions = []
    dietary_restrictions.extend([p.name for p in profile.dietary_preferences.all()])
    dietary_restrictions.extend([a.name for a in profile.allergies.all()])
    
    # 2. Comprehensive String Summary
    summary_parts = []
    
    if profile.dietary_preferences.exists():
        summary_parts.append(f"Dietary Preferences: {', '.join([p.name for p in profile.dietary_preferences.all()])}")
    
    if profile.allergies.exists():
        summary_parts.append(f"Allergies: {', '.join([a.name for a in profile.allergies.all()])}")
    
    if profile.disliked_ingredients.exists():
        summary_parts.append(f"Disliked Ingredients: {', '.join([i.name for i in profile.disliked_ingredients.all()])}")
    
    if profile.skill_level:
        summary_parts.append(f"Cooking Skill Level: {profile.skill_level}")
    
    if profile.preferred_cooking_time:
        summary_parts.append(f"Preferred Cooking Time: {profile.preferred_cooking_time}")
    
    if profile.household_size:
        summary_parts.append(f"Household Size: {profile.household_size}")
    
    if profile.preferred_cuisines.exists():
        summary_parts.append(f"Preferred Cuisines: {', '.join([c.name for c in profile.preferred_cuisines.all()])}")
    
    if profile.kitchen_equipment.exists():
        summary_parts.append(f"Kitchen Equipment Available: {', '.join([e.name for e in profile.kitchen_equipment.all()])}")
    
    if profile.health_goals.exists():
        summary_parts.append(f"Health Goals: {', '.join([g.name for g in profile.health_goals.all()])}")
    
    if profile.activity_level:
        summary_parts.append(f"Activity Level: {profile.activity_level}")
    
    if profile.weight_goal:
        summary_parts.append(f"Weight Goal: {profile.weight_goal}")

    preferences_summary = ". ".join(summary_parts) + "." if summary_parts else "No specific preferences set."

    return {
        "dietary_restrictions": list(set(dietary_restrictions)), # Remove duplicates
        "preferences_summary": preferences_summary
    }
