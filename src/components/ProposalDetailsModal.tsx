
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar, CheckCircle, AlertCircle, Clock, Send } from "lucide-react";

interface ProposalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: {
    id: string;
    title: string;
    content: string;
    compliance_analysis: any;
    status: string;
    deadline?: string;
    submission_date?: string;
    opportunity_id: string;
    created_at: string;
  } | null;
}

const ProposalDetailsModal: React.FC<ProposalDetailsModalProps> = ({
  isOpen,
  onClose,
  proposal
}) => {
  if (!proposal) return null;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "in progress":
        return "bg-yellow-100 text-yellow-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "in review":
        return "bg-purple-100 text-purple-800";
      case "won":
        return "bg-green-100 text-green-800";
      case "lost":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "draft":
        return <FileText className="h-4 w-4" />;
      case "in progress":
        return <Clock className="h-4 w-4" />;
      case "submitted":
        return <Send className="h-4 w-4" />;
      case "in review":
        return <AlertCircle className="h-4 w-4" />;
      case "won":
        return <CheckCircle className="h-4 w-4" />;
      case "lost":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getComplianceScore = () => {
    if (!proposal.compliance_analysis) return null;
    
    const analysis = proposal.compliance_analysis;
    if (typeof analysis === 'object' && analysis.score) {
      return analysis.score;
    }
    if (typeof analysis === 'object' && analysis.compliance_score) {
      return analysis.compliance_score;
    }
    return null;
  };

  const formatProposalContent = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      
      console.log('Parsed JSON:', parsed); // Debug log
      
      // Check multiple possible data structures
      let proposalData = null;
      
      // Try different possible structures
      if (parsed.proposal) {
        proposalData = parsed.proposal;
        console.log('Found nested proposal object');
      } else if (parsed.content && typeof parsed.content === 'object') {
        proposalData = parsed.content;
        console.log('Found content object');
      } else if (typeof parsed === 'object' && (parsed.opportunity_title || parsed.executive_summary)) {
        proposalData = parsed;
        console.log('Using root object as proposal data');
      } else {
        console.log('No recognizable proposal structure found');
        return `# Raw Proposal Content\n\n${JSON.stringify(parsed, null, 2)}`;
      }
      
      console.log('Final proposal data:', proposalData); // Debug log

      // Helper function to clean text
      const cleanText = (text: string) => {
        if (!text) return '';
        return text
          .replace(/\\n/g, ' ') // Replace \n with space
          .replace(/\\/g, '') // Remove backslashes
          .replace(/\/+/g, ' ') // Replace multiple forward slashes with space
          .replace(/\./g, ' → ') // Replace periods with arrows for better hierarchy display
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .trim();
      };

      const {
        opportunity_title,
        solicitation_number,
        client,
        company_name,
        naics_code,
        due_date,
        executive_summary,
        technical_approach,
        past_performance,
        pricing,
        compliance,
        contact_information,
        attachments,
        notes
      } = proposalData;

      const sections = [];

      // Proposal Summary
      sections.push("# Proposal Summary");
      if (opportunity_title) {
        sections.push(`**Opportunity Title:** ${cleanText(opportunity_title)}`);
      }
      if (solicitation_number) {
        sections.push(`**Solicitation Number:** ${cleanText(solicitation_number)}`);
      }
      if (client) {
        sections.push(`**Client:** ${cleanText(client)}`);
      }
      if (company_name) {
        sections.push(`**Company:** ${cleanText(company_name)}`);
      }
      if (naics_code) {
        sections.push(`**NAICS Code:** ${cleanText(naics_code)}`);
      }
      if (due_date) {
        const formattedDate = new Date(due_date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        sections.push(`**Proposal Due Date:** ${formattedDate}`);
      }

      sections.push("");
      sections.push("---");

      // Executive Summary
      if (executive_summary) {
        sections.push("");
        sections.push("## Executive Summary");
        sections.push(cleanText(executive_summary));
        sections.push("");
        sections.push("---");
      }

      // Technical Approach
      if (technical_approach) {
        sections.push("");
        sections.push("## Technical Approach");
        sections.push(cleanText(technical_approach));
        sections.push("");
        sections.push("---");
      }

      // Past Performance
      if (past_performance) {
        sections.push("");
        sections.push("## Past Performance");
        sections.push(cleanText(past_performance));
        sections.push("");
        sections.push("---");
      }

      // Pricing Strategy
      if (pricing) {
        sections.push("");
        sections.push("## Pricing Strategy");
        if (pricing.pricing_methodology) {
          sections.push(`- **Methodology:** ${cleanText(pricing.pricing_methodology)}`);
        }
        if (pricing.total_price) {
          sections.push(`- **Total Price:** ${cleanText(pricing.total_price)}`);
        }
        if (pricing.discounts) {
          sections.push(`- **Discounts:** ${cleanText(pricing.discounts)}`);
        }
        sections.push("");
        sections.push("---");
      }

      // Compliance and Certifications
      if (compliance) {
        sections.push("");
        sections.push("## Compliance and Certifications");
        
        if (compliance.sam_registration) {
          sections.push(`- **SAM Registration:** ${cleanText(compliance.sam_registration)}`);
        }
        
        if (compliance.certifications && Array.isArray(compliance.certifications)) {
          sections.push(`- **Certifications:** ${compliance.certifications.map(cert => cleanText(cert)).join(", ")}`);
        }
        
        if (compliance.naics_alignment) {
          sections.push(`- **NAICS Alignment:** ${cleanText(compliance.naics_alignment)}`);
        }
        
        if (compliance.regulations_adherence && Array.isArray(compliance.regulations_adherence)) {
          sections.push(`- **Regulatory Adherence:**`);
          compliance.regulations_adherence.forEach((reg: string) => {
            sections.push(`  - ${cleanText(reg)}`);
          });
        }
        
        if (compliance.quality_assurance) {
          sections.push(`- **Quality Assurance:** ${cleanText(compliance.quality_assurance)}`);
        }
        
        sections.push("");
        sections.push("---");
      }

      // Attachments
      if (attachments && Array.isArray(attachments)) {
        sections.push("");
        sections.push("## Attachments");
        attachments.forEach((attachment: string) => {
          sections.push(`- ${cleanText(attachment)}`);
        });
        sections.push("");
        sections.push("---");
      }

      // Additional Notes
      if (notes && Array.isArray(notes)) {
        sections.push("");
        sections.push("## Notes");
        notes.forEach((note: string) => {
          sections.push(`- ${cleanText(note)}`);
        });
        sections.push("");
        sections.push("---");
      }

      // Contact Information
      if (contact_information) {
        sections.push("");
        sections.push("## Contact Information");
        const contact = contact_information;
        if (contact.company) sections.push(`- **Company:** ${cleanText(contact.company)}`);
        if (contact.point_of_contact) sections.push(`- **Point of Contact:** ${cleanText(contact.point_of_contact)}`);
        if (contact.email) sections.push(`- **Email:** ${cleanText(contact.email)}`);
        if (contact.address) sections.push(`- **Address:** ${cleanText(contact.address)}`);
      }

      return sections.join('\n').trim();
      
    } catch (error) {
      // If parsing fails, return original content with basic cleaning
      return content
        .replace(/\\n/g, ' ')
        .replace(/\\/g, '')
        .replace(/\/+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
  };

  const formatComplianceAnalysis = (analysis: any) => {
    if (!analysis) return "No compliance analysis available";
    
    if (typeof analysis === 'string') return analysis;
    
    if (typeof analysis === 'object') {
      const sections = [];
      
      if (analysis.overall_score || analysis.compliance_score || analysis.score) {
        const score = analysis.overall_score || analysis.compliance_score || analysis.score;
        sections.push(`Overall Compliance Score: ${score}%`);
      }
      
      if (analysis.strengths && Array.isArray(analysis.strengths)) {
        sections.push(`Strengths:\n• ${analysis.strengths.join('\n• ')}`);
      }
      
      if (analysis.weaknesses && Array.isArray(analysis.weaknesses)) {
        sections.push(`Areas for Improvement:\n• ${analysis.weaknesses.join('\n• ')}`);
      }
      
      if (analysis.missing_requirements && Array.isArray(analysis.missing_requirements)) {
        sections.push(`Missing Requirements:\n• ${analysis.missing_requirements.join('\n• ')}`);
      }
      
      if (analysis.recommendations && Array.isArray(analysis.recommendations)) {
        sections.push(`Recommendations:\n• ${analysis.recommendations.join('\n• ')}`);
      }
      
      if (analysis.summary || analysis.conclusion) {
        sections.push(`Summary: ${analysis.summary || analysis.conclusion}`);
      }
      
      if (sections.length > 0) {
        return sections.join('\n\n');
      }
    }
    
    return JSON.stringify(analysis, null, 2);
  };

  const complianceScore = getComplianceScore();
  const formattedContent = formatProposalContent(proposal.content);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <FileText className="h-6 w-6 text-orange-600" />
            {proposal.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status and Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(proposal.status)}
                  <span className="font-medium text-sm">Status</span>
                </div>
                <Badge className={`text-sm ${getStatusColor(proposal.status)}`}>
                  {proposal.status}
                </Badge>
              </CardContent>
            </Card>
            
            {complianceScore && (
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm">Compliance Score</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {complianceScore}%
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-sm">
                    {proposal.submission_date ? 'Submitted' : 'Deadline'}
                  </span>
                </div>
                <div className="text-sm font-semibold text-orange-600">
                  {proposal.submission_date 
                    ? new Date(proposal.submission_date).toLocaleDateString()
                    : proposal.deadline 
                      ? new Date(proposal.deadline).toLocaleDateString()
                      : 'Not specified'
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Proposal Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Proposal Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <span className="font-medium text-sm text-gray-600">Created</span>
                  <p className="text-sm">{new Date(proposal.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formatted Proposal Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Proposal Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-6 border">
                {formattedContent && formattedContent !== proposal.content && formattedContent.length > 50 ? (
                  <div className="prose prose-sm max-w-none">
                    <div 
                      className="text-sm leading-relaxed text-gray-800"
                      dangerouslySetInnerHTML={{
                        __html: formattedContent
                          .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">$1</h1>')
                          .replace(/^## (.*$)/gm, '<h2 class="text-lg font-semibold text-gray-800 mb-3 mt-6">$1</h2>')
                          .replace(/^\*\*(.*?)\*\*/gm, '<div class="mb-2"><strong class="text-gray-900">$1</strong></div>')
                          .replace(/^- \*\*(.*?)\*\*/gm, '<div class="mb-2">- <strong class="text-gray-900">$1</strong></div>')
                          .replace(/^- (.*$)/gm, '<div class="ml-4 mb-1 text-gray-700">• $1</div>')
                          .replace(/^  - (.*$)/gm, '<div class="ml-8 mb-1 text-gray-600">• $1</div>')
                          .replace(/---/g, '<hr class="my-4 border-gray-300">')
                          .replace(/\n\n/g, '<div class="mb-4"></div>')
                          .replace(/\n/g, '<br>')
                      }}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-amber-700 bg-amber-50 p-3 rounded border">
                      <p className="font-medium">Debug Information:</p>
                      <p className="text-xs">Formatted content available: {formattedContent ? 'Yes' : 'No'}</p>
                      <p className="text-xs">Formatted length: {formattedContent?.length || 0}</p>
                      <p className="text-xs">Original length: {proposal.content?.length || 0}</p>
                      <p className="text-xs">Are they equal: {formattedContent === proposal.content ? 'Yes' : 'No'}</p>
                      <p className="text-xs">First 50 chars of formatted: {formattedContent?.substring(0, 50)}...</p>
                    </div>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-4 rounded border max-h-96 overflow-auto">
                      {proposal.content}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Compliance Analysis */}
          {proposal.compliance_analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Compliance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-gray-700">
                    {formatComplianceAnalysis(proposal.compliance_analysis)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Raw Data (Collapsible) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-600">Raw Proposal Data</CardTitle>
            </CardHeader>
            <CardContent>
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900 mb-3">
                  Click to view raw proposal content
                </summary>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                    {proposal.content}
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

export default ProposalDetailsModal;
