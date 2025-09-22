
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Calendar, DollarSign, Star, MapPin, FileText, Target, Users, Clock } from "lucide-react";

interface OpportunityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: {
    id: string;
    opportunity_data: any;
    ai_analysis: any;
    relevance_score: number;
    source_platform: string;
    is_saved: boolean;
    is_applied: boolean;
  } | null;
}

const OpportunityDetailsModal: React.FC<OpportunityDetailsModalProps> = ({
  isOpen,
  onClose,
  opportunity
}) => {
  if (!opportunity) return null;

  const oppData = opportunity.opportunity_data || {};
  
  // Parse the opportunity data once
  const getParsedData = () => {
    if (typeof oppData === 'string') {
      try {
        return JSON.parse(oppData);
      } catch (error) {
        return oppData;
      }
    }
    return oppData;
  };
  
  const parsedData = getParsedData();

  const getOpportunityDescription = (oppData: any) => {
    return oppData.description || 
           oppData.summary || 
           oppData.overview || 
           oppData.details || 
           oppData.solicitation_description ||
           oppData.brief_description ||
           'No description available';
  };

  const formatOpportunityData = (oppData: any) => {
    console.log('=== Opportunity Data Debug ===');
    console.log('Full oppData:', oppData);
    console.log('oppData type:', typeof oppData);
    console.log('Available keys:', Object.keys(oppData || {}));
    console.log('oppData as string:', String(oppData));
    
    // Handle different data formats
    let parsedData: any = {};
    
    // First, try to parse if it's a JSON string
    if (typeof oppData === 'string') {
      try {
        parsedData = JSON.parse(oppData);
        console.log('Parsed from JSON string:', parsedData);
      } catch (error) {
        console.log('Failed to parse as JSON, trying backslash format...');
        // Fallback to backslash format parsing
        const pairs = oppData.split('\\\\');
        pairs.forEach(pair => {
          const colonIndex = pair.indexOf('\\:\\');
          if (colonIndex !== -1) {
            const key = pair.substring(0, colonIndex).replace(/\\/g, '');
            const value = pair.substring(colonIndex + 3).replace(/\\/g, '');
            if (key && value) {
              parsedData[key] = value;
            }
          }
        });
        console.log('Parsed from backslash format:', parsedData);
      }
    } else if (typeof oppData === 'object' && oppData !== null) {
      parsedData = oppData;
    }

    console.log('Final parsed data:', parsedData);
    
    const sections = [];
    
    // Title and basic info
    if (parsedData.title || oppData.title) {
      sections.push(`**Title:** ${parsedData.title || oppData.title}`);
    }
    
    // Agency and department
    if (parsedData.agency || oppData.agency) {
      sections.push(`**Agency:** ${parsedData.agency || oppData.agency}`);
    }
    if (parsedData.department || oppData.department) {
      sections.push(`**Department:** ${parsedData.department || oppData.department}`);
    }
    
    // Contract details
    if (parsedData.contract_type || oppData.contract_type) {
      sections.push(`**Contract Type:** ${parsedData.contract_type || oppData.contract_type}`);
    }
    if (parsedData.solicitation_number || parsedData.solicitationNumber || oppData.solicitation_number) {
      sections.push(`**Solicitation Number:** ${parsedData.solicitation_number || parsedData.solicitationNumber || oppData.solicitation_number}`);
    }
    if (parsedData.notice_id || parsedData.noticeId || oppData.notice_id) {
      sections.push(`**Notice ID:** ${parsedData.notice_id || parsedData.noticeId || oppData.notice_id}`);
    }
    
    // Financial information
    if (parsedData.value || parsedData.contract_value || parsedData.estimated_value || oppData.value || oppData.contract_value || oppData.estimated_value) {
      const value = parsedData.value || parsedData.contract_value || parsedData.estimated_value || oppData.value || oppData.contract_value || oppData.estimated_value;
      sections.push(`**Contract Value:** ${value}`);
    }
    
    // Dates
    if (parsedData.posted_date || parsedData.postedDate || parsedData.date_posted || oppData.posted_date || oppData.date_posted) {
      const date = parsedData.posted_date || parsedData.postedDate || parsedData.date_posted || oppData.posted_date || oppData.date_posted;
      sections.push(`**Posted Date:** ${new Date(date).toLocaleDateString()}`);
    }
    if (parsedData.deadline || parsedData.responseDeadLine || parsedData.response_deadline || parsedData.due_date || oppData.deadline || oppData.response_deadline || oppData.due_date) {
      const deadline = parsedData.deadline || parsedData.responseDeadLine || parsedData.response_deadline || parsedData.due_date || oppData.deadline || oppData.response_deadline || oppData.due_date;
      sections.push(`**Response Deadline:** ${new Date(deadline).toLocaleDateString()}`);
    }
    
    // Location and performance
    if (parsedData.location || parsedData.place_of_performance || oppData.location || oppData.place_of_performance) {
      const location = parsedData.location || parsedData.place_of_performance || oppData.location || oppData.place_of_performance;
      sections.push(`**Location/Place of Performance:** ${location}`);
    }
    
    // Set-aside information
    if ((parsedData.setAside || oppData.setAside) && (parsedData.setAside || oppData.setAside) !== "None") {
      sections.push(`**Set-Aside:** ${parsedData.setAside || oppData.setAside}`);
    }
    if (parsedData.set_aside_type || parsedData.typeOfSetAsideDescription || oppData.set_aside_type) {
      sections.push(`**Set-Aside Type:** ${parsedData.set_aside_type || parsedData.typeOfSetAsideDescription || oppData.set_aside_type}`);
    }
    
    // Classification codes
    if (parsedData.naics || parsedData.naicsCode || oppData.naics) {
      sections.push(`**NAICS Code:** ${parsedData.naics || parsedData.naicsCode || oppData.naics}`);
    }
    if (parsedData.psc_code || parsedData.classificationCode || oppData.psc_code) {
      sections.push(`**PSC Code:** ${parsedData.psc_code || parsedData.classificationCode || oppData.psc_code}`);
    }
    
    // Description
    const description = getOpportunityDescription(parsedData) || getOpportunityDescription(oppData);
    if (description && description !== 'No description available') {
      sections.push(`**Description:** ${description}`);
    }
    
    // Requirements
    if (parsedData.requirements || oppData.requirements) {
      sections.push(`**Requirements:** ${parsedData.requirements || oppData.requirements}`);
    }
    
    // Contact information
    const contact = parsedData.contact_info || parsedData.point_of_contact || parsedData.pointOfContact || oppData.contact_info || oppData.point_of_contact;
    if (contact) {
      if (typeof contact === 'string') {
        sections.push(`**Contact Information:** ${contact}`);
      } else if (typeof contact === 'object') {
        const contactDetails = [];
        if (contact.name || contact.fullName) contactDetails.push(`Name: ${contact.name || contact.fullName}`);
        if (contact.email) contactDetails.push(`Email: ${contact.email}`);
        if (contact.phone) contactDetails.push(`Phone: ${contact.phone}`);
        if (contactDetails.length > 0) {
          sections.push(`**Contact Information:** ${contactDetails.join(', ')}`);
        }
      }
    }
    
    // Additional information
    if (parsedData.additional_info || oppData.additional_info) {
      sections.push(`**Additional Information:** ${parsedData.additional_info || oppData.additional_info}`);
    }
    
    // Source information
    if (parsedData.source || oppData.source) {
      sections.push(`**Source:** ${parsedData.source || oppData.source}`);
    }
    
    // URL
    if (parsedData.url || parsedData.uiLink || oppData.url) {
      sections.push(`**URL:** ${parsedData.url || parsedData.uiLink || oppData.url}`);
    }
    
    return sections.length > 0 ? sections.join('\n\n') : 'No detailed information available';
  };

  const formatAIAnalysis = (analysis: any) => {
    if (!analysis) return "No AI analysis available";
    
    if (typeof analysis === 'string') return analysis;
    
    if (typeof analysis === 'object') {
      const sections = [];
      
      if (analysis.summary) {
        sections.push(`**Summary:** ${analysis.summary}`);
      }
      if (analysis.key_requirements && Array.isArray(analysis.key_requirements)) {
        sections.push(`**Key Requirements:**\n• ${analysis.key_requirements.join('\n• ')}`);
      }
      if (analysis.match_reasons && Array.isArray(analysis.match_reasons)) {
        sections.push(`**Why This Matches:**\n• ${analysis.match_reasons.join('\n• ')}`);
      }
      if (analysis.recommendations) {
        sections.push(`**Recommendations:** ${analysis.recommendations}`);
      }
      
      if (sections.length > 0) {
        return sections.join('\n\n');
      }
    }
    
    return JSON.stringify(analysis, null, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <FileText className="h-6 w-6 text-orange-600" />
            {parsedData.title || 'Untitled Opportunity'}
            {opportunity.is_saved && (
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Key Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm">Relevance Score</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {opportunity.relevance_score || 0}%
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-sm">Contract Value</span>
                </div>
                 <div className="text-sm font-semibold text-green-600">
                   {parsedData.value || parsedData.contract_value || parsedData.estimated_value || 'Not specified'}
                 </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-sm">Deadline</span>
                </div>
                 <div className="text-sm font-semibold text-orange-600">
                   {parsedData.deadline || parsedData.response_deadline || parsedData.due_date ? 
                     new Date(parsedData.deadline || parsedData.response_deadline || parsedData.due_date).toLocaleDateString() : 
                     'Not specified'}
                 </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-sm">Source</span>
                </div>
                <Badge variant="outline" className="text-xs">{opportunity.source_platform}</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Formatted Opportunity Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Opportunity Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-6 border">
                <div className="prose prose-sm max-w-none">
                  <div 
                    className="text-sm leading-relaxed text-gray-800 whitespace-pre-line"
                    dangerouslySetInnerHTML={{
                      __html: formatOpportunityData(oppData)
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n\n/g, '<br><br>')
                        .replace(/\n/g, '<br>')
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status and Classification */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Classification & Status</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex flex-wrap gap-2">
                 {parsedData.naics && (
                   <Badge variant="secondary" className="gap-1">
                     <Users className="h-3 w-3" />
                     NAICS: {parsedData.naics}
                   </Badge>
                 )}
                 {parsedData.psc_code && (
                   <Badge variant="secondary">PSC: {parsedData.psc_code}</Badge>
                 )}
                 {parsedData.setAside && parsedData.setAside !== "None" && (
                   <Badge variant="secondary">{parsedData.setAside}</Badge>
                 )}
                 {parsedData.contract_type && (
                   <Badge variant="outline">{parsedData.contract_type}</Badge>
                 )}
                 {opportunity.is_applied && (
                   <Badge className="bg-green-100 text-green-800">
                     <Clock className="h-3 w-3 mr-1" />
                     Applied
                   </Badge>
                 )}
               </div>
            </CardContent>
          </Card>

          {/* AI Analysis */}
          {opportunity.ai_analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  AI Analysis & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <div 
                    className="text-sm text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: formatAIAnalysis(opportunity.ai_analysis)
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n\n/g, '<br><br>')
                        .replace(/\n/g, '<br>')
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Raw Data (Collapsible) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-600">Raw Opportunity Data</CardTitle>
            </CardHeader>
            <CardContent>
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900 mb-3">
                  Click to view complete raw opportunity data
                </summary>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                    {JSON.stringify(oppData, null, 2)
                      .replace(/\//g, ' → ')
                      .replace(/"/g, '')
                      .replace(/,/g, '')
                      .replace(/\{/g, '')
                      .replace(/\}/g, '')
                      .replace(/\[/g, '')
                      .replace(/\]/g, '')}
                  </pre>
                </div>
              </details>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OpportunityDetailsModal;
