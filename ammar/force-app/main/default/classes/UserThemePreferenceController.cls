public with sharing class UserThemePreferenceController {

    @AuraEnabled(cacheable=true)
    public static String getUserTheme() {
        Id currentUserId = UserInfo.getUserId();
        User_Theme_Preference__c pref = [SELECT Id, Theme__c FROM User_Theme_Preference__c WHERE UserId__c = :currentUserId LIMIT 1];
        if (pref != null && String.isNotBlank(pref.Theme__c)) {
            return pref.Theme__c;
        } else {
            // Default if not set
            return 'dark';
        }
    }

    @AuraEnabled
    public static void setUserTheme(String theme) {
        Id currentUserId = UserInfo.getUserId();
        User_Theme_Preference__c pref;

        // Try to fetch existing preference
        List<User_Theme_Preference__c> existing = [
            SELECT Id, Theme__c 
            FROM User_Theme_Preference__c 
            WHERE UserId__c = :currentUserId LIMIT 1
        ];

        if (!existing.isEmpty()) {
            pref = existing[0];
            pref.Theme__c = theme;
            update pref;
        } else {
            pref = new User_Theme_Preference__c(
                UserId__c = currentUserId,
                Theme__c = theme,
                Name = 'User Theme Preference'
            );
            insert pref;
        }
    }
}