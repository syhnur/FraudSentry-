# FraudSentry Dashboard - Visual Preview

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  FraudSentry Dashboard                        [User Profile ▼]  │
└─────────────────────────────────────────────────────────────────┘

┌─ Welcome Section ───────────────────────────────────────────────┐
│ Welcome back! Your FraudSentry AI system is online and active  │
└────────────────────────────────────────────────────────────────┘

┌─ Key Metrics ───────────────────────────────────────────────────┐
│  📊 Total Scans      📈 Transactions      🚨 Threats Detected  │
│  45                  45,892               1,247                │
└────────────────────────────────────────────────────────────────┘

┌─ Analytics Grid ────────────────────────────────────────────────┐
│  ┌─ Trend Chart ──────────┐  ┌─ Model Intelligence ──────────┐ │
│  │ (Line graph with data) │  │ • XGBoost Stats               │ │
│  │ XGBoost Flags          │  │ • Random Forest Stats         │ │
│  │ Random Forest Flags    │  │ • Isolation Forest Stats      │ │
│  └────────────────────────┘  │ • AI Status: ONLINE           │ │
│                               └───────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘

╔════════════════════════════════════════════════════════════════╗
║              MODEL COMPARISON CARDS  [NEW]                    ║
║  Comprehensive 3-Model Ensemble Analysis                      ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  ┌──────────────────┐ ┌──────────────────┐ ┌─────────────────┐║
║  │ 🟥 XGBoost       │ │ 🟩 Random Forest │ │ 🟪 Isolation Fs ││
║  │                  │ │                  │ │                 ││
║  │ Primary Detector │ │ Precision Valid. │ │ Anomaly Detector││
║  │                  │ │                  │ │                 ││
║  │ AUC:   0.9986   │ │ AUC:   0.9952   │ │ AUC:   N/A      ││
║  │ Recall: 77.18%  │ │ Recall: 72%     │ │ Recall: 82%     ││
║  │ Prec:   88.61%  │ │ Prec:   85%     │ │ Prec:   65%     ││
║  │ F1:     82.42%  │ │ F1:     ~77%    │ │ F1:     ~73%    ││
║  │                  │ │                  │ │                 ││
║  │ Weight: 0.4 (40%)│ │ Weight: 0.4 (40%)│ │ Weight: 0.2 (20%)││
║  │ Status: Online ✓ │ │ Status: Online ✓ │ │ Status: Online ✓ ││
║  └──────────────────┘ └──────────────────┘ └─────────────────┘║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ 📐 ENSEMBLE FORMULA                                       │ ║
║  │ Risk Score Calculation                                    │ ║
║  │                                                           │ ║
║  │ Final Risk = (XGB × 0.4) + (RF × 0.4) + (ISO × 0.2)    │ ║
║  │                                                           │ ║
║  │ ✓ Fraud if Final Risk > 0.5 threshold                   │ ║
║  │ ✓ Unanimous agreement when ALL THREE models flag        │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          ║
║  │ Balanced     │ │ High         │ │ Complementary│          ║
║  │ Approach     │ │ Confidence   │ │ Strengths    │          ║
║  │              │ │              │ │              │          ║
║  │ Combines     │ │ Multi-model  │ │ Each model   │          ║
║  │ sensitivity  │ │ validation   │ │ excels in    │          ║
║  │ & precision  │ │ reduces      │ │ different    │          ║
║  │              │ │ false alerts │ │ scenarios    │          ║
║  └──────────────┘ └──────────────┘ └──────────────┘          ║
╚════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════╗
║           FRAUD TYPE BREAKDOWN CHART  [NEW]                  ║
║  Historical Fraud Distribution & Pattern Analysis             ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Chart Type: [🥧 Pie Chart] [📊 Bar Chart]                   ║
║                                                                ║
║  ┌─────────────────────────────┐  ┌──────────────────────────┐║
║  │                             │  │  Fraud Type Distribution │║
║  │        45%                  │  │                          │║
║  │    ╱─────────────╲          │  │ 🔴 Account Takeover 45%  │║
║  │   │   Account    │          │  │    ████████████░░░░  45  │║
║  │   │   Takeover   │ 30%      │  │                          │║
║  │   │              │  ╱────╲ │  │ 🟢 Mule Account 30%      │║
║  │   │              │ │ Mule │ │  │    ██████████░░░░░░  30  │║
║  │    ╲─────────────╱  │ Acc  │ │  │                          │║
║  │  ╱──────────────╲   │      │ │  │ 🟡 Structuring 15%      │║
║  │ │  Behavioral   │ 10%╲────╱ │  │    ██████░░░░░░░░░░  15  │║
║  │ │  Anomaly      │ ╱────────╲ │  │                          │║
║  │ │ 15% Structur. │ │Behavioral├─┼─ 🟣 Behavioral Anom 10% │║
║  │  ╲──────────────╱  │ Anomaly│ │  │    ████░░░░░░░░░░░░  10 │║
║  │                    ╲────────╱ │  │                          │║
║  │  Total: 100 frauds │ │        │  │ Last Update: 2m ago    │║
║  │  (from uploads)    │ │        │  │ 🔄 Auto-refresh: 30s   │║
║  │                    │ │        │  │                          │║
║  └─────────────────────────────┘  └──────────────────────────┘║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ 📖 FRAUD TYPE GUIDE                                       │ ║
║  │                                                           │ ║
║  │ 🔴 Account Takeover                                      │ ║
║  │    Fraudster uses stolen login credentials or performs  │ ║
║  │    credential stuffing attacks. Signs: unusual location,│ ║
║  │    high velocity transactions, device changes.           │ ║
║  │                                                           │ ║
║  │ 🟢 Mule Account                                          │ ║
║  │    Money mule operations - quick cash-out schemes using │ ║
║  │    compromised accounts. Signs: rapid fund transfers,   │ ║
║  │    multiple withdrawals, unusual destinations.           │ ║
║  │                                                           │ ║
║  │ 🟡 Structuring                                           │ ║
║  │    Breaking large transactions into smaller amounts      │ ║
║  │    (smurfing/layering). Signs: multiple small txns,     │ ║
║  │    pattern-based transfers, threshold avoidance.        │ ║
║  │                                                           │ ║
║  │ 🟣 Behavioral Anomaly                                    │ ║
║  │    Unusual patterns detected by AI models. Signs: out-  │ ║
║  │    of-character behavior, statistical anomalies, AI     │ ║
║  │    confidence flags from Isolation Forest.              │ ║
║  └──────────────────────────────────────────────────────────┘ ║
╚════════════════════════════════════════════════════════════════╝

```

## Color Scheme & Styling

### Model Comparison Cards

```
┌─────────────────────────────────────────────────────────────┐
│ Background: Linear Gradient (White → Light Green)           │
│ Border: Teal with opacity                                   │
│ Shadow: Subtle on normal, elevated on hover                 │
│                                                             │
│ Card Borders (Left Side):                                   │
│ 🔴 XGBoost Card: Red (#dc2626)                             │
│ 🟢 Random Forest: Teal (#0d9488)                           │
│ 🟣 Isolation Forest: Purple (#a78bfa)                      │
│                                                             │
│ Metric Colors:                                              │
│ 📊 AUC: Teal (#0d9488)                                     │
│ 📈 Recall: Cyan (#06b6d4)                                  │
│ 🎯 Precision: Orange (#f59e0b)                             │
│ 📉 F1 Score: Purple (#a78bfa)                              │
│                                                             │
│ Hover Effect:                                               │
│ • Card lifts up 4px                                         │
│ • Shadow becomes more prominent                             │
│ • Smooth 0.3s transition                                    │
└─────────────────────────────────────────────────────────────┘
```

### Fraud Type Breakdown

```
┌─────────────────────────────────────────────────────────────┐
│ Background: Subtle gradient (White → Light Blue-Gray)       │
│ Border: Teal with opacity                                   │
│ Shadow: Soft, elevation on hover                            │
│                                                             │
│ Chart Colors:                                               │
│ 🔴 Account Takeover: Red (#dc2626)                         │
│ 🟢 Mule Account: Teal (#0d9488)                            │
│ 🟡 Structuring: Orange (#f59e0b)                           │
│ 🟣 Behavioral Anomaly: Purple (#a78bfa)                    │
│                                                             │
│ Toggle Buttons:                                             │
│ • Default: Gray background, dark text                       │
│ • Active: White background, teal text                       │
│ • Hover: Smooth color transition                            │
│                                                             │
│ Stat Bars:                                                  │
│ • Container: Light gray (#e5e7eb)                           │
│ • Fill: Colored per fraud type (see above)                 │
│ • Width: Proportional to percentage                         │
│ • Animation: Smooth width transition on update              │
└─────────────────────────────────────────────────────────────┘
```

## Responsive Layouts

### Desktop (1024px+)
```
┌──────────────────────────────────────────────────┐
│ Model Cards (3 columns side by side)               │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│ │ XGBoost  │ │ RF       │ │ Isolation│           │
│ └──────────┘ └──────────┘ └──────────┘           │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ Fraud Breakdown (2 columns: Chart + Stats)        │
│ ┌──────────────────┐ ┌────────────────────────┐  │
│ │ Chart            │ │ Statistics + Guide     │  │
│ └──────────────────┘ └────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

### Tablet (768px - 1023px)
```
┌──────────────────────────────────────┐
│ Model Cards (2 columns)               │
│ ┌──────────┐ ┌──────────┐            │
│ │ XGBoost  │ │ RF       │            │
│ └──────────┘ └──────────┘            │
│ ┌──────────┐                         │
│ │ Isolation│                         │
│ └──────────┘                         │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Fraud Breakdown (Stacked)             │
│ ┌──────────────────────────────────┐ │
│ │ Chart                            │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ Statistics + Guide               │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### Mobile (480px - 767px)
```
┌──────────────────────┐
│ Model Cards          │
│ (1 column, stacked)  │
│ ┌────────────────┐   │
│ │ XGBoost        │   │
│ └────────────────┘   │
│ ┌────────────────┐   │
│ │ RF             │   │
│ └────────────────┘   │
│ ┌────────────────┐   │
│ │ Isolation      │   │
│ └────────────────┘   │
└──────────────────────┘

┌──────────────────────┐
│ Fraud Breakdown      │
│ ┌────────────────┐   │
│ │ Chart          │   │
│ └────────────────┘   │
│ ┌────────────────┐   │
│ │ Statistics     │   │
│ └────────────────┘   │
│ ┌────────────────┐   │
│ │ Guide          │   │
│ └────────────────┘   │
└──────────────────────┘
```

## Typography Hierarchy

```
Dashboard Headings:        22px, Bold (#0f766e)
Section Subtitles:         14px, Regular (#6b7280)
Component Titles:          18px, Bold (#1f2937)
Metric Labels:             13px, Bold, Uppercase (#6b7280)
Metric Values:             18px, Bold (#0d9488 or type-specific)
Body Text:                 14px, Regular (#1f2937)
Small Text/Guide:          13px, Regular (#6b7280)
Timestamps:                12px, Regular (#6b7280)
```

## Animation Specifications

### Hover Effects
- Duration: 0.3s
- Easing: ease
- Card Lift: -4px translateY
- Shadow Increase: 0 8px 12px rgba(0,0,0,0.1)

### Loading Animation
- Spinner rotation: 360deg over 0.8s linear infinite
- Border color: Light gray with teal top

### Chart Transitions
- Width changes: 0.3s ease
- Color changes: 0.2s ease
- Opacity: 0.2s ease

### Toggle Button Feedback
- Background color: 0.2s ease
- Text color: 0.2s ease
- Box shadow: 0.2s ease

## Interaction States

### Buttons
- **Default:** Gray background, dark text
- **Hover:** Slightly darker, shadow increases
- **Active:** Teal background, white text, raised shadow
- **Disabled:** Light gray, opacity 0.5

### Cards
- **Default:** Subtle shadow
- **Hover:** Lifted position, stronger shadow
- **Loading:** Opacity reduced, spinner visible

### Charts
- **Loading:** Gray placeholder with spinner
- **Loaded:** Full visibility, smooth entry animation
- **Error:** Empty state message with fallback data

## Accessibility Features

- High contrast text (#1f2937 on #ffffff)
- Clear focus states on interactive elements
- Descriptive labels for all components
- Alternative text for icons
- Readable font sizes at all breakpoints
- Color not sole indicator (also uses text labels)
- Sufficient touch target sizes on mobile (44px minimum)

---

**Visual Design System Version:** 1.0  
**Last Updated:** December 24, 2025  
**Status:** Production Ready ✅
