import { LightningElement, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getImages from '@salesforce/apex/ImageGalleryController.getImages';
import deleteImage from '@salesforce/apex/ImageGalleryController.deleteImage';
import uploadImage from '@salesforce/apex/ImageGalleryController.uploadImage';
import toggleFavorite from '@salesforce/apex/ImageGalleryController.toggleFavorite';

export default class ImageGallery extends LightningElement {
    @track images = [];
    @track searchKey = '';
    wiredImagesResult;

    @wire(getImages)
    wiredImages(value) {
        this.wiredImagesResult = value;
        const { data, error } = value;
        if (data) {
            this.images = data;
        } else if (error) {
            console.error('Error fetching images:', error.body ? error.body.message : error);
        }
    }

    get totalImagesCount() {
        return this.images.length;
    }

    get favoriteImagesCount() {
        return this.images.filter(img => img.IsFavorite__c).length;
    }

    // Compute filtered images based on searchKey
    get filteredImages() {
        if (!this.searchKey) {
            return this.images;
        }
        const key = this.searchKey.toLowerCase();
        return this.images.filter(img => img.Name.toLowerCase().includes(key));
    }

    // Compute displayed images with iconName added
    get displayedImages() {
        return this.filteredImages.map(img => {
            const iconName = img.IsFavorite__c ? 'utility:favorite' : 'utility:favorite_border';
            return { ...img, iconName };
        });
    }

    get noResults() {
        return this.displayedImages.length === 0;
    }

    // Handle search input change
    handleSearch(event) {
        this.searchKey = event.target.value;
    }

    // Upload image
    handleUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const base64Data = reader.result.split(',')[1];
                uploadImage({ fileName: file.name, base64Data })
                    .then(() => {
                        return refreshApex(this.wiredImagesResult);
                    })
                    .catch((error) => {
                        console.error('Error uploading image:', error.body ? error.body.message : error);
                    });
            };
            reader.readAsDataURL(file);
        } else {
            alert('Please select a valid image file!');
        }
    }

    // Delete image
    handleDelete(event) {
        const imageId = event.target.dataset.id;
        if (confirm('Are you sure you want to delete this image?')) {
            deleteImage({ imageId })
                .then(() => {
                    return refreshApex(this.wiredImagesResult);
                })
                .catch((error) => {
                    console.error('Error deleting image:', error.body ? error.body.message : error);
                });
        }
    }

    // Toggle favorite status
    handleToggleFavorite(event) {
        const imageId = event.target.dataset.id;
        toggleFavorite({ imageId })
            .then(() => {
                return refreshApex(this.wiredImagesResult);
            })
            .catch(error => {
                console.error('Error toggling favorite:', error.body ? error.body.message : error);
            });
    }
}