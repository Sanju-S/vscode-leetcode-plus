# 🧩 LeetCode Plus — Solve LeetCode Inside VS Code

LeetCode Plus lets you **fetch, solve, and submit LeetCode problems directly inside Visual Studio Code**, without leaving your editor.  
It provides a fast, distraction-free, and customizable workflow for competitive programming and interview prep.

<!-- ![LeetCode Plus](images/demo.png) -->

---

## ✨ Features

### 🚀 Core Capabilities
- 🔐 **Login via LeetCode Session Cookie** — securely authenticate once, and the extension remembers your session.
- 🎯 **Fetch Random Problems** — instantly load a random problem directly in VS Code.
- 🧠 **Difficulty Filters** — pick your preferred level:
  - Easy / Medium / Hard  
  - Random (Easy, Medium, Hard)  
  - Random (Easy, Medium)  
  - Random (Medium, Hard)
- 💻 **Language Picker** — choose and save your preferred language (Python3, C++, Java, JavaScript, etc.).
- 🧩 **WebView Problem Display** — see formatted problem descriptions, examples, and constraints in a beautiful VS Code web panel.
- 🗂 **Automatic File Creation & Organization**
  - Each fetched problem is saved automatically under `workspace/<Difficulty>/<slug>.<ext>`
  - No need to manually save or name files.
- ⚡ **Submit Code & Get Live Results**
  - Submits code directly to LeetCode.
  - Displays status, runtime, and memory usage.
- 🧪 **Live Results Panel**
  - Updates in real-time as your submission is evaluated.
  - Shows input, expected output, and your output.
- 🧭 **Persistent Preferences**
  - Remembers your chosen **language** and **difficulty filter**.
  - Fetches future problems based on your saved preferences.
- 🧱 **Clean UI**
  - Adaptive colors for light/dark themes.
  - Tags showing current difficulty, language, and filters in the WebView header.

---

## 🧰 Commands

| Command | Description | Shortcut |
|----------|-------------|-----------|
| **LeetCode Plus: Get Random Problem** | Fetch a random problem (based on your saved language & difficulty) | `Ctrl + Alt + L` |
| **LeetCode Plus: Submit Solution** | Submit your current file’s code to LeetCode | `Ctrl + Alt + S` |
| **LeetCode Plus: Change Preferred Language** | Change your default coding language | `Ctrl + Alt + P` |
| **LeetCode Plus: Change Preferred Difficulty** | Change your preferred problem difficulty | `Ctrl + Alt + D` |
| **LeetCode Plus: Set Session Cookie** | Set your LeetCode login cookies for submission | `Ctrl + Alt + C` |

---

## ⚙️ Requirements

To use this extension:
1. You must have a **LeetCode account**.
2. Retrieve your **`LEETCODE_SESSION`** and **`csrftoken`** cookies from [leetcode.com](https://leetcode.com/).  
   - Log in, open Developer Tools → Application → Cookies → Copy both values.
3. Run the command `LeetCode Plus: Set Session Cookie` and paste them when prompted.

### Optional
- Install your language runtime (e.g., Python, C++, Java) to test locally.
- A LeetCode Premium account is **not required** — only free problems are fetched.

---

## ⚙️ Extension Settings

This extension contributes the following settings:

| Setting | Default | Description |
|----------|----------|-------------|
| `leetcodePlus.autoSaveOnFetch` | `true` | Automatically saves files when a new problem is fetched. |

---

## 🧭 File Structure

Example after fetching a few problems:

