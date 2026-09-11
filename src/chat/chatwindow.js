import 'regenerator-runtime/runtime';
import React, { useState, useEffect, useRef } from 'react';
import MenuIcon from '@material-ui/icons/Menu';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import './chatwindow.css';
import {
  dispatchCancerTypeSelection,
  dispatchCancerSignatureGroupSelection,
  getNeoNavBarContext,
} from '../constants/cancerTypes.js';
import { dispatchGenesSelection } from '../constants/navBarGenes.js';
import { dispatchSignatureSelection } from '../constants/navBarSignature.js';

const WELCOME_TEXT =
  "Hello! I'm the NeoXplorer chatbot assistant! How can I help you today?";

const CHAT_API_PATH = '/api/datasets/chatbot/chat';

/** Parse `{ error }` JSON from failed chat API responses. */
async function chatFetch(input, init) {
  const response = await fetch(input, init);
  if (!response.ok) {
    const text = await response.text();
    let message = text || `Chat API HTTP ${response.status}`;
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed.error === 'string' && parsed.error.length > 0) {
        message = parsed.error;
      }
    } catch (parseErr) {
      // keep raw text / status message
    }
    throw new Error(message);
  }
  return response;
}

function formatChatClientError(error, apiUrl) {
  if (!error) return null;
  const msg = error.message || String(error);
  if (msg === 'Failed to fetch' || msg === 'network error') {
    return {
      ...error,
      message:
        'Cannot reach the NeoXplorer chat API at ' +
        apiUrl +
        '. Check Node on port 8083, Apache /smartneoxplorer/ proxy (HTTPS vhost), and Node 18+.',
    };
  }
  if (/^\{.*"error"/.test(msg)) {
    try {
      const parsed = JSON.parse(msg);
      if (parsed && typeof parsed.error === 'string') {
        return { ...error, message: parsed.error };
      }
    } catch (parseErr) {
      // fall through
    }
  }
  return error;
}

/** @param {import('ai').UIMessage} message */
function getUiMessageText(message) {
  if (!message?.parts?.length) return '';
  return message.parts
    .filter((p) => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

function ChatMessageBody({ role, text }) {
  if (!text) return null;
  if (role === 'user') {
    return <span className="chat-msg-text">{text}</span>;
  }
  return (
    <div className="chat-msg-text chat-msg-markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  );
}

function ChatDockShell({ docked, dockOpen, setDockOpen, panelBody }) {
  useEffect(() => {
    if (!docked) return undefined;
    const el = document.getElementById('neo-top-nav');
    if (!el) return undefined;
    const apply = () => {
      document.documentElement.style.setProperty('--neo-chat-top-offset', `${el.offsetHeight}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, [docked]);

  const header = (
    <header className="chat-panel-header">
      {(!docked || dockOpen) && (
        <h1 className="chat-panel-title">NeoXplorer Chatbot</h1>
      )}
      {docked && (
        <button
          type="button"
          className="chat-dock-menu-btn"
          onClick={() => setDockOpen((o) => !o)}
          aria-expanded={dockOpen}
          aria-label={dockOpen ? 'Collapse chat panel' : 'Expand chat panel'}
        >
          <MenuIcon fontSize="small" />
        </button>
      )}
    </header>
  );

  if (!docked) {
    return (
      <div className="chat-panel">
        {header}
        {panelBody}
      </div>
    );
  }

  return (
    <aside
      className={`chat-dock-root ${dockOpen ? 'chat-dock-root--expanded' : 'chat-dock-root--collapsed'}`}
      aria-label="NeoXplorer Chatbot"
    >
      <div className="chat-panel">
        {header}
        {dockOpen && panelBody}
      </div>
    </aside>
  );
}

function ChatMessagesForm({
  messages,
  getMessageText,
  input,
  setInput,
  busy,
  onSubmit,
  error,
  onDismissError,
}) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-panel-body chat-panel-body--chat">
      {error && (
        <div className="chat-error" role="alert">
          <span>{error.message || String(error)}</span>
          {onDismissError && (
            <button type="button" className="chat-error-dismiss" onClick={onDismissError}>
              Dismiss
            </button>
          )}
        </div>
      )}
      <div className="chat-messages" aria-live="polite">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-msg chat-msg--${message.role === 'user' ? 'user' : 'assistant'}`}
          >
            <div className="chat-msg-label">
              {message.role === 'user' ? 'You' : 'NeoXplorer Chatbot'}
            </div>
            <div className="chat-msg-bubble">
              <ChatMessageBody role={message.role} text={getMessageText(message)} />
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        className="chat-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <input
          type="text"
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={busy}
          autoComplete="off"
        />
        <button type="submit" className="chat-send-btn" disabled={busy}>
          {busy ? '…' : 'Send'}
        </button>
      </form>
    </div>
  );
}

/** Offline / no API base — local echo only */
function ChatWindowOffline({
  docked = false,
  selectionState: _selectionState,
  setSelectionState,
  queryExport: _queryExport,
}) {
  const [dockOpen, setDockOpen] = useState(true);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content: WELCOME_TEXT,
    },
  ]);

  const getMessageText = (m) => m.content;

  const sendLocalAssistantEcho = () => {
    setBusy(true);
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content:
            'Thanks for your message. Live AI responses are not connected yet — this is offline mode.',
        },
      ]);
      setBusy(false);
    }, 450);
  };

  const handleSubmit = () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', content: text },
    ]);
    sendLocalAssistantEcho();
  };

  const panelBody = (
    <ChatMessagesForm
      messages={messages}
      getMessageText={getMessageText}
      input={input}
      setInput={setInput}
      busy={busy}
      onSubmit={handleSubmit}
    />
  );

  return (
    <ChatDockShell
      docked={docked}
      dockOpen={dockOpen}
      setDockOpen={setDockOpen}
      panelBody={panelBody}
    />
  );
}

/** Uses AI SDK streaming chat against NeoXplorer backend (UI message stream). */
function ChatWindowLive({
  docked = false,
  chatApiBase,
  selectionState,
  setSelectionState,
  currentViewedPage,
  onSelectHeatmapRow,
  queryExport,
  rowLabels,
  columns,
  tableForHeatmapSelectData,
  pancancerCancerTypeState,
  pancancerDoubleBarChartData,
  pancancerConcordanceState,
  pancancerVennState,
}) {
  const [dockOpen, setDockOpen] = useState(true);
  const [input, setInput] = useState('');
  const selectionRef = useRef(selectionState);
  selectionRef.current = selectionState;
  const queryExportRef = useRef(queryExport);
  queryExportRef.current = queryExport;
  const rowLabelsRef = useRef(rowLabels);
  rowLabelsRef.current = rowLabels;
  const columnsRef = useRef(columns);
  columnsRef.current = columns;
  const currentViewedPageRef = useRef(currentViewedPage);
  currentViewedPageRef.current = currentViewedPage;
  const tableForHeatmapSelectDataRef = useRef(tableForHeatmapSelectData);
  tableForHeatmapSelectDataRef.current = tableForHeatmapSelectData;
  const pancancerCancerTypeStateRef = useRef(pancancerCancerTypeState);
  pancancerCancerTypeStateRef.current = pancancerCancerTypeState;
  const pancancerDoubleBarChartDataRef = useRef(pancancerDoubleBarChartData);
  pancancerDoubleBarChartDataRef.current = pancancerDoubleBarChartData;
  const pancancerConcordanceStateRef = useRef(pancancerConcordanceState);
  pancancerConcordanceStateRef.current = pancancerConcordanceState;
  const pancancerVennStateRef = useRef(pancancerVennState);
  pancancerVennStateRef.current = pancancerVennState;

  const apiUrl = `${String(chatApiBase).replace(/\/$/, '')}${CHAT_API_PATH}`;

  const onSelectHeatmapRowRef = useRef(onSelectHeatmapRow);
  onSelectHeatmapRowRef.current = onSelectHeatmapRow;

  const { messages, sendMessage, status, error, clearError } = useChat({
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        parts: [{ type: 'text', text: WELCOME_TEXT }],
      },
    ],
    onError: (err) => {
      console.error('[NeoXplorer chat] request failed', { apiUrl, err });
    },
    onData: (part) => {
      if (part.type === 'data-SetNewSelectionState') {
        console.log('[chat] data-SetNewSelectionState', part.data);
        const { ok, selection } = part.data ?? {};
        if (ok && selection != null) {
          const applied = onSelectHeatmapRowRef.current?.(selection);
          if (!applied) {
            console.warn('[chat] could not apply heatmap row selection for', selection);
          }
        }
        return;
      }
      if (part.type === 'data-SetCancerType') {
        console.log('[chat] data-SetCancerType', part.data);
        const { ok, cancerType } = part.data ?? {};
        if (ok && cancerType != null) {
          const applied = dispatchCancerTypeSelection(cancerType);
          if (!applied) {
            console.warn('[chat] could not apply cancer type', cancerType);
          }
        }
        return;
      }
      if (part.type === 'data-SetCancerSignatureGroup') {
        console.log('[chat] data-SetCancerSignatureGroup', part.data);
        const { ok, cancerSignatureGroup } = part.data ?? {};
        if (ok && cancerSignatureGroup != null) {
          const applied = dispatchCancerSignatureGroupSelection(cancerSignatureGroup);
          if (!applied) {
            console.warn(
              '[chat] could not apply cancer signature group',
              cancerSignatureGroup,
            );
          }
        }
        return;
      }
      if (part.type === 'data-SetGenes') {
        console.log('[chat] data-SetGenes', part.data);
        const { ok, genes } = part.data ?? {};
        if (ok && Array.isArray(genes) && genes.length > 0) {
          const applied = dispatchGenesSelection(genes);
          if (!applied) {
            console.warn('[chat] could not apply gene filter', genes);
          }
        }
        return;
      }
      if (part.type === 'data-SetSignature') {
        console.log('[chat] data-SetSignature', part.data);
        const { ok, signature, displayName } = part.data ?? {};
        if (ok && signature != null) {
          const applied = dispatchSignatureSelection({ signature, simpleName: displayName });
          if (!applied) {
            console.warn('[chat] could not apply signature', signature);
          }
        }
      }
    },
    transport: new DefaultChatTransport({
      api: apiUrl,
      fetch: chatFetch,
      // Match axios elsewhere: no cross-origin cookies (8080 → 8081).
      // credentials: 'include' requires Access-Control-Allow-Credentials: true on the API.
      prepareSendMessagesRequest: ({ body, messages, id, trigger, messageId }) =>
        Promise.resolve({
          body: {
            ...(body && typeof body === 'object' ? body : {}),
            id,
            messages,
            trigger,
            messageId,
            selectionState: selectionRef.current ?? null,
            selection: selectionRef.current?.selection ?? null,
            heatmapQuery: queryExportRef.current?.heatmapQuery ?? null,
            queryExport: queryExportRef.current ?? null,
            rowLabels: rowLabelsRef.current ?? [],
            columns: columnsRef.current ?? [],
            currentCancerType:
              getNeoNavBarContext().cancerType ??
              queryExportRef.current?.cancer ??
              queryExportRef.current?.cancerType ??
              null,
            currentCancerSignatureGroup:
              getNeoNavBarContext().cancerSignatureGroup ?? null,
            currentGenes: getNeoNavBarContext().genes ?? null,
            currentSignature: getNeoNavBarContext().signature ?? null,
            currentSignatureDisplayName: getNeoNavBarContext().signatureDisplayName ?? null,
            signatureList: getNeoNavBarContext().signatureList ?? null,
            currentViewedPage: currentViewedPageRef.current ?? null,
            tableForHeatmapSelectData: tableForHeatmapSelectDataRef.current ?? null,
            pancancerCancerTypeState: pancancerCancerTypeStateRef.current ?? null,
            pancancerDoubleBarChartData: pancancerDoubleBarChartDataRef.current ?? null,
            pancancerConcordanceState: pancancerConcordanceStateRef.current ?? null,
            pancancerVennState: pancancerVennStateRef.current ?? null,
          },
        }),
    }),
  });

  const busy = status === 'streaming' || status === 'submitted';

  const displayError = formatChatClientError(error, apiUrl);

  const handleSubmit = () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    sendMessage({ text });
  };

  const panelBody = (
    <ChatMessagesForm
      messages={messages}
      getMessageText={getUiMessageText}
      input={input}
      setInput={setInput}
      busy={busy}
      onSubmit={handleSubmit}
      error={displayError}
      onDismissError={clearError}
    />
  );

  return (
    <ChatDockShell
      docked={docked}
      dockOpen={dockOpen}
      setDockOpen={setDockOpen}
      panelBody={panelBody}
    />
  );
}

/**
 * @param {{
 *   docked?: boolean;
 *   selectionState?: unknown;
 *   setSelectionState?: unknown;
 *   currentViewedPage?: string;
 *   tableForHeatmapSelectData?: unknown;
 *   pancancerCancerTypeState?: unknown;
 *   pancancerDoubleBarChartData?: unknown;
 *   pancancerConcordanceState?: unknown;
 *   pancancerVennState?: unknown;
 *   onSelectHeatmapRow?: (uid: string) => boolean;
 *   queryExport?: object;
 *   rowLabels?: string[];
 *   columns?: string[];
 *   chatApiBase?: string;
 *   liveChat?: boolean;
 * }} props
 */
function ChatWindow({
  docked = false,
  selectionState,
  setSelectionState,
  currentViewedPage,
  tableForHeatmapSelectData,
  pancancerCancerTypeState,
  pancancerDoubleBarChartData,
  pancancerConcordanceState,
  pancancerVennState,
  onSelectHeatmapRow,
  queryExport,
  rowLabels,
  columns,
  chatApiBase,
  liveChat = true,
}) {
  const useServer = Boolean(chatApiBase) && liveChat;

  if (useServer) {
    return (
      <ChatWindowLive
        docked={docked}
        chatApiBase={chatApiBase}
        selectionState={selectionState}
        setSelectionState={setSelectionState}
        currentViewedPage={currentViewedPage}
        tableForHeatmapSelectData={tableForHeatmapSelectData}
        pancancerCancerTypeState={pancancerCancerTypeState}
        pancancerDoubleBarChartData={pancancerDoubleBarChartData}
        pancancerConcordanceState={pancancerConcordanceState}
        pancancerVennState={pancancerVennState}
        onSelectHeatmapRow={onSelectHeatmapRow}
        queryExport={queryExport}
        rowLabels={rowLabels}
        columns={columns}
      />
    );
  }

  return (
    <ChatWindowOffline
      docked={docked}
      selectionState={selectionState}
      setSelectionState={setSelectionState}
      queryExport={queryExport}
    />
  );
}

export default ChatWindow;
