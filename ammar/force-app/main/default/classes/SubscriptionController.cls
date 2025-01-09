public with sharing class SubscriptionController {
    // Get tier-specific features dynamically
    @AuraEnabled(cacheable=true)
    public static List<String> getTierFeatures(String tierName) {
        SubscriptionTier__mdt tier = [SELECT Features__c FROM SubscriptionTier__mdt WHERE MasterLabel = :tierName LIMIT 1];
        return tier.Features__c.split(',');
    }

    // Renew subscription
    @AuraEnabled(cacheable=true)
    public static void renewSubscription(String userId) {
        Subscription__c subscription = [SELECT Id, ExpiryDate__c FROM Subscription__c WHERE UserId__c = :userId LIMIT 1];
        if (subscription != null) {
            subscription.ExpiryDate__c = System.today().addMonths(1); // Extend the expiry by one month
            update subscription;
        }
    }

    // Get usage status for a user
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getUsageStatus(String userId) {
        List<UsageData__c> usageData = [SELECT UsageType__c, 	UsageLimit__c, CurrentUsage__c FROM UsageData__c WHERE UserId__c = :userId];
        Map<String, Object> usageStatus = new Map<String, Object>();
        
        for (UsageData__c data : usageData) {
            usageStatus.put(data.UsageType__c, new Map<String, Object>{
                'limit' => data.UsageLimit__c,
                'currentUsage' => data.CurrentUsage__c,
                'percentage' => (data.CurrentUsage__c / data.UsageLimit__c) * 100
            });
        }
        
        return usageStatus;
    }
}