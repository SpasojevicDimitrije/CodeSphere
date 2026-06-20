import type { PreSignUpTriggerHandler } from 'aws-lambda';

// Hackathon: skip the email-confirmation step so signup is instant on stage.
// Auto-confirms every new user and marks their email as verified.
export const handler: PreSignUpTriggerHandler = async (event) => {
  event.response.autoConfirmUser = true;
  event.response.autoVerifyEmail = true;
  return event;
};
