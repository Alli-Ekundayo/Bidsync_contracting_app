
import { WEBHOOK_URLS } from '@/config/constants';

export const sendToAIConsultantWebhook = async (message: string, userId: string) => {
  try {
    const response = await fetch(WEBHOOK_URLS.aiConsultant, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        userId,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending message to AI consultant webhook:', error);
    throw error;
  }
};

export const sendToCreateProposalWebhook = async (userId: string, opportunityId: string) => {
  try {
    const response = await fetch(WEBHOOK_URLS.createProposal, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        opportunity_id: opportunityId,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending to create proposal webhook:', error);
    throw error;
  }
};
