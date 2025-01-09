public with sharing class ArticleController {
    @AuraEnabled(cacheable=true)
    public static List<Article__c> fetchArticles() {
        // Fetch articles with their likes and comments from a custom object
        return [
            SELECT Id, Name, Likes__c, Comments__c
            FROM Article__c
            ORDER BY CreatedDate DESC
        ];
    }

    @AuraEnabled
    public static void likeArticle(Id articleId) {
        // Increment the like count for the selected article
        Article__c article = [SELECT Likes__c FROM Article__c WHERE Id = :articleId LIMIT 1];
        article.Likes__c = (article.Likes__c == null) ? 1 : article.Likes__c + 1;
        update article;
    }

    @AuraEnabled
    public static void addComment(Id articleId, String comment) {
        // Append the new comment to the existing comments
        Article__c article = [SELECT Comments__c FROM Article__c WHERE Id = :articleId LIMIT 1];
        article.Comments__c = (article.Comments__c == null) ? comment : article.Comments__c + '\n' + comment;
        update article;
    }
}