public with sharing class LanguageDetectionService {

    /**
     * Detects the user's preferred language.
     * @return ISO language code (e.g., en, es, fr).
     */
    @AuraEnabled(cacheable=true)
    public static String getUserPreferredLanguage() {
        User currentUser = [SELECT LanguageLocaleKey FROM User WHERE Id = :UserInfo.getUserId()];
        return currentUser.LanguageLocaleKey;
    }

    /**
     * Fetches the notification template for the specified language code.
     * Falls back to English if the translation is unavailable.
     * @param languageCode The ISO language code.
     * @return The notification template body.
     */
    @AuraEnabled(cacheable=true)
    public static String fetchTemplate(String languageCode) {
        List<LanguageMetadata__mdt> metadata = [
            SELECT TemplateReference__r.TemplateBody__c
            FROM LanguageMetadata__mdt
            WHERE LanguageCode__c = :languageCode
        ];
        if (!metadata.isEmpty()) {
            return metadata[0].TemplateReference__r.TemplateBody__c;
        }

        // Fallback to English if translation is unavailable
        List<LanguageMetadata__mdt> fallbackMetadata = [
            SELECT TemplateReference__r.TemplateBody__c
            FROM LanguageMetadata__mdt
            WHERE LanguageCode__c = 'en'
        ];
        return fallbackMetadata.isEmpty() ? 'Default Notification Template' : fallbackMetadata[0].TemplateReference__r.TemplateBody__c;
    }
}