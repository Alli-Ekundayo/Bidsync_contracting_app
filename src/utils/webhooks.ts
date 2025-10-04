
import { WEBHOOK_URLS } from '@/config/constants';

export const sendToAIConsultantWebhook = async (message: string, userId: string): Promise<string> => {
  try {
    const response = await fetch(WEBHOOK_URLS.aiConsultant, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/plain',
      },
      body: JSON.stringify({
        message,
        userId,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      // Attempt to read response body for better diagnostics
      let bodyText = '';
      try {
        bodyText = await response.text();
      } catch (e) {
        bodyText = '<unreadable response body>';
      }
      console.error(`Webhook POST failed: ${WEBHOOK_URLS.aiConsultant} - status: ${response.status} - body:`, bodyText);
      throw new Error(`Webhook POST failed with status ${response.status}: ${bodyText}`);
    }

    // Always return the webhook response as plain text for the AI consultant
    return await response.text();
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
      // Attempt to read response body for better diagnostics
      let bodyText = '';
      try {
        bodyText = await response.text();
      } catch (e) {
        bodyText = '<unreadable response body>';
      }
      console.error(`Webhook POST failed: ${WEBHOOK_URLS.createProposal} - status: ${response.status} - body:`, bodyText);
      throw new Error(`Webhook POST failed with status ${response.status}: ${bodyText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await response.json();
    }
    return await response.text();
  } catch (error) {
    console.error('Error sending to create proposal webhook:', error);
    throw error;
  }
};
