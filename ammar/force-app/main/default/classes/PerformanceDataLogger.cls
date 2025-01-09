public with sharing class PerformanceDataLogger {

    /**
     * Logs performance metrics and alerts to the PerformanceData__c object.
     */
    @AuraEnabled
    public static void logPerformanceData(Decimal cpuUsage, Decimal memoryUsage, String status) {
        PerformanceData__c data = new PerformanceData__c(
            CPU_Usage__c = cpuUsage,
            Memory_Usage__c = memoryUsage,
            Status__c = status,
            Timestamp__c = System.now()
        );
        insert data;
    }

    /**
     * Retrieves threshold values for performance metrics.
     */
    @AuraEnabled(cacheable=true)
    public static Map<String, PerformanceThreshold__mdt> getThresholds() {
        Map<String, PerformanceThreshold__mdt> thresholds = new Map<String, PerformanceThreshold__mdt>();
        for (PerformanceThreshold__mdt threshold : [
            SELECT Metric__c, WarningThreshold__c, CriticalThreshold__c 
            FROM PerformanceThreshold__mdt
        ]) {
            thresholds.put(threshold.Metric__c, threshold);
        }
        return thresholds;
    }
}