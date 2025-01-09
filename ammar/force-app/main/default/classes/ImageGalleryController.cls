public with sharing class ImageGalleryController {
    @AuraEnabled(cacheable=true)
    public static List<Image__c> getImages() {
        return [SELECT Id, Name, Url__c, IsFavorite__c FROM Image__c ORDER BY Name];
    }

    @AuraEnabled
    public static void uploadImage(String fileName, String base64Data) {
        String imageUrl = saveFile(fileName, base64Data);

        Image__c newImage = new Image__c(
            Name = fileName,
            Url__c = imageUrl,
            IsFavorite__c = false
        );
        insert newImage;
    }

    @AuraEnabled
    public static void deleteImage(Id imageId) {
        delete [SELECT Id FROM Image__c WHERE Id = :imageId];
    }

    @AuraEnabled
    public static void toggleFavorite(Id imageId) {
        Image__c img = [SELECT Id, IsFavorite__c FROM Image__c WHERE Id = :imageId LIMIT 1];
        img.IsFavorite__c = !img.IsFavorite__c;
        update img;
    }

    private static String saveFile(String fileName, String base64Data) {
        ContentVersion content = new ContentVersion();
        content.Title = fileName;
        content.PathOnClient = fileName;
        content.VersionData = EncodingUtil.base64Decode(base64Data);
        content.IsMajorVersion = true;
        insert content;

        ContentVersion insertedContent = [
            SELECT Id, ContentDocumentId
            FROM ContentVersion
            WHERE Id = :content.Id
            LIMIT 1
        ];

        String contentDocumentId = insertedContent.ContentDocumentId;
        String contentVersionId = insertedContent.Id;

        List<ContentDocumentLink> existingLinks = [
            SELECT Id
            FROM ContentDocumentLink
            WHERE ContentDocumentId = :contentDocumentId
            AND LinkedEntityId = :UserInfo.getUserId()
            LIMIT 1
        ];

        if (existingLinks.isEmpty()) {
            ContentDocumentLink contentLink = new ContentDocumentLink();
            contentLink.ContentDocumentId = contentDocumentId;
            contentLink.LinkedEntityId = UserInfo.getUserId();
            contentLink.ShareType = 'I'; // Inferred permission
            contentLink.Visibility = 'AllUsers';
            insert contentLink;
        }

        ContentDistribution distribution = new ContentDistribution();
        distribution.Name = fileName;
        distribution.ContentVersionId = contentVersionId;
        distribution.PreferencesAllowViewInBrowser = true;
        distribution.PreferencesAllowOriginalDownload = true;
        insert distribution;

        ContentDistribution insertedDistribution = [
            SELECT DistributionPublicUrl, ContentDownloadUrl
            FROM ContentDistribution
            WHERE Id = :distribution.Id
            LIMIT 1
        ];

        return insertedDistribution.ContentDownloadUrl;
    }
}