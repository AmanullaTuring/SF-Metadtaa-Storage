/**
 * ReviewController.cls
 * 
 * Handles data operations for ProductReview__c.
 */
public with sharing class ReviewController {
    @AuraEnabled(cacheable=true)
    public static List<ProductReview__c> fetchReviews() {
        // Query existing reviews, ordered by the most recent submission
        return [
            SELECT Id, ProductId__c, UserId__c, Rating__c, Comment__c, Timestamp__c 
            FROM ProductReview__c 
            ORDER BY Timestamp__c DESC
        ];
    }

    @AuraEnabled
    public static ProductReview__c createReview(ProductReview__c newReview) {
        // Insert the new review into the custom object
        insert newReview;
        return newReview;
    }
}