import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  IconButton,
} from '@mui/material';
import {
  Heart,
  Activity,
  Wind,
  Droplets,
  Plus,
  TrendingUp,
  X,
  Check,
  ShieldCheck,
} from 'lucide-react';

interface VitalLog {
  date: string;
  bloodPressureSys: number;
  bloodPressureDia: number;
  heartRate: number;
  spO2: number;
  glucose: number;
}

const INITIAL_LOGS: VitalLog[] = [
  { date: 'May 10', bloodPressureSys: 128, bloodPressureDia: 82, heartRate: 74, spO2: 98, glucose: 95 },
  { date: 'May 12', bloodPressureSys: 124, bloodPressureDia: 80, heartRate: 72, spO2: 99, glucose: 92 },
  { date: 'May 14', bloodPressureSys: 122, bloodPressureDia: 79, heartRate: 68, spO2: 98, glucose: 96 },
  { date: 'May 16', bloodPressureSys: 120, bloodPressureDia: 78, heartRate: 70, spO2: 99, glucose: 90 },
  { date: 'May 18', bloodPressureSys: 119, bloodPressureDia: 77, heartRate: 66, spO2: 99, glucose: 89 },
  { date: 'May 20', bloodPressureSys: 121, bloodPressureDia: 78, heartRate: 69, spO2: 98, glucose: 94 },
  { date: 'Today', bloodPressureSys: 118, bloodPressureDia: 76, heartRate: 68, spO2: 99, glucose: 91 },
];

export const VitalsChart: React.FC = () => {
  const [logs, setLogs] = useState<VitalLog[]>(() => {
    const saved = localStorage.getItem('dr_ai_vitals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_LOGS;
      }
    }
    return INITIAL_LOGS;
  });

  const [activeMetric, setActiveMetric] = useState<'bp' | 'hr' | 'spo2' | 'glucose'>('bp');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLog, setNewLog] = useState({
    date: 'Today',
    bloodPressureSys: '120',
    bloodPressureDia: '80',
    heartRate: '72',
    spO2: '99',
    glucose: '92',
  });

  const latest = logs[logs.length - 1] || INITIAL_LOGS[INITIAL_LOGS.length - 1];

  const handleSaveVital = () => {
    const logToAdd: VitalLog = {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      bloodPressureSys: Number(newLog.bloodPressureSys) || 120,
      bloodPressureDia: Number(newLog.bloodPressureDia) || 80,
      heartRate: Number(newLog.heartRate) || 72,
      spO2: Number(newLog.spO2) || 98,
      glucose: Number(newLog.glucose) || 92,
    };
    const updated = [...logs.slice(-6), logToAdd];
    setLogs(updated);
    localStorage.setItem('dr_ai_vitals', JSON.stringify(updated));
    setIsModalOpen(false);
  };

  // Metrics definitions
  const metrics = [
    {
      id: 'bp' as const,
      label: 'Blood Pressure',
      value: `${latest.bloodPressureSys}/${latest.bloodPressureDia}`,
      unit: 'mmHg',
      status: latest.bloodPressureSys < 125 ? 'Optimal' : 'Elevated',
      statusColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40',
      icon: <Heart className="w-5 h-5 text-rose-500" />,
      target: 'Normal: <120/80 mmHg',
    },
    {
      id: 'hr' as const,
      label: 'Heart Rate',
      value: `${latest.heartRate}`,
      unit: 'BPM',
      status: latest.heartRate >= 60 && latest.heartRate <= 100 ? 'Normal' : 'Check',
      statusColor: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40',
      icon: <Activity className="w-5 h-5 text-blue-500" />,
      target: 'Resting: 60 - 100 BPM',
    },
    {
      id: 'spo2' as const,
      label: 'Blood Oxygen (SpO2)',
      value: `${latest.spO2}%`,
      unit: '',
      status: latest.spO2 >= 95 ? 'Optimal' : 'Low',
      statusColor: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40',
      icon: <Wind className="w-5 h-5 text-cyan-500" />,
      target: 'Healthy: 95% - 100%',
    },
    {
      id: 'glucose' as const,
      label: 'Fasting Blood Sugar',
      value: `${latest.glucose}`,
      unit: 'mg/dL',
      status: latest.glucose < 100 ? 'Normal' : 'Elevated',
      statusColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40',
      icon: <Droplets className="w-5 h-5 text-amber-500" />,
      target: 'Fasting: 70 - 99 mg/dL',
    },
  ];

  // Generate SVG Points for active metric
  const points = logs.map((log, index) => {
    const x = 40 + index * 90;
    let val = log.bloodPressureSys;
    let minVal = 100;
    let maxVal = 150;

    if (activeMetric === 'hr') {
      val = log.heartRate;
      minVal = 50;
      maxVal = 110;
    } else if (activeMetric === 'spo2') {
      val = log.spO2;
      minVal = 90;
      maxVal = 100;
    } else if (activeMetric === 'glucose') {
      val = log.glucose;
      minVal = 70;
      maxVal = 130;
    }

    const y = 190 - ((val - minVal) / (maxVal - minVal)) * 140;
    return { x, y, val, date: log.date };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  return (
    <Paper elevation={0} className="glass-card rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800">
      <Box className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Box>
          <Box className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Real-Time Telemetry
            </span>
          </Box>
          <Typography variant="h5" className="font-extrabold text-gray-900 dark:text-gray-100">
            Patient Health Vitals Tracker
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => setIsModalOpen(true)}
          startIcon={<Plus className="w-4 h-4" />}
          sx={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            fontWeight: 'bold',
            borderRadius: 2.5,
            px: 2.5,
          }}
        >
          Log New Vital
        </Button>
      </Box>

      {/* Metric Cards Grid */}
      <Grid container spacing={2} className="mb-6">
        {metrics.map((m) => {
          const isSelected = activeMetric === m.id;
          return (
            <Grid item xs={12} sm={6} md={3} key={m.id}>
              <Box
                onClick={() => setActiveMetric(m.id)}
                className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 border ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-gray-200 dark:border-gray-800 hover:border-emerald-300 bg-white/50 dark:bg-gray-900/40'
                }`}
              >
                <Box className="flex items-center justify-between mb-2">
                  <Box className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800">{m.icon}</Box>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${m.statusColor}`}>
                    {m.status}
                  </span>
                </Box>
                <Typography variant="caption" className="text-gray-500 dark:text-gray-400 block font-medium">
                  {m.label}
                </Typography>
                <Box className="flex items-baseline gap-1 mt-0.5">
                  <Typography variant="h5" className="font-extrabold text-gray-900 dark:text-gray-100">
                    {m.value}
                  </Typography>
                  <Typography variant="caption" className="text-gray-400 font-semibold">
                    {m.unit}
                  </Typography>
                </Box>
                <Typography variant="caption" className="text-gray-400 text-[10px] block mt-1">
                  {m.target}
                </Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* SVG Interactive Trend Visualizer */}
      <Box className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-800">
        <Box className="flex justify-between items-center mb-3">
          <Typography variant="subtitle2" className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            7-Day Trend: {metrics.find((m) => m.id === activeMetric)?.label}
          </Typography>
          <span className="text-xs text-gray-400 font-medium">Auto-calibrated vs. clinical baselines</span>
        </Box>

        <Box className="w-full overflow-x-auto">
          <svg viewBox="0 0 620 220" className="w-full h-48 sm:h-56 min-w-[500px]">
            {/* Background Grid Lines */}
            <line x1="30" y1="50" x2="590" y2="50" stroke="currentColor" strokeOpacity="0.08" />
            <line x1="30" y1="100" x2="590" y2="100" stroke="currentColor" strokeOpacity="0.08" />
            <line x1="30" y1="150" x2="590" y2="150" stroke="currentColor" strokeOpacity="0.08" />
            <line x1="30" y1="190" x2="590" y2="190" stroke="currentColor" strokeOpacity="0.15" />

            {/* Gradient definition */}
            <defs>
              <linearGradient id="vitalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Filled Area */}
            {points.length > 1 && (
              <path
                d={`${pathD} L ${points[points.length - 1].x} 190 L ${points[0].x} 190 Z`}
                fill="url(#vitalGrad)"
              />
            )}

            {/* Trend Line */}
            <path
              d={pathD}
              fill="none"
              stroke="#10B981"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Point Circles */}
            {points.map((p, idx) => (
              <g key={idx}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  className="fill-emerald-500 stroke-white dark:stroke-gray-900 stroke-2"
                />
                <text
                  x={p.x}
                  y={p.y - 10}
                  textAnchor="middle"
                  className="text-[11px] font-extrabold fill-gray-800 dark:fill-gray-100"
                >
                  {p.val}
                </text>
                <text
                  x={p.x}
                  y="210"
                  textAnchor="middle"
                  className="text-[10px] font-medium fill-gray-400"
                >
                  {p.date}
                </text>
              </g>
            ))}
          </svg>
        </Box>
      </Box>

      {/* Log Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: (theme) => (theme.palette.mode === 'dark' ? '#0F172A' : '#FFFFFF'),
          },
        }}
      >
        <DialogTitle className="flex justify-between items-center font-bold">
          Log Daily Health Vitals
          <IconButton size="small" onClick={() => setIsModalOpen(false)}>
            <X className="w-5 h-5" />
          </IconButton>
        </DialogTitle>
        <DialogContent className="space-y-4 pt-2">
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="BP Systolic (mmHg)"
                size="small"
                value={newLog.bloodPressureSys}
                onChange={(e) => setNewLog({ ...newLog, bloodPressureSys: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="BP Diastolic (mmHg)"
                size="small"
                value={newLog.bloodPressureDia}
                onChange={(e) => setNewLog({ ...newLog, bloodPressureDia: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Heart Rate (BPM)"
                size="small"
                value={newLog.heartRate}
                onChange={(e) => setNewLog({ ...newLog, heartRate: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="SpO2 (%)"
                size="small"
                value={newLog.spO2}
                onChange={(e) => setNewLog({ ...newLog, spO2: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Fasting Glucose (mg/dL)"
                size="small"
                value={newLog.glucose}
                onChange={(e) => setNewLog({ ...newLog, glucose: e.target.value })}
              />
            </Grid>
          </Grid>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSaveVital}
            startIcon={<Check className="w-4 h-4" />}
            sx={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              fontWeight: 'bold',
              borderRadius: 2,
              mt: 2,
            }}
          >
            Save Vitals Log
          </Button>
        </DialogContent>
      </Dialog>
    </Paper>
  );
};
