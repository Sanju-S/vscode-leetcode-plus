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
 * Opens or updates the Results Panel.
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
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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

  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="UTF-8"><title>LeetCode Results</title>${style}</head>
      <body>
        <h2>Status: <span class="${stateClass}">${statusMsg}</span></h2>
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
        ${
          !isFinal
            ? `<p style="color:gray;">⏳ Refreshing automatically until result is final...</p>`
            : `<p style="color:gray;">✅ Final result received.</p>`
        }
      </body>
    </html>
  `;

  panel.webview.html = html;
}
