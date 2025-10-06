import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  DollarSign,
  Users
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useDashboardData } from "@/hooks/useDashboardData";
import { safeParseJson } from '@/lib/utils';

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "draft":
      return "bg-gray-100 text-gray-800";
    case "in progress":
      return "bg-accent/10 text-accent";
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

const Dashboard = () => {
  const { dashboardData, loading } = useDashboardData();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    {
      title: "Total Opportunities",
      value: dashboardData.totalOpportunities,
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Saved Opportunities",
      value: dashboardData.savedOpportunities,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Active Proposals",
      value: dashboardData.draftProposals,
      icon: FileText,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Submitted Proposals",
      value: dashboardData.submittedProposals,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back — here’s a summary of your contracts and activity.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button className="button-primary">Create Proposal</Button>
            <Button variant="ghost">Import Data</Button>
          </div>
        </div>

        {/* Data Correlation Warning */}
        {dashboardData.orphanedProposals > 0 && (
                <Card className="border-accent/30 bg-accent/10">
            <CardHeader>
              <CardTitle className="flex items-center text-accent">
                <AlertCircle className="h-5 w-5 mr-2 text-accent" />
                Data Correlation Issue Detected
              </CardTitle>
              <CardDescription className="text-accent/80">
                Some proposals are not properly linked to opportunities in your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-accent">
                    <span className="font-semibold">{dashboardData.orphanedProposals}</span> out of{" "}
                    <span className="font-semibold">{dashboardData.totalProposals}</span> proposals are not linked to opportunities
                  </p>
                  <p className="text-xs text-accent/80 mt-1">
                    This may affect reporting accuracy and proposal tracking
                  </p>
                </div>
                <Button variant="outline" size="sm" className="text-yellow-800 border-yellow-300">
                  Review Proposals
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-muted-foreground">{stat.title}</div>
                  <div className="text-2xl font-bold text-foreground mt-1">{stat.value}</div>
                </div>
                <div className={`p-3 rounded-lg`} style={{ background: 'rgba(0,64,128,0.04)' }}>
                  <stat.icon className={`${stat.color} h-5 w-5`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Feed (takes 2 columns on large screens) */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-accent" />
                Recent Opportunities
              </CardTitle>
              <CardDescription>
                Latest opportunities from your pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentOpportunities.length > 0 ? (
                  dashboardData.recentOpportunities.map((opportunity, index) => {
                    // Parse the opportunity data if it's a JSON string
                    let parsedData = opportunity.opportunity_data;
                    parsedData = safeParseJson(opportunity.opportunity_data);
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {parsedData?.title || `Opportunity ${opportunity.opportunity_id}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {opportunity.source_platform} • {new Date(opportunity.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {opportunity.is_saved && (
                            <Badge variant="secondary" className="text-xs">Saved</Badge>
                          )}
                          {opportunity.is_applied && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">Applied</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-sm">No recent opportunities found</p>
                )}
              </div>
            </CardContent>
            </Card>

            {/* Recent Proposals */}
            <Card>
              <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-accent" />
                Recent Proposals
              </CardTitle>
              <CardDescription>
                Your latest proposal activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentProposals.length > 0 ? (
                  dashboardData.recentProposals.map((proposal, index) => {
                    // Try to get opportunity title from proposal content
                    let displayTitle = proposal.title;
                    if (proposal.content) {
                      try {
                        const parsed = JSON.parse(proposal.content);
                        const proposalData = parsed.proposal || parsed;
                        if (proposalData.opportunity_title) {
                          displayTitle = proposalData.opportunity_title;
                        }
                      } catch (error) {
                        // Keep original title if parsing fails
                      }
                    }
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{displayTitle}</p>
                          <p className="text-xs text-gray-500">
                            Status: {proposal.status} • {new Date(proposal.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(proposal.status)}>
                          {proposal.status}
                        </Badge>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-sm">No recent proposals found</p>
                )}
              </div>
            </CardContent>
            </Card>
          </div>

          {/* Right: Summary / Quick Actions */}
          <aside className="space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Revenue (30d)</div>
                  <div className="text-xl font-bold text-foreground mt-1">${(dashboardData as any).revenue || '0'}</div>
                </div>
                <DollarSign className="h-6 w-6 text-accent" />
              </div>
              <Progress value={(dashboardData as any).revenueProgress || 0} />
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Team</div>
                  <div className="text-lg font-bold text-foreground mt-1">{(dashboardData as any).teamSize || 1} members</div>
                </div>
                <Users className="h-6 w-6 text-accent" />
              </div>
              <Button className="w-full button-primary">Invite Member</Button>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-3">
                <Button variant="outline" className="justify-start h-auto p-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-secondary p-2 rounded-md">
                      <Target className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Browse Opportunities</p>
                      <p className="text-xs text-muted-foreground">Find new contracting opportunities</p>
                    </div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-secondary p-2 rounded-md">
                      <FileText className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Create Proposal</p>
                      <p className="text-xs text-muted-foreground">Start a new proposal</p>
                    </div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-secondary p-2 rounded-md">
                      <Users className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">AI Consultant</p>
                      <p className="text-xs text-muted-foreground">Get expert guidance</p>
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </aside>
        </div>
        
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;