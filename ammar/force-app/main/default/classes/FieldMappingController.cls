public with sharing class FieldMappingController {
    /**
     * Get marketing fields from custom metadata.
     */
    @AuraEnabled(cacheable=true)
    public static List<Map<String,String>> getMarketingFields() {
        List<Map<String,String>> results = new List<Map<String,String>>();
        for (Marketing_Field_Config__mdt mfc : [
            SELECT Field_API_Name__c, Field_Label__c 
            FROM Marketing_Field_Config__mdt
            ORDER BY Field_Label__c
        ]) {
            Map<String,String> fieldMap = new Map<String,String>();
            fieldMap.put('label', mfc.Field_Label__c);
            fieldMap.put('value', mfc.Field_API_Name__c);
            results.add(fieldMap);
        }
        return results;
    }

    /**
     * Get lead fields (no hardcoding), including required/numeric rules.
     */
    @AuraEnabled(cacheable=true)
    public static List<Map<String,Object>> getLeadFields() {
        List<Map<String,Object>> leadFieldList = new List<Map<String,Object>>();
        for (Lead_Field_Config__mdt lfc : [
            SELECT Field_API_Name__c, Field_Label__c, Is_Required__c, Is_Numeric__c
            FROM Lead_Field_Config__mdt
            ORDER BY Field_Label__c
        ]) {
            Map<String,Object> fieldMap = new Map<String,Object>();
            fieldMap.put('label', lfc.Field_Label__c);
            fieldMap.put('value', lfc.Field_API_Name__c);
            fieldMap.put('isRequired', lfc.Is_Required__c);
            fieldMap.put('isNumeric', lfc.Is_Numeric__c);
            leadFieldList.add(fieldMap);
        }
        return leadFieldList;
    }

    /**
     * Fetch existing mappings from Field_Mapping__c.
     */
    @AuraEnabled(cacheable=false)
    public static List<Map<String,String>> getCurrentMappings() {
        List<Map<String,String>> results = new List<Map<String,String>>();
        for (Field_Mapping__c fm : [
            SELECT Name, Lead_Field__c 
            FROM Field_Mapping__c
            ORDER BY Name
        ]) {
            Map<String,String> m = new Map<String,String>();
            m.put('mktField', fm.Name);
            m.put('leadField', fm.Lead_Field__c);
            results.add(m);
        }
        return results;
    }

    /**
     * Save mappings to Field_Mapping__c.
     */
    @AuraEnabled
    public static void saveMappings(Map<String,String> fieldMappings) {
        delete [SELECT Id FROM Field_Mapping__c];
        List<Field_Mapping__c> inserts = new List<Field_Mapping__c>();
        for (String mktField : fieldMappings.keySet()) {
            Field_Mapping__c fm = new Field_Mapping__c(
                Name = mktField,
                Lead_Field__c = fieldMappings.get(mktField)
            );
            inserts.add(fm);
        }
        insert inserts;
    }

    /**
     * Validate data based on metadata rules and mock marketing data.
     */
    @AuraEnabled
    public static String validateData(Map<String,String> fieldMappings) {
        Map<String, Lead_Field_Config__mdt> leadFieldConfigs = new Map<String, Lead_Field_Config__mdt>();
        for (Lead_Field_Config__mdt lfc : [
            SELECT Field_API_Name__c, Is_Required__c, Is_Numeric__c 
            FROM Lead_Field_Config__mdt
        ]) {
            leadFieldConfigs.put(lfc.Field_API_Name__c, lfc);
        }

        Map<String, String> marketingDataMap = new Map<String, String>();
        for (Mock_Marketing_Data__mdt md : [
            SELECT Field_API_Name__c, Field_Value__c FROM Mock_Marketing_Data__mdt
        ]) {
            marketingDataMap.put(md.Field_API_Name__c, md.Field_Value__c);
        }

        for (String mktField : fieldMappings.keySet()) {
            String leadField = fieldMappings.get(mktField);
            Lead_Field_Config__mdt config = leadFieldConfigs.get(leadField);
            String val = marketingDataMap.containsKey(mktField) ? marketingDataMap.get(mktField) : '';

            if (config != null && config.Is_Required__c && (val == null || val.trim() == '')) {
                return 'Validation Error: The lead field "' + leadField + '" is required but empty.';
            }
            if (config != null && config.Is_Numeric__c && !val.isNumeric()) {
                return 'Validation Error: The lead field "' + leadField + '" expects numeric data but got "' + val + '".';
            }
            
        }
        return null; // No issues
    }

    /**
     * TEMPLATE MANAGEMENT
     * For templates, we have a custom object Mapping_Template__c:
     * Fields: Name (Text), TemplateData__c (Long Text) to store JSON.
     */

    /**
     * Fetch available templates for selection.
     */
    @AuraEnabled(cacheable=false)
    public static List<Map<String,String>> getTemplates() {
        List<Map<String,String>> results = new List<Map<String,String>>();
        for (Mapping_Template__c mt : [
            SELECT Id, Name FROM Mapping_Template__c ORDER BY Name
        ]) {
            Map<String,String> tmpl = new Map<String,String>();
            tmpl.put('label', mt.Name);
            tmpl.put('value', mt.Id);
            results.add(tmpl);
        }
        return results;
    }

    /**
     * Get template data by Id, returns TemplateData__c as JSON string.
     */
    @AuraEnabled(cacheable=false)
    public static String getTemplateData(Id templateId) {
        Mapping_Template__c mt = [
            SELECT TemplateData__c
            FROM Mapping_Template__c
            WHERE Id = :templateId
            LIMIT 1
        ];
        return mt.TemplateData__c;
    }

    /**
     * Save current mappings as a new template.
     * mappings is a map { mktField -> leadField } that we convert to JSON.
     */
    @AuraEnabled
    public static Id saveTemplate(String templateName, Map<String,String> mappings) {
        String jsonData = JSON.serialize(mappings);
        Mapping_Template__c mt = new Mapping_Template__c(
            Name = templateName,
            TemplateData__c = jsonData
        );
        insert mt;
        return mt.Id;
    }
}