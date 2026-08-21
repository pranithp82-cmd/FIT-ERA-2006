const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const logoBase64 = fs.readFileSync(path.join(__dirname, '../public/logo-transparent.png')).toString('base64');
const logoSrc = `data:image/png;base64,${logoBase64}`;

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>ERAFIT - Full Technology Stack & Features Report</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

  @page {
    size: A4;
    margin: 12mm 12mm 12mm 12mm;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1e293b;
    background: #ffffff;
    line-height: 1.5;
    font-size: 11px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    page-break-after: always;
    break-after: page;
    min-height: 268mm;
    max-height: 268mm;
    overflow: hidden;
  }

  .page-container:last-child {
    page-break-after: avoid;
    break-after: avoid;
  }

  .cover-header {
    background: linear-gradient(135deg, #090d16 0%, #111827 50%, #064e3b 100%);
    color: #ffffff;
    padding: 24px 28px 20px;
    border-radius: 14px;
    margin-bottom: 16px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
    position: relative;
    overflow: hidden;
  }

  .cover-header::after {
    content: "";
    position: absolute;
    top: -50%;
    right: -10%;
    width: 260px;
    height: 260px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0) 70%);
    border-radius: 50%;
  }

  .badge-container {
    display: flex;
    gap: 8px;
    margin-bottom: 10px;
  }

  .badge {
    display: inline-block;
    padding: 3px 9px;
    border-radius: 9999px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .badge-emerald {
    background: rgba(16, 185, 129, 0.2);
    color: #34d399;
    border: 1px solid rgba(52, 211, 153, 0.4);
  }

  .badge-blue {
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
    border: 1px solid rgba(96, 165, 250, 0.4);
  }

  .badge-purple {
    background: rgba(168, 85, 247, 0.2);
    color: #c084fc;
    border: 1px solid rgba(192, 132, 252, 0.4);
  }

  .cover-title {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.4px;
    margin-bottom: 4px;
    background: linear-gradient(90deg, #ffffff, #a7f3d0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .cover-subtitle {
    font-size: 11.5px;
    color: #94a3b8;
    margin-bottom: 12px;
    font-weight: 400;
  }

  .meta-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
  }

  .meta-item {
    font-size: 9.5px;
  }

  .meta-label {
    color: #64748b;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 1px;
  }

  .meta-value {
    color: #f8fafc;
    font-weight: 600;
  }

  .section-title {
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    margin-bottom: 10px;
    padding-bottom: 4px;
    border-bottom: 2px solid #e2e8f0;
  }

  .section-title span.number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: #10b981;
    color: #ffffff;
    font-size: 10.5px;
    font-weight: 800;
    border-radius: 5px;
  }

  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 9px;
    padding: 12px 14px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid #f1f5f9;
  }

  .card-title {
    font-size: 11.5px;
    font-weight: 700;
  }

  .tech-item {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    margin-bottom: 7px;
    font-size: 10.5px;
  }

  .tech-item:last-child {
    margin-bottom: 0;
  }

  .tech-bullet {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #10b981;
    margin-top: 5px;
    flex-shrink: 0;
  }

  .tech-name {
    font-weight: 700;
    color: #1e293b;
    font-size: 10.5px;
  }

  .tech-desc {
    color: #64748b;
    font-size: 10px;
    line-height: 1.35;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 4px;
    margin-bottom: 6px;
    font-size: 10px;
  }

  th {
    background: #f8fafc;
    color: #475569;
    font-weight: 700;
    text-align: left;
    padding: 6px 8px;
    border: 1px solid #e2e8f0;
    font-size: 9.5px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  td {
    padding: 5px 8px;
    border: 1px solid #e2e8f0;
    color: #334155;
    vertical-align: top;
    line-height: 1.35;
  }

  tr:nth-child(even) td {
    background: #fafbfc;
  }

  .pill {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 8.5px;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
  }

  .pill-get { background: #dcfce7; color: #15803d; }
  .pill-post { background: #dbeafe; color: #1d4ed8; }
  .pill-put { background: #fef3c7; color: #b45309; }
  .pill-delete { background: #fee2e2; color: #b91c1c; }

  .feature-box {
    background: #f8fafc;
    border-left: 3px solid #10b981;
    padding: 7px 9px;
    border-radius: 0 6px 6px 0;
    margin-bottom: 6px;
    border-top: 1px solid #f1f5f9;
    border-right: 1px solid #f1f5f9;
    border-bottom: 1px solid #f1f5f9;
  }

  .feature-box-title {
    font-weight: 700;
    color: #0f172a;
    font-size: 10.5px;
    margin-bottom: 2px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .feature-box-desc {
    color: #475569;
    font-size: 9.5px;
    line-height: 1.35;
  }

  .code-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    background: #f1f5f9;
    padding: 1px 4px;
    border-radius: 3px;
    color: #0f172a;
    border: 1px solid #e2e8f0;
  }

  .page-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #e2e8f0;
    padding-top: 6px;
    margin-top: 6px;
    color: #94a3b8;
    font-size: 9px;
  }

  .info-callout {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 8px;
    padding: 8px 12px;
    margin-top: 8px;
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .info-callout-text {
    font-size: 9.5px;
    color: #166534;
    line-height: 1.35;
  }
</style>
</head>
<body>

  <!-- ================= PAGE 1: HEADER & TECH STACK ================= -->
  <div class="page-container">
    <div>
      <div class="cover-header">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div class="badge-container" style="margin-bottom: 0;">
            <span class="badge badge-emerald">ERAFIT Core Architecture</span>
            <span class="badge badge-blue">Full-Stack Tech Spec</span>
            <span class="badge badge-purple">Next.js 16 + React 19</span>
          </div>
          <div style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 8px; display: flex; align-items: center; gap: 8px;">
            <img src="${logoSrc}" alt="FIT ERA Logo" style="width: 28px; height: 28px; object-fit: contain;" />
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #ffffff;">FIT ERA</span>
          </div>
        </div>
        <h1 class="cover-title">ERAFIT Platform Architecture & Features</h1>
        <p class="cover-subtitle">
          Comprehensive technical reference detailing the frontend ecosystem, backend services, relational data models, clinical telemetry, multilingual voice AI engine, and full feature capabilities of the ERAFIT Platform.
        </p>
        <div class="meta-grid">
          <div class="meta-item">
            <div class="meta-label">Application Type</div>
            <div class="meta-value">Next.js 16 Turbopack Web App</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Primary Stack</div>
            <div class="meta-value">React 19 + TypeScript + Prisma</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Database & ORM</div>
            <div class="meta-value">SQLite + Prisma ORM 6.19</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Document Version</div>
            <div class="meta-value">v1.0 (Production Build)</div>
          </div>
        </div>
      </div>

      <h2 class="section-title"><span class="number">1</span> Complete Technology Stack (Frontend & Backend)</h2>

      <div class="grid-2">
        <!-- Frontend Stack -->
        <div class="card" style="border-top: 3px solid #3b82f6;">
          <div class="card-header">
            <h3 class="card-title" style="color: #2563eb;">⚡ Frontend Ecosystem</h3>
            <span class="pill" style="background:#eff6ff; color:#1d4ed8;">Client-Side</span>
          </div>
          <div class="tech-item">
            <div class="tech-bullet" style="background: #3b82f6;"></div>
            <div>
              <div class="tech-name">Next.js 16.3.1 (App Router + Turbopack)</div>
              <div class="tech-desc">Server & Client Components, file-based routing, nested layouts, optimized font & image delivery.</div>
            </div>
          </div>
          <div class="tech-item">
            <div class="tech-bullet" style="background: #3b82f6;"></div>
            <div>
              <div class="tech-name">React 19.2.8 & React DOM 19</div>
              <div class="tech-desc">Concurrent rendering, modern action hooks, Context API state orchestration, resilient rendering.</div>
            </div>
          </div>
          <div class="tech-item">
            <div class="tech-bullet" style="background: #3b82f6;"></div>
            <div>
              <div class="tech-name">TypeScript 5.x</div>
              <div class="tech-desc">Strict end-to-end type safety, unified data contracts between UI views and backend Route Handlers.</div>
            </div>
          </div>
          <div class="tech-item">
            <div class="tech-bullet" style="background: #3b82f6;"></div>
            <div>
              <div class="tech-name">Tailwind CSS v4 & PostCSS</div>
              <div class="tech-desc">Utility-first dark/neon glassmorphism UI, custom micro-interactions, responsive mobile-first layouts.</div>
            </div>
          </div>
          <div class="tech-item">
            <div class="tech-bullet" style="background: #3b82f6;"></div>
            <div>
              <div class="tech-name">Lucide React Icons (v1.31.0)</div>
              <div class="tech-desc">Crisp vector iconography across athletic dashboards, telemetry meters, and navigation bars.</div>
            </div>
          </div>
          <div class="tech-item">
            <div class="tech-bullet" style="background: #3b82f6;"></div>
            <div>
              <div class="tech-name">Web Speech API (Recognition + Synthesis)</div>
              <div class="tech-desc">Zero-dependency browser native voice AI with multi-language voice dictation and audio feedback.</div>
            </div>
          </div>
          <div class="tech-item">
            <div class="tech-bullet" style="background: #3b82f6;"></div>
            <div>
              <div class="tech-name">HTML5 MediaDevices & Canvas API</div>
              <div class="tech-desc">Live camera frame capture for real-time AI food scanning and visual barcode/dish estimation.</div>
            </div>
          </div>
        </div>

        <!-- Backend Stack -->
        <div class="card" style="border-top: 3px solid #10b981;">
          <div class="card-header">
            <h3 class="card-title" style="color: #059669;">🛡️ Backend & Infrastructure</h3>
            <span class="pill" style="background:#ecfdf5; color:#047857;">Server-Side</span>
          </div>
          <div class="tech-item">
            <div class="tech-bullet"></div>
            <div>
              <div class="tech-name">Node.js LTS (v24.x) Runtime</div>
              <div class="tech-desc">High-performance async server runtime executing Next.js Route Handlers and telemetry tasks.</div>
            </div>
          </div>
          <div class="tech-item">
            <div class="tech-bullet"></div>
            <div>
              <div class="tech-name">Prisma ORM 6.19.3</div>
              <div class="tech-desc">Type-safe schema modeling, relational querying, automated migrations, and connection pooling.</div>
            </div>
          </div>
          <div class="tech-item">
            <div class="tech-bullet"></div>
            <div>
              <div class="tech-name">SQLite Database Engine (dev.db)</div>
              <div class="tech-desc">Embedded ACID-compliant relational storage for users, clinical biomarkers, food logs, and workouts.</div>
            </div>
          </div>
          <div class="tech-item">
            <div class="tech-bullet"></div>
            <div>
              <div class="tech-name">Cookie Session Auth & 3-Tier RBAC</div>
              <div class="tech-desc">Role-Based Access Control enforcing strict separation: Athlete (USER), Coach (MONITOR), Overseer (ADMIN).</div>
            </div>
          </div>
          <div class="tech-item">
            <div class="tech-bullet"></div>
            <div>
              <div class="tech-name">Sharp & PNGJS Image Processing</div>
              <div class="tech-desc">Server-side high-throughput image manipulation, compression, and visual telemetry data parsing.</div>
            </div>
          </div>
          <div class="tech-item">
            <div class="tech-bullet"></div>
            <div>
              <div class="tech-name">XLSX & CSV Data Pipelines</div>
              <div class="tech-desc">High-speed dataset stream loaders powering the 5,000+ Indian & USDA clinical food database.</div>
            </div>
          </div>
          <div class="tech-item">
            <div class="tech-bullet"></div>
            <div>
              <div class="tech-name">NLP Dialect & Phonetic Parser</div>
              <div class="tech-desc">Custom regional language parser for English, Tamil (தமிழ்), Hindi (हिंदी), and Malayalam (മലയാളം).</div>
            </div>
          </div>
        </div>
      </div>

      <div class="info-callout">
        <div style="font-size: 18px;">💡</div>
        <div class="info-callout-text">
          <strong>Architecture Highlights:</strong> ERAFIT utilizes a hybrid Server/Client component paradigm with Next.js Turbopack, maintaining zero external dependencies for voice AI via the Web Speech API and instant sub-millisecond local SQLite database transactions via Prisma ORM.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>ERAFIT Architecture & Tech Stack • Page 1 of 4</span>
      <span>Antigravity Engineering</span>
    </div>
  </div>

  <!-- ================= PAGE 2: RELATIONAL DATABASE MODELS ================= -->
  <div class="page-container">
    <div>
      <h2 class="section-title"><span class="number">2</span> Relational Database Models (Prisma Schema)</h2>
      <p style="color: #64748b; font-size: 10px; margin-bottom: 8px;">
        ERAFIT maintains a comprehensive relational schema in Prisma ORM mapped to an SQLite database, supporting clinical health markers, multi-role RBAC, 5,000+ food items, and live exercise telemetry.
      </p>

      <table>
        <thead>
          <tr>
            <th style="width: 22%;">Model Name</th>
            <th style="width: 38%;">Key Attributes & Fields</th>
            <th style="width: 40%;">Domain Purpose & Relationships</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="code-tag">User</span></td>
            <td>id, name, email, role (USER/MONITOR/ADMIN), gender, age, heightCm, weightKg, goal, bloodType, trainerSync</td>
            <td>Central identity & athlete profile linked to all telemetry, medical reports, food logs, and coach assignments.</td>
          </tr>
          <tr>
            <td><span class="code-tag">MonitorProfile</span></td>
            <td>userId, monitorId (e.g. ERA-MON-8942), specialization, experienceYears, status</td>
            <td>Profiles for certified sports medicine trainers, clinical nutritionists, and workout monitors.</td>
          </tr>
          <tr>
            <td><span class="code-tag">UserMonitorAssignment</span></td>
            <td>userId, monitorId, assignedAt, status (ACTIVE/PAUSED), assignedBy</td>
            <td>M:N relational mapping connecting athletes with their dedicated clinical/fitness coach.</td>
          </tr>
          <tr>
            <td><span class="code-tag">AssignmentHistory</span></td>
            <td>userId, userName, monitorId, monitorName, action, performedBy, timestamp</td>
            <td>Complete chronological audit trail of all athlete-to-monitor assignments and status updates.</td>
          </tr>
          <tr>
            <td><span class="code-tag">MonitorNote</span></td>
            <td>userId, monitorId, title, content, category (WORKOUT/DIET/MEDICAL), isTask, completed</td>
            <td>Clinical observations, coach feedback notes, and assigned trainee action items.</td>
          </tr>
          <tr>
            <td><span class="code-tag">AssignedWorkoutPlan</span></td>
            <td>userId, title, notes, exercises (JSON payload: sets/reps/weight), assignedByName</td>
            <td>Prescription-based customized workout regimens dispatched directly by monitors to trainees.</td>
          </tr>
          <tr>
            <td><span class="code-tag">AssignedDietPlan</span></td>
            <td>userId, title, targetCalories, targetProtein, targetCarbs, targetFat, meals (JSON)</td>
            <td>Clinical nutrition regimens customized per user based on health parameters and dietary goals.</td>
          </tr>
          <tr>
            <td><span class="code-tag">HealthReport & BloodParameter</span></td>
            <td>reportDate, packageId, testName, value, unit, referenceLow, referenceHigh, status (NORMAL/LOW/HIGH/ATTENTION)</td>
            <td>Thyrocare / Aarogyam laboratory blood tests (Lipid, Liver, Thyroid, Vitamin, CBC) with normal/high alerts.</td>
          </tr>
          <tr>
            <td><span class="code-tag">DXAReport & DXAParameter</span></td>
            <td>reportDate, scanTypeId, metricName (Body Fat, Lean Mass, BMD, T-Score), region (Arms, Legs, Trunk)</td>
            <td>Clinical Dual-energy X-ray Absorptiometry bone density & segmental body composition tracking.</td>
          </tr>
          <tr>
            <td><span class="code-tag">Food & FoodLog</span></td>
            <td>name, calories, protein, carbs, fat, fiber, sugar, sodium, vegetarian, vegan, mealType (Breakfast/Lunch/Dinner/Snack)</td>
            <td>5,000+ item nutrition dictionary + daily timestamped breakfast, lunch, dinner, snack user logs.</td>
          </tr>
          <tr>
            <td><span class="code-tag">Workout, WorkoutSet & Exercise</span></td>
            <td>name, startTime, durationMin, setNumber, reps, weight, completed</td>
            <td>Live workout tracking engine storing barbell telemetry, weight progression, and volume metrics.</td>
          </tr>
          <tr>
            <td><span class="code-tag">WaterLog & HealthMetric</span></td>
            <td>amountMl, metric (Weight/BodyFat), value, logDate</td>
            <td>Hydration logging and longitudinal biometric evolution metrics.</td>
          </tr>
          <tr>
            <td><span class="code-tag">AIConversation & AuditLog</span></td>
            <td>role, content, timestamp, actorId, actorRole, action, previousValue, newValue</td>
            <td>Persistent AI Coach dialog memory and enterprise audit logging for security compliance.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="page-footer">
      <span>ERAFIT Architecture & Tech Stack • Page 2 of 4</span>
      <span>Antigravity Engineering</span>
    </div>
  </div>

  <!-- ================= PAGE 3: 14 CORE FEATURES ================= -->
  <div class="page-container">
    <div>
      <h2 class="section-title"><span class="number">3</span> Core Modules & Comprehensive Feature Breakdown</h2>
      <p style="color: #64748b; font-size: 10px; margin-bottom: 6px;">
        14 complete production modules implemented across the ERAFIT application spanning clinical diagnostics, multilingual voice AI, live telemetry, and multi-tier coaching.
      </p>

      <div class="grid-2">
        <!-- Module 1 -->
        <div class="feature-box">
          <div class="feature-box-title">
            <span>🔐 1. Auth & Multi-Tier RBAC</span>
            <span class="code-tag">/auth/*</span>
          </div>
          <div class="feature-box-desc">
            Full auth workflow with separate registration portals for Athletes, Certified Monitors, and Platform Admins. Includes role verification, cookie session persistence, and protected route middleware.
          </div>
        </div>

        <!-- Module 2 -->
        <div class="feature-box">
          <div class="feature-box-title">
            <span>📊 2. Main Fitness & Telemetry Dashboard</span>
            <span class="code-tag">/</span>
          </div>
          <div class="feature-box-desc">
            Unified overview displaying real-time daily calorie targets, macronutrient split (Protein, Carbs, Fats), circular progress gauges, water intake tracker, quick workout launcher, and trainer sync status.
          </div>
        </div>

        <!-- Module 3 -->
        <div class="feature-box">
          <div class="feature-box-title">
            <span>🎙️ 3. Multilingual AI Nutrition Voice Assistant</span>
            <span class="code-tag">/nutrition</span>
          </div>
          <div class="feature-box-desc">
            AI voice agent with natural speech input. Automatically detects English, Tamil (தமிழ்), Hindi (हिंदी), and Malayalam (മലയാളം), maps colloquial queries to clinical items, and speaks spoken answers aloud.
          </div>
        </div>

        <!-- Module 4 -->
        <div class="feature-box">
          <div class="feature-box-title">
            <span>📷 4. Live Camera AI Food Scanner</span>
            <span class="code-tag">/scanner</span>
          </div>
          <div class="feature-box-desc">
            Interactive camera scanner using WebRTC video feed with a targeting reticle. Captures live meal snapshots, performs visual dish identification, and provides instant macro estimates with one-tap logging.
          </div>
        </div>

        <!-- Module 5 -->
        <div class="feature-box">
          <div class="feature-box-title">
            <span>🥗 5. 5,000+ Food Clinical Nutrition Engine</span>
            <span class="code-tag">FIT_ERA_5000</span>
          </div>
          <div class="feature-box-desc">
            Comprehensive database combining Indian Food Composition Tables (IFCT) and USDA databases. Searchable by meal category, vegetarian/vegan filters, with micronutrients (Iron, Calcium, Vitamin C).
          </div>
        </div>

        <!-- Module 6 -->
        <div class="feature-box">
          <div class="feature-box-title">
            <span>🩸 6. Clinical Blood Biomarker Panel</span>
            <span class="code-tag">/health/blood-panel</span>
          </div>
          <div class="feature-box-desc">
            Integrated with Thyrocare Aarogyam clinical packages (60+ biomarkers). Automatically flags parameters as Normal, Low, High, or Attention for Lipid, Liver, Kidney, Thyroid, and Iron panels.
          </div>
        </div>

        <!-- Module 7 -->
        <div class="feature-box">
          <div class="feature-box-title">
            <span>🦴 7. DXA Body Composition & Bone Density</span>
            <span class="code-tag">/health/dxa-results</span>
          </div>
          <div class="feature-box-desc">
            Dual-energy X-ray Absorptiometry report parser tracking regional body fat %, lean mass distribution (arms, legs, trunk), visceral adipose tissue, Bone Mineral Density (BMD), and clinical T-Scores.
          </div>
        </div>

        <!-- Module 8 -->
        <div class="feature-box">
          <div class="feature-box-title">
            <span>🏋️ 8. Workout Routines & Active Drawer</span>
            <span class="code-tag">/workouts</span>
          </div>
          <div class="feature-box-desc">
            Extensive exercise library categorized by muscle groups (Chest, Back, Legs, Arms). Features a global persistent floating drawer for active workout sessions with rest timers, reps, and weight logging.
          </div>
        </div>

        <!-- Module 9 -->
        <div class="feature-box">
          <div class="feature-box-title">
            <span>📈 9. Live Barbell & Bench Telemetry</span>
            <span class="code-tag">/workout-tracker/*</span>
          </div>
          <div class="feature-box-desc">
            Real-time telemetry tracker for barbell movements including bench press, squat, and deadlift. Records per-set tonnage, RPE (Rate of Perceived Exertion), set completion checkmarks, and progression curves.
          </div>
        </div>

        <!-- Module 10 -->
        <div class="feature-box">
          <div class="feature-box-title">
            <span>📐 10. Body Composition & TDEE Planner</span>
            <span class="code-tag">/body-analysis</span>
          </div>
          <div class="feature-box-desc">
            Scientific calculator estimating Basal Metabolic Rate (BMR), Total Daily Energy Expenditure (TDEE), target caloric surplus/deficit, and custom macro ratios tailored to muscle gain, fat loss, or maintenance.
          </div>
        </div>

        <!-- Module 11 -->
        <div class="feature-box">
          <div class="feature-box-title">
            <span>👨‍⚕️ 11. Monitor & Trainer Clinical Portal</span>
            <span class="code-tag">/monitor/*</span>
          </div>
          <div class="feature-box-desc">
            Dedicated coach workspace: inspect assigned trainees, review daily telemetry logs, view blood test alerts, write clinical notes/tasks, and dispatch custom workout and meal prescriptions.
          </div>
        </div>

        <!-- Module 12 -->
        <div class="feature-box">
          <div class="feature-box-title">
            <span>⚙️ 12. Admin Control & Assignment Hub</span>
            <span class="code-tag">/admin/*</span>
          </div>
          <div class="feature-box-desc">
            Platform governance suite: oversee all system users, verify monitor credentials, dynamically assign/reassign athletes to coaches, and review comprehensive audit history logs.
          </div>
        </div>

        <!-- Module 13 -->
        <div class="feature-box">
          <div class="feature-box-title">
            <span>🤖 13. Conversational AI Fitness Coach</span>
            <span class="code-tag">/ai-coach</span>
          </div>
          <div class="feature-box-desc">
            AI chatbot trained on sports science and clinical nutrition principles. Maintains conversation history, provides form corrections, dietary tips, and recovery protocols.
          </div>
        </div>

        <!-- Module 14 -->
        <div class="feature-box">
          <div class="feature-box-title">
            <span>⌚ 14. Wearable Devices & Hardware Hub</span>
            <span class="code-tag">/devices</span>
          </div>
          <div class="feature-box-desc">
            Telemetry interface for smartwatches, continuous glucose monitors (CGM), heart rate monitors, and fitness trackers with real-time biometric synchronization.
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>ERAFIT Architecture & Tech Stack • Page 3 of 4</span>
      <span>Antigravity Engineering</span>
    </div>
  </div>

  <!-- ================= PAGE 4: REST API MATRIX ================= -->
  <div class="page-container">
    <div>
      <h2 class="section-title"><span class="number">4</span> RESTful API Endpoint Matrix</h2>
      <p style="color: #64748b; font-size: 10px; margin-bottom: 8px;">
        Core API route handlers powering user telemetry, clinical health data ingestion, diet prescriptions, and multi-tier RBAC.
      </p>

      <table>
        <thead>
          <tr>
            <th style="width: 10%;">Method</th>
            <th style="width: 32%;">Endpoint Route</th>
            <th style="width: 28%;">Request / Query Parameters</th>
            <th style="width: 30%;">Functional Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="pill pill-post">POST</span></td>
            <td><span class="code-tag">/api/auth/login</span></td>
            <td>email, password, expectedRole</td>
            <td>Authenticates user credentials and sets role session cookie.</td>
          </tr>
          <tr>
            <td><span class="pill pill-post">POST</span></td>
            <td><span class="code-tag">/api/auth/register</span></td>
            <td>name, email, password, biometrics</td>
            <td>Registers new athlete profile with baseline metrics.</td>
          </tr>
          <tr>
            <td><span class="pill pill-get">GET</span></td>
            <td><span class="code-tag">/api/auth/me</span></td>
            <td>- (Session Cookie)</td>
            <td>Fetches active authenticated user and role context.</td>
          </tr>
          <tr>
            <td><span class="pill pill-get">GET</span></td>
            <td><span class="code-tag">/api/foods</span></td>
            <td>search, category, veg, vegan</td>
            <td>Queries 5,000+ nutrition items with filters and pagination.</td>
          </tr>
          <tr>
            <td><span class="pill pill-post">POST</span></td>
            <td><span class="code-tag">/api/nutrition/voice-agent</span></td>
            <td>query, lang (en/ta/hi/ml)</td>
            <td>NLP query parsing, multi-lingual translation & macro calculation.</td>
          </tr>
          <tr>
            <td><span class="pill pill-post">POST</span></td>
            <td><span class="code-tag">/api/nutrition</span></td>
            <td>foodId, mealType, quantity</td>
            <td>Logs a consumed food item to user's daily diary.</td>
          </tr>
          <tr>
            <td><span class="pill pill-get">GET</span></td>
            <td><span class="code-tag">/api/health/blood-panel</span></td>
            <td>userId, packageId</td>
            <td>Returns clinical biomarker analysis with normal/attention ranges.</td>
          </tr>
          <tr>
            <td><span class="pill pill-post">POST</span></td>
            <td><span class="code-tag">/api/health/upload-blood</span></td>
            <td>parameters[], reportDate, lab</td>
            <td>Stores blood report data with OCR or verified manual values.</td>
          </tr>
          <tr>
            <td><span class="pill pill-get">GET</span></td>
            <td><span class="code-tag">/api/health/dxa</span></td>
            <td>userId</td>
            <td>Retrieves latest DXA body composition & bone scan telemetry.</td>
          </tr>
          <tr>
            <td><span class="pill pill-post">POST</span></td>
            <td><span class="code-tag">/api/workouts</span></td>
            <td>name, duration, sets[]</td>
            <td>Saves completed workout session with exercise set weights & reps.</td>
          </tr>
          <tr>
            <td><span class="pill pill-post">POST</span></td>
            <td><span class="code-tag">/api/water</span></td>
            <td>amountMl</td>
            <td>Logs incremental water consumption in milliliters.</td>
          </tr>
          <tr>
            <td><span class="pill pill-get">GET</span></td>
            <td><span class="code-tag">/api/monitor/users</span></td>
            <td>monitorId</td>
            <td>Fetches all athletes assigned to the authenticated monitor.</td>
          </tr>
          <tr>
            <td><span class="pill pill-post">POST</span></td>
            <td><span class="code-tag">/api/monitor/users/[id]/edit</span></td>
            <td>workoutPlan, dietPlan, notes</td>
            <td>Dispatches custom workout and diet plans to assigned athlete.</td>
          </tr>
          <tr>
            <td><span class="pill pill-post">POST</span></td>
            <td><span class="code-tag">/api/admin/assignments</span></td>
            <td>userId, monitorId, action</td>
            <td>Admin endpoint to assign, reassign, or revoke trainer links.</td>
          </tr>
          <tr>
            <td><span class="pill pill-post">POST</span></td>
            <td><span class="code-tag">/api/ai-coach</span></td>
            <td>message, history[]</td>
            <td>Dispatches conversational query to AI Fitness Coach.</td>
          </tr>
        </tbody>
      </table>

      <div class="info-callout" style="margin-top: 14px; background: #f8fafc; border-color: #cbd5e1;">
        <div style="font-size: 16px;">🚀</div>
        <div class="info-callout-text" style="color: #334155;">
          <strong>Deployment Ready:</strong> ERAFIT is engineered for scalable deployment on Next.js edge runtimes or Node.js server environments with seamless migration paths from SQLite to PostgreSQL / MySQL via Prisma schema configuration.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>ERAFIT Architecture & Tech Stack • Page 4 of 4</span>
      <span>Antigravity Engineering</span>
    </div>
  </div>

</body>
</html>
`;

const htmlPath = path.join(__dirname, '..', 'ERAFIT_Tech_Stack_and_Features.html');
const pdfPath = path.join(__dirname, '..', 'ERAFIT_Tech_Stack_and_Features.pdf');

fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
console.log('HTML file written to:', htmlPath);

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const command = `"${chromePath}" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${htmlPath}"`;

console.log('Generating PDF via Chrome Headless...');
try {
  execSync(command, { stdio: 'inherit' });
  console.log('PDF successfully created at:', pdfPath);
} catch (error) {
  console.error('Failed to generate PDF:', error);
  process.exit(1);
}
