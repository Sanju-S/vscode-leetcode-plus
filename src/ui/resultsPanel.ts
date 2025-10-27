import * as vscode from "vscode";

export interface SubmissionResult {
  status_msg: string;
  status_runtime?: string;
  status_memory?: string;
  input?: string;
  expected_output?: string;
  code_output?: string;
  std_output?: string;
}

/**
 * Opens a WebView panel showing submission results.
 */
export function showResultsPanel(result: SubmissionResult) {
  const panel = vscode.window.createWebviewPanel(
    "leetcodeResults",
    `LeetCode Results – ${result.status_msg}`,
    vscode.ViewColumn.One,
    { enableScripts: true, retainContextWhenHidden: true }
  );

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
      .info { color: #61afef; }
      pre {
        background: rgba(128,128,128,0.15);
        padding: 10px;
        border-radius: 6px;
        overflow-x: auto;
      }
    </style>
  `;

  const statusClass =
    result.status_msg?.toLowerCase().includes("accept")
      ? "accepted"
      : result.status_msg?.toLowerCase().includes("wrong")
      ? "wrong"
      : "info";

  panel.webview.html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>LeetCode Results</title>
      ${style}
    </head>
    <body>
      <h2>Status: <span class="${statusClass}">${result.status_msg}</span></h2>
      <p><b>Runtime:</b> ${result.status_runtime || "?"}</p>
      <p><b>Memory:</b> ${result.status_memory || "?"}</p>

      ${
        result.code_output
          ? `<h3>Your Output</h3><pre>${result.code_output}</pre>`
          : ""
      }
      ${
        result.expected_output
          ? `<h3>Expected Output</h3><pre>${result.expected_output}</pre>`
          : ""
      }
      ${
        result.std_output
          ? `<h3>Std Output</h3><pre>${result.std_output}</pre>`
          : ""
      }
      ${
        result.input
          ? `<h3>Input</h3><pre>${result.input}</pre>`
          : ""
      }
    </body>
    </html>
  `;
}
