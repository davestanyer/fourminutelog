import { supabase } from './supabase';

const DEPLOY_COOLDOWN = 60000; // 1 minute cooldown between deployments
let lastDeployTime = 0;

export const canDeploy = (): { allowed: boolean; waitTime: number } => {
  const now = Date.now();
  const timeSinceLastDeploy = now - lastDeployTime;
  
  if (timeSinceLastDeploy < DEPLOY_COOLDOWN) {
    return {
      allowed: false,
      waitTime: Math.ceil((DEPLOY_COOLDOWN - timeSinceLastDeploy) / 1000)
    };
  }
  
  return { allowed: true, waitTime: 0 };
};

export const updateLastDeployTime = () => {
  lastDeployTime = Date.now();
};

export const getLastDeployTime = () => {
  return lastDeployTime;
};