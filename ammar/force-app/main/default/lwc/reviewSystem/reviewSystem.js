import { LightningElement, track, wire } from 'lwc';
// Importing the Apex methods from the server-side controller
import fetchReviews from '@salesforce/apex/ReviewController.fetchReviews';
import createReview from '@salesforce/apex/ReviewController.createReview';

export default class ReviewSystem extends LightningElement {
    @track reviews = [];   // Holds the list of existing reviews
    @track reviewFields = {
        productId: '',
        rating: '',
        comment: ''
    };

    // Wire the fetchReviews Apex method to load existing reviews when the component initializes
    @wire(fetchReviews)
    wiredReviews({ error, data }) {
        if (data) {
            this.reviews = data;
        } else if (error) {
            // Handle any errors here (e.g. show a toast or console log)
            console.error('Error fetching reviews:', error);
        }
    }

    // Getter to determine if there are no reviews yet
    get noReviews() {
        return !this.reviews || this.reviews.length === 0;
    }

    /**
     * handleFieldChange(event)
     * 
     * Captures user input in the form fields (Product ID, Rating, Comment).
     */
    handleFieldChange(event) {
        const fieldName = event.target.name;
        this.reviewFields[fieldName] = event.target.value;
    }

    /**
     * handleSubmit(event)
     * 
     * Invoked when the user submits the form.
     * 1. Prevent default form submission.
     * 2. Validate the inputs.
     * 3. Call the Apex method to create the new review record.
     * 4. Refresh the local list of reviews.
     */
    handleSubmit(event) {
        event.preventDefault();
        
        // Basic validation before dispatching the new review
        const { productId, rating, comment } = this.reviewFields;
        if(!this.isValidReview(productId, rating, comment)) {
            // Here you might show an error message or toast
            console.warn('Invalid review submission');
            return;
        }

        // Prepare the new record for ProductReview__c
        const newReview = {
            ProductId__c: productId,
            // In a real-world scenario, the UserId__c could be the current user’s ID from the session
            UserId__c: '005xxxxxxxxxxxx', // Replace with appropriate logic
            Rating__c: parseInt(rating, 10),
            Comment__c: comment,
            // Timestamp__c can be set automatically on the server or pass new Date() if needed
        };

        // Call the Apex method to create the review
        createReview({ newReview })
            .then(result => {
                // result contains the newly created record
                // Optionally push this new review into the local array
                this.reviews = [result, ...this.reviews];

                // Dispatch a custom event if you'd like other components to know
                // For demonstration, we'll just keep it local
                // const reviewEvent = new CustomEvent('reviewadded', {
                //     detail: result,
                //     bubbles: true,
                //     composed: true
                // });
                // this.dispatchEvent(reviewEvent);

                // Clear the form
                this.reviewFields = {
                    productId: '',
                    rating: '',
                    comment: ''
                };
            })
            .catch(error => {
                console.error('Error creating review:', error);
            });
    }

    /**
     * isValidReview(productId, rating, comment)
     * 
     * Ensures the user inputs meet certain criteria before creating a new review record.
     */
    isValidReview(productId, rating, comment) {
        if(!productId || !rating || !comment) {
            return false;
        }
        if(rating < 1 || rating > 5) {
            return false;
        }
        return true;
    }
}