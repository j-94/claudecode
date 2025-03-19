/**
 * Conversation Recovery Utilities
 * 
 * Functions related to recovering and managing conversation state
 */

import fs from 'fs';
import path from 'path';
import { getStateDirectory } from './stateDirectory.js';
import { logError } from './log.js';

/**
 * Load messages from a log file
 */
export async function loadMessagesFromLog(logPath, tools) {
  try {
    // Check if file exists
    if (!fs.existsSync(logPath)) {
      throw new Error(`Log file does not exist: ${logPath}`);
    }
    
    // Read and parse the log file
    const content = fs.readFileSync(logPath, 'utf8');
    const messages = JSON.parse(content);
    
    return messages;
  } catch (error) {
    logError(`Failed to load messages from log: ${error.message}`);
    throw error;
  }
}

/**
 * Deserialize message objects into usable form
 */
export function deserializeMessages(serializedMessages, tools) {
  try {
    if (!Array.isArray(serializedMessages)) {
      return [];
    }
    
    // Process the messages, recreating any tool references
    return serializedMessages.map(msg => {
      if (msg.type === 'tool-use' && msg.toolName) {
        // Reconnect tool references
        const tool = tools.find(t => t.name === msg.toolName);
        if (tool) {
          return {
            ...msg,
            tool
          };
        }
      }
      return msg;
    });
  } catch (error) {
    logError(`Failed to deserialize messages: ${error.message}`);
    return [];
  }
}

/**
 * Save conversation state for recovery
 */
export function saveConversationState(messages) {
  try {
    const recoveryPath = path.join(getStateDirectory(), 'conversation_recovery.json');
    fs.writeFileSync(
      recoveryPath,
      JSON.stringify({ messages, timestamp: Date.now() })
    );
    return true;
  } catch (error) {
    logError(`Failed to save conversation state: ${error.message}`);
    return false;
  }
}

/**
 * Loads conversation state for recovery
 */
export function loadConversationState() {
  try {
    const recoveryPath = path.join(getStateDirectory(), 'conversation_recovery.json');
    if (!fs.existsSync(recoveryPath)) {
      return null;
    }
    
    const data = JSON.parse(fs.readFileSync(recoveryPath, 'utf8'));
    // Expire recovery data after 24 hours
    if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
      fs.unlinkSync(recoveryPath);
      return null;
    }
    
    return data.messages;
  } catch (error) {
    logError(`Failed to load conversation state: ${error.message}`);
    return null;
  }
}

/**
 * Deletes conversation recovery file
 */
export function deleteConversationState() {
  try {
    const recoveryPath = path.join(getStateDirectory(), 'conversation_recovery.json');
    if (fs.existsSync(recoveryPath)) {
      fs.unlinkSync(recoveryPath);
    }
    return true;
  } catch (error) {
    logError(`Failed to delete conversation state: ${error.message}`);
    return false;
  }
}