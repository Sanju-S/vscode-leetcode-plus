import * as vscode from "vscode";

export interface SubmissionResult {
  status_msg: string;
  status_runtime?: string;
  status_memory?: string;
  input?: string;
  expected_output?: string;
  code_output?: string;
  std_output?: string;
  state?: string;
}

let panel: vscode.WebviewPanel | undefined;

/**
 * Creates or updates the live Results Panel.
 */
export function updateResultsPanel(result: SubmissionResult, isFinal: boolean) {
  if (!panel) {
    panel = vscode.window.createWebviewPanel(
      "leetcodeResults",
      "LeetCode Results",
      vscode.ViewColumn.One,
      { enableScripts: true, retainContextWhenHidden: true }
    );

    panel.onDidDispose(() => {
      panel = undefined;
    });
  }

  const style = `
    <style>
      body {
        font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
        padding: 20px;
        color: var(--vscode-editor-foreground);
        background: var(--vscode-editor-background);
      }
      h2 { margin-top: 0; }
      .accepted { color: #5fb865; }
      .wrong { color: #e06c75; }
      .pending { color: #e5c07b; }
      .info { color: #61afef; }
      pre {
        background: rgba(128,128,128,0.15);
        padding: 10px;
        border-radius: 6px;
        overflow-x: auto;
      }
      .section { margin-top: 15px; }
      .label {
        font-weight: bold;
        color: var(--vscode-editor-foreground);
      }
    </style>
  `;

  const statusMsg = result.status_msg || "Waiting for result...";
  const stateClass =
    statusMsg.toLowerCase().includes("accept")
      ? "accepted"
      : statusMsg.toLowerCase().includes("wrong")
      ? "wrong"
      : result.state === "PENDING" || result.state === "STARTED"
      ? "pending"
      : "info";

  const testCaseSection =
    result.input || result.expected_output || result.code_output
      ? `
      <div class="section">
        <h3>🧪 Test Case Info</h3>
        ${result.input ? `<p class="label">Input:</p><pre>${escapeHtml(result.input)}</pre>` : ""}
        ${result.expected_output ? `<p class="label">Expected Output:</p><pre>${escapeHtml(result.expected_output)}</pre>` : ""}
        ${result.code_output ? `<p class="label">Your Output:</p><pre>${escapeHtml(result.code_output)}</pre>` : ""}
      </div>
    `
      : "";

  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="UTF-8"><title>LeetCode Results</title>${style}</head>
      <body>
        <h2>Status: <span class="${stateClass}">${statusMsg}</span></h2>
        <p><b>Runtime:</b> ${result.status_runtime || "?"}</p>
        <p><b>Memory:</b> ${result.status_memory || "?"}</p>

        ${testCaseSection}

        ${
          result.std_output
            ? `<div class="section"><h3>Console Output</h3><pre>${escapeHtml(result.std_output)}</pre></div>`
            : ""
        }

        <p style="color:gray;">
          ${!isFinal ? "⏳ Refreshing until final result..." : "✅ Final result received."}
        </p>
      </body>
    </html>
  `;

  panel.webview.html = html;
}

function escapeHtml(text?: string): string {
  if (!text) {return "";}
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
