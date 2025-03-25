
import { supabase } from '../../integrations/supabase/client';

export interface FeedbackAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  keyThemes: string[];
  actionableInsights: string[];
  churnRisk: 'low' | 'moderate' | 'high';
}

// In a real implementation, this would call an AI service to analyze feedback
export const analyzeFeedback = async (feedback: Record<string, any>): Promise<FeedbackAnalysis> => {
  // Mock implementation - in a real app, this would call an AI service
  try {
    console.log('Analyzing feedback:', feedback);
    
    // Extract sentiment from ratings
    const satisfactionRating = feedback.satisfaction || 0;
    const recommendationRating = feedback.recommendation || 0;
    
    // Calculate average sentiment score
    const avgScore = (satisfactionRating + recommendationRating) / 2;
    
    // Determine sentiment category
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (avgScore >= 8) sentiment = 'positive';
    else if (avgScore <= 5) sentiment = 'negative';
    
    // Determine churn risk based on ratings
    let churnRisk: 'low' | 'moderate' | 'high' = 'moderate';
    if (avgScore >= 8) churnRisk = 'low';
    else if (avgScore <= 5) churnRisk = 'high';
    
    // Mock key themes based on text answers
    const featureText = feedback.features || '';
    const missingText = feedback.missing || '';
    const competitorsText = feedback.competitors || '';
    
    const combinedText = `${featureText} ${missingText} ${competitorsText}`.toLowerCase();
    
    const keyThemes = [];
    const actionableInsights = [];
    
    // Extract key themes based on common keywords
    if (combinedText.includes('pricing') || combinedText.includes('expensive') || combinedText.includes('cost')) {
      keyThemes.push('Pricing Concerns');
      actionableInsights.push('Consider offering more flexible pricing plans');
    }
    
    if (combinedText.includes('ui') || combinedText.includes('interface') || combinedText.includes('design')) {
      keyThemes.push('User Interface');
      actionableInsights.push('Review UI/UX design for improved usability');
    }
    
    if (combinedText.includes('feature') || combinedText.includes('functionality') || combinedText.includes('missing')) {
      keyThemes.push('Feature Requests');
      actionableInsights.push('Prioritize new feature development based on customer requests');
    }
    
    if (combinedText.includes('support') || combinedText.includes('help') || combinedText.includes('service')) {
      keyThemes.push('Customer Support');
      actionableInsights.push('Improve customer support response time and quality');
    }
    
    if (combinedText.includes('competitor') || combinedText.includes('alternative') || competitorsText.length > 10) {
      keyThemes.push('Competitor Awareness');
      actionableInsights.push('Conduct competitive analysis to identify market advantages');
    }
    
    // Ensure we always have some themes and insights
    if (keyThemes.length === 0) {
      keyThemes.push('General Product Experience');
    }
    
    if (actionableInsights.length === 0) {
      actionableInsights.push('Gather more specific feedback to generate actionable insights');
    }
    
    return {
      sentiment,
      score: avgScore,
      keyThemes,
      actionableInsights,
      churnRisk
    };
  } catch (error) {
    console.error('Error analyzing feedback:', error);
    return {
      sentiment: 'neutral',
      score: 5,
      keyThemes: ['Error processing feedback'],
      actionableInsights: ['Check system logs for feedback processing errors'],
      churnRisk: 'moderate'
    };
  }
};

// In a real implementation, this would store feedback in your database
export const storeFeedback = async (customerId: string, feedback: Record<string, any>, analysis?: FeedbackAnalysis) => {
  try {
    console.log('Storing feedback for customer:', customerId, feedback, analysis);
    // In a real implementation, you would store this in your database
    return true;
  } catch (error) {
    console.error('Error storing feedback:', error);
    return false;
  }
};
