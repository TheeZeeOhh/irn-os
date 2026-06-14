# ⚡ IRN-OS

A premium, secure local AI platform designed for multi-provider LLM balancing, telemetry calculations, and secure file integrations. Created for **Zee (Aziza Okoro)**.

---

## 🚀 Installation & Setup

Follow these step-by-step instructions to get **IRN-OS** installed and configured as a global command on your machine:

### 1. Clone the Repository
```bash
git clone https://github.com/TheeZeeOhh/irn-os.git
cd irn-os
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build the Production Frontend
Vite must compile the dashboard UI assets into the distribution directory:
```bash
npm run client:build
```

### 4. Install Globally (Link executable)
Create a global symlink on your OS so you can run the CLI from any folder:
```bash
npm link
```
Verify the installation path:
```bash
which irn-os
# Output: /home/aziza/.npm-global/bin/irn-os (or your system's global node bin path)
```

---

## ⚡ Execution

### Start the TUI Dashboard & CLI
Run the interactive CLI dashboard directly from any directory in your terminal:
```bash
irn-os
```

### Start the Backend Server directly
To launch the backend API and serve the React Web Console:
```bash
npm run server
```
Then, navigate your web browser to:
👉 **[http://localhost:4567](http://localhost:4567)**

---

## 🔮 System Features

1. **API Key Balancer & Cooldowns:** Add multiple API keys per model. The balancer routes requests using cost-weighted round-robin selection and places rate-limited keys on cooldown.
2. **Interactive TUI CLI:** Quick terminal chat, key inventory manager, and usage diagnostics.
3. **Glassmorphic Web Console:** Premium Dark UI Playground with live token saving calculations, custom telemetry formulas, and interactive controls.
4. **🧠 Custom Telemetry Models:**
   - **Key Entropy Rotation ($H_{rot}$):** Real-time Shannon Entropy of key distributions.
   - **Complexity Payload Ratio ($PC_{ratio}$):** Prompt complexity density metrics.
   - **Recovery Velocity ($\Psi_{rec}$):** Failover switch execution timings.
5. **🗜️ Token Compressor Engine:** Input prompt/code optimizer stripping comments, space, and filler words to save context.
6. **📂 Supabase Storage Integration:** Direct secure file uploads and downloads.
