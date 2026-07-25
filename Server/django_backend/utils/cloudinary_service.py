import os
import logging
import cloudinary
import cloudinary.uploader
from django.conf import settings

logger = logging.getLogger(__name__)

# Initialize Cloudinary configuration
CLOUDINARY_CONFIG = getattr(settings, 'CLOUDINARY_STORAGE', {})
if CLOUDINARY_CONFIG.get('CLOUD_NAME'):
    cloudinary.config(
        cloud_name=CLOUDINARY_CONFIG.get('CLOUD_NAME'),
        api_key=CLOUDINARY_CONFIG.get('API_KEY'),
        api_secret=CLOUDINARY_CONFIG.get('API_SECRET')
    )


def upload_image(file_obj, folder_name: str) -> dict:
    """Uploads a file object to a specific Cloudinary folder with error handling."""
    """
    Uploads a file object to a specific Cloudinary folder.

    :param file_obj: UploadedFile or File object to upload
    :param folder_name: Name of target Cloudinary folder (e.g. 'recipes', 'profiles', 'cookbooks')
    :return: Dict containing 'url', 'public_id', and full API response
    """
    if not file_obj:
        return {"url": None, "public_id": None}

    try:
        response = cloudinary.uploader.upload(
            file_obj,
            folder=folder_name,
            use_filename=True,
            unique_filename=True
        )
        url = response.get("secure_url") or response.get("url")
        public_id = response.get("public_id")
        logger.info(f"[Cloudinary Service] Uploaded to '{folder_name}': {public_id}")
        return {
            "url": url,
            "public_id": public_id,
            "response": response
        }
    except Exception as e:
        logger.error(f"[Cloudinary Service] Upload error for folder '{folder_name}': {e}")
        return {"url": None, "public_id": None, "error": str(e)}


def delete_image(image_field_or_id) -> bool:
    """
    Deletes an image asset from Cloudinary.

    :param image_field_or_id: ImageField instance, file path string, or Cloudinary public_id
    :return: True if successfully deleted, False otherwise
    """
    if not image_field_or_id:
        return False

    try:
        file_name = getattr(image_field_or_id, 'name', str(image_field_or_id))
        if not file_name:
            return False

        # Cloudinary destroy API requires public_id without file extension
        public_id = os.path.splitext(file_name)[0]
        res = cloudinary.uploader.destroy(public_id)
        logger.info(f"[Cloudinary Service] Destroyed image '{public_id}': {res}")
        return res.get("result") == "ok"
    except Exception as e:
        logger.warning(f"[Cloudinary Service] Delete failed for '{image_field_or_id}': {e}")
        return False


def register_cloudinary_signals(model_class, image_field_name: str = 'image'):
    """
    Hooks automatic pre_save (image update cleanup) and post_delete (image deletion cleanup)
    signals for a Django model containing an image field.

    :param model_class: Django Model class (e.g. Recipe, User, CookBook)
    :param image_field_name: Name of the ImageField attribute on the model
    """
    from django.db.models.signals import pre_save, post_delete

    def pre_save_receiver(sender, instance, **kwargs):
        if not instance.pk:
            return
        try:
            old_instance = sender.objects.get(pk=instance.pk)
            old_image = getattr(old_instance, image_field_name, None)
            new_image = getattr(instance, image_field_name, None)
            if old_image and old_image != new_image:
                delete_image(old_image)
        except sender.DoesNotExist:
            pass

    def post_delete_receiver(sender, instance, **kwargs):
        image = getattr(instance, image_field_name, None)
        if image:
            delete_image(image)

    pre_save.connect(pre_save_receiver, sender=model_class, weak=False, dispatch_uid=f"{model_class.__name__}_pre_save_img")
    post_delete.connect(post_delete_receiver, sender=model_class, weak=False, dispatch_uid=f"{model_class.__name__}_post_delete_img")
