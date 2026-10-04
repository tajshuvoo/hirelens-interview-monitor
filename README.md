# HireLens Interview Monitor

Simple TypeScript/Vite demo for interview integrity monitoring.

## Run the project

### 1. Clone

```bash
git clone https://github.com/tajshuvoo/hirelens-interview-monitor.git
cd hirelens-interview-monitor
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open the local URL shown in the terminal, usually:

```text
http://localhost:5173
```

## Demo

The demo monitors:

- Fullscreen exit
- Browser tab/page switching
- Window focus loss
- Multiple-screen detection

Integrity events are flagged and shown in the interview screen. Flags do not automatically cancel the interview.
