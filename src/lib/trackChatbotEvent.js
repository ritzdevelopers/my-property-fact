/**
 * Chatbot analytics: GTM dataLayer + GA4.
 * Never send names, emails, phones, or free-text messages.
 *
 * @param {string} action  e.g. open | close | option_click | lead_submit
 * @param {{
 *   sessionId?: string,
 *   label?: string,
 *   project?: string,
 *   source?: string,
 *   resultCount?: number,
 *   messageLength?: number,
 * }} [params]
 */
export function trackChatbotEvent(action, params = {}) {
  if (typeof window === "undefined") return;

  const chatbotAction = String(action || "").trim();
  if (!chatbotAction) return;

  const pagePath =
    typeof window.location?.pathname === "string"
      ? window.location.pathname
      : "";

  const payload = {
    event: "mpf_chatbot",
    chatbot_action: chatbotAction,
    chatbot_session_id: params.sessionId || undefined,
    chatbot_label: params.label || undefined,
    chatbot_project: params.project || undefined,
    chatbot_source: params.source || undefined,
    chatbot_result_count:
      typeof params.resultCount === "number" ? params.resultCount : undefined,
    chatbot_message_length:
      typeof params.messageLength === "number" ? params.messageLength : undefined,
    page_path: pagePath || undefined,
  };

  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ...payload });
  } catch {
    /* ignore */
  }

  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", "mpf_chatbot", {
        event_category: "mpf_chatbot",
        event_label: chatbotAction,
        chatbot_action: chatbotAction,
        chatbot_session_id: payload.chatbot_session_id,
        chatbot_label: payload.chatbot_label,
        chatbot_project: payload.chatbot_project,
        chatbot_source: payload.chatbot_source,
        chatbot_result_count: payload.chatbot_result_count,
        chatbot_message_length: payload.chatbot_message_length,
        page_path: payload.page_path,
      });
    }
  } catch {
    /* ignore */
  }

  if (chatbotAction === "lead_submit") {
    try {
      if (typeof window.gtag === "function") {
        window.gtag("event", "generate_lead", {
          event_category: "mpf_chatbot",
          lead_source: "chatbot",
          chatbot_project: payload.chatbot_project,
        });
      }
    } catch {
      /* ignore */
    }
    try {
      if (typeof window.fbq === "function") {
        window.fbq("track", "Lead", { content_name: "mpf_chatbot" });
      }
    } catch {
      /* ignore */
    }
  }
}
