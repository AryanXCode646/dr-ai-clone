import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Paper,
  Grid,
} from '@mui/material';
import {
  Activity,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BodyZone {
  id: string;
  name: string;
  category: string;
  icon: string;
  commonSymptoms: string[];
  description: string;
}

const BODY_ZONES: BodyZone[] = [
  {
    id: 'head',
    name: 'Head, Brain & Eyes',
    category: 'Neurological & ENT',
    icon: '🧠',
    commonSymptoms: ['Pulsating Migraine', 'Tension Headache', 'Dizziness / Vertigo', 'Blurry Vision', 'Sinus Pressure'],
    description: 'Pain, pressure, sensory issues, or headaches in the cranial & facial region.',
  },
  {
    id: 'throat',
    name: 'Throat & Neck',
    category: 'ENT & Respiratory',
    icon: '🗣️',
    commonSymptoms: ['Severe Sore Throat', 'Difficulty Swallowing', 'Swollen Lymph Nodes', 'Stiff Neck', 'Hoarseness'],
    description: 'Pharyngeal soreness, stiffness, or swollen glands in the neck area.',
  },
  {
    id: 'chest',
    name: 'Chest, Heart & Lungs',
    category: 'Cardiopulmonary',
    icon: '🫁',
    commonSymptoms: ['Shortness of Breath', 'Dry Persistent Cough', 'Chest Tightness', 'Heart Palpitations', 'Wheezing'],
    description: 'Respiratory difficulties, thoracic pressure, or cardiovascular sensations.',
  },
  {
    id: 'abdomen',
    name: 'Abdomen & Digestive System',
    category: 'Gastroenterology',
    icon: '🫄',
    commonSymptoms: ['Sharp Stomach Cramps', 'Acid Reflux / Heartburn', 'Nausea & Vomiting', 'Bloating', 'Diarrhea'],
    description: 'Digestive discomfort, epigastric burning, cramping, or bowel changes.',
  },
  {
    id: 'back',
    name: 'Spine & Lower Back',
    category: 'Orthopedic',
    icon: '🦴',
    commonSymptoms: ['Lower Back Ache', 'Sciatic Nerve Pain', 'Muscle Spasms', 'Stiffness After Sitting', 'Radiating Numbness'],
    description: 'Vertebral strain, postural pain, or sciatic nerve radiating discomfort.',
  },
  {
    id: 'skin',
    name: 'Skin, Hair & Nails',
    category: 'Dermatology',
    icon: '🧴',
    commonSymptoms: ['Itchy Red Rash', 'Eczema Flare-up', 'Unusual Mole / Lesion', 'Hives & Allergic Welts', 'Dry Peeling Skin'],
    description: 'Epidermal flare-ups, pruritus, discolorations, or localized lesions.',
  },
  {
    id: 'limbs',
    name: 'Arms, Legs & Joints',
    category: 'Musculoskeletal',
    icon: '🦵',
    commonSymptoms: ['Knee Joint Pain', 'Swollen Ankle / Sprain', 'Wrist Tendonitis', 'Shoulder Stiffness', 'Muscle Fatigue'],
    description: 'Articular inflammation, ligamentous sprains, or extremity stiffness.',
  },
  {
    id: 'general',
    name: 'Systemic & Full Body',
    category: 'General Health',
    icon: '🌡️',
    commonSymptoms: ['High Fever & Chills', 'Chronic Fatigue', 'Body Aches & Shivers', 'Unexplained Weight Loss', 'Brain Fog'],
    description: 'Generalized constitutional symptoms affecting the whole body.',
  },
];

export const BodyMap: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<BodyZone>(BODY_ZONES[0]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleToggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleStartTriage = () => {
    const symptomsQuery =
      selectedSymptoms.length > 0
        ? selectedSymptoms.join(', ')
        : selectedZone.commonSymptoms.slice(0, 2).join(', ');

    navigate(`/chat?symptoms=${encodeURIComponent(symptomsQuery)}&zone=${selectedZone.id}`);
  };

  return (
    <Box className="w-full">
      <Paper
        elevation={0}
        className="glass-card rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800"
      >
        <Box className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <Box>
            <Box className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Interactive Body Symptom Navigator
              </span>
            </Box>
            <Typography variant="h5" className="font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
              Where are you experiencing discomfort?
            </Typography>
            <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
              Select an anatomical zone to identify symptoms and get instant AI clinical triage.
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={handleStartTriage}
            endIcon={<ArrowRight className="w-4 h-4" />}
            sx={{
              background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
              fontWeight: 'bold',
              borderRadius: 2.5,
              px: 3,
              py: 1.2,
            }}
          >
            Triage with AI ({selectedSymptoms.length > 0 ? selectedSymptoms.length : 'Selected'})
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Zone Selector Buttons */}
          <Grid item xs={12} md={5}>
            <Box className="grid grid-cols-2 gap-2">
              {BODY_ZONES.map((zone) => {
                const isSelected = selectedZone.id === zone.id;
                return (
                  <Box
                    key={zone.id}
                    onClick={() => {
                      setSelectedZone(zone);
                      setSelectedSymptoms([]);
                    }}
                    className={`p-3 rounded-2xl cursor-pointer transition-all duration-200 border text-left flex items-center gap-3 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 shadow-sm ring-2 ring-emerald-500/20'
                        : 'border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 bg-white dark:bg-gray-900/50'
                    }`}
                  >
                    <span className="text-2xl">{zone.icon}</span>
                    <Box className="min-w-0 flex-1">
                      <Typography
                        variant="subtitle2"
                        className={`font-bold text-xs truncate ${
                          isSelected ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {zone.name.split(',')[0]}
                      </Typography>
                      <Typography variant="caption" className="text-gray-400 text-[10px] block truncate">
                        {zone.category}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Grid>

          {/* Active Zone Detail & Symptom Tags */}
          <Grid item xs={12} md={7}>
            <Box className="h-full p-5 rounded-2xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-800 flex flex-col justify-between">
              <Box>
                <Box className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">{selectedZone.icon}</span>
                  <Box>
                    <Typography variant="h6" className="font-bold text-gray-900 dark:text-gray-100">
                      {selectedZone.name}
                    </Typography>
                    <Typography variant="caption" className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      {selectedZone.category} Specialty Area
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {selectedZone.description}
                </Typography>

                <Typography variant="subtitle2" className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-1.5 text-xs">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> Click to select specific symptoms:
                </Typography>

                <Box className="flex flex-wrap gap-2 mb-4">
                  {selectedZone.commonSymptoms.map((symptom) => {
                    const isChecked = selectedSymptoms.includes(symptom);
                    return (
                      <Chip
                        key={symptom}
                        label={symptom}
                        clickable
                        onClick={() => handleToggleSymptom(symptom)}
                        sx={{
                          borderRadius: 2,
                          fontWeight: isChecked ? 700 : 500,
                          backgroundColor: isChecked ? '#10B981' : undefined,
                          color: isChecked ? '#FFFFFF' : undefined,
                          '&:hover': {
                            backgroundColor: isChecked ? '#059669' : undefined,
                          },
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>

              <Box className="pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <Box className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Clinical algorithm verified against ICD-11 & PubMed data</span>
                </Box>
                <Button
                  size="small"
                  onClick={handleStartTriage}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Analyze Symptoms →
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};
