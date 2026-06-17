from django.db import models
from django.conf import settings
from app.userProfile.models import Cuisine, Allergy, Ingredient

class Recipe(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]

    title = models.CharField(max_length=200, unique=True)
    description = models.TextField()
    image = models.ImageField(upload_to='recipe_images/', null=True, blank=True)
    video_url = models.URLField(blank=True)
    
    difficulty = models.CharField(max_length=50, choices=DIFFICULTY_CHOICES)
    prep_time = models.IntegerField(help_text="In minutes")
    cook_time = models.IntegerField(help_text="In minutes")

    # Macros
    fats = models.IntegerField(default=0)
    carbs = models.IntegerField(default=0)
    proteins = models.IntegerField(default=0)
    calories = models.IntegerField(default=0)
    
    servings = models.IntegerField(default=1)
    instructions = models.TextField()
    
    # Relationships
    # Changed OneToOne to ForeignKey because many recipes can share one cuisine
    cuisine_type = models.ForeignKey(Cuisine, on_delete=models.SET_NULL, null=True, related_name='recipes')
    
    # Many-to-Many fields do not take on_delete
    allergen_info = models.ManyToManyField(Allergy, related_name='recipes', blank=True)
    ingredients = models.ManyToManyField(
        Ingredient, 
        through='RecipeIngredient',
        related_name='recipes'
    )

    # Changed OneToOne to ForeignKey because one user can create many recipes
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='recipes'
    )
    
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class RecipeIngredient(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='ingredient_details')
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50, blank=True, help_text="e.g., grams, cups, tbsp")

    def __str__(self):
        return f"{self.quantity} {self.unit} of {self.ingredient.name} in {self.recipe.title}"

class SavedRecipe(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_recipes')
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='saved_by_users')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'recipe') # Prevent saving the same recipe twice

    def __str__(self):
        return f"{self.user.username} saved {self.recipe.title}"

class RecipeRating(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ratings')
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='ratings')
    review = models.TextField(blank=True)
    rating = models.IntegerField(default=5) # You could add a validator for 1-5 here
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'recipe') # One rating per user per recipe

    def __str__(self):
        return f"{self.rating} stars for {self.recipe.title}"
