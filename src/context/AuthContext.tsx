import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  height?: string;
  weight?: string;
  location?: string;
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
  allergies?: string[];
  chronicConditions?: string[];
  medications?: Array<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    prescribedBy: string;
  }>;
  specialty?: string; // For doctors
  licenseNumber?: string; // For doctors
  rating?: number; // For doctors
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: Partial<UserProfile> & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  switchDemoUser: (role: 'patient' | 'doctor') => void;
}

const DEMO_PATIENT: UserProfile = {
  id: 'usr_pat_01',
  name: 'Alex Rivera',
  email: 'alex.rivera@example.com',
  role: 'patient',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  phone: '+1 (555) 234-5678',
  dateOfBirth: '1994-05-18',
  bloodGroup: 'A+',
  height: '178 cm',
  weight: '72 kg',
  location: 'San Francisco, CA',
  emergencyContact: {
    name: 'Elena Rivera',
    relation: 'Sister',
    phone: '+1 (555) 987-6543',
  },
  allergies: ['Penicillin', 'Peanuts', 'Dust Mites'],
  chronicConditions: ['Mild Asthma', 'Seasonal Rhinitis'],
  medications: [
    {
      id: 'med_01',
      name: 'Albuterol Inhaler',
      dosage: '90mcg / 2 puffs',
      frequency: 'As needed for shortness of breath',
      startDate: '2023-04-12',
      prescribedBy: 'Dr. Sarah Johnson, MD',
    },
    {
      id: 'med_02',
      name: 'Cetirizine (Zyrtec)',
      dosage: '10mg Tablet',
      frequency: 'Once daily in the evening',
      startDate: '2023-09-01',
      prescribedBy: 'Dr. Emily Rodriguez, MD',
    },
  ],
};

const DEMO_DOCTOR: UserProfile = {
  id: 'usr_doc_01',
  name: 'Dr. Sarah Johnson, MD',
  email: 'dr.johnson@mediai.com',
  role: 'doctor',
  avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
  phone: '+1 (555) 432-1098',
  location: 'Medical Center, Suite 400, New York',
  specialty: 'Internal Medicine & AI Diagnostics',
  licenseNumber: 'MD-849204-NY',
  rating: 4.9,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('dr_ai_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEMO_PATIENT;
      }
    }
    return DEMO_PATIENT; // Default to demo patient for instant rich experience
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('dr_ai_token') || 'demo-jwt-token-active';
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('dr_ai_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('dr_ai_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('dr_ai_token', token);
    } else {
      localStorage.removeItem('dr_ai_token');
    }
  }, [token]);

  const login = async (email: string): Promise<{ success: boolean; error?: string }> => {
    // If logging in as doctor or patient demo
    if (email.toLowerCase().includes('doc')) {
      setUser(DEMO_DOCTOR);
      setToken('jwt-doctor-token-' + Date.now());
      return { success: true };
    }

    const newUser: UserProfile = {
      ...DEMO_PATIENT,
      email,
      name: email.split('@')[0].replace('.', ' ').replace(/^\w/, (c) => c.toUpperCase()),
    };
    setUser(newUser);
    setToken('jwt-patient-token-' + Date.now());
    return { success: true };
  };

  const signup = async (data: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    const newUser: UserProfile = {
      ...DEMO_PATIENT,
      id: 'usr_' + Date.now(),
      name: data.name || 'New Patient',
      email: data.email || 'user@example.com',
      dateOfBirth: data.dateOfBirth || '1995-01-01',
    };
    setUser(newUser);
    setToken('jwt-new-user-token-' + Date.now());
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('dr_ai_user');
    localStorage.removeItem('dr_ai_token');
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const switchDemoUser = (role: 'patient' | 'doctor') => {
    if (role === 'doctor') {
      setUser(DEMO_DOCTOR);
      setToken('demo-doctor-token');
    } else {
      setUser(DEMO_PATIENT);
      setToken('demo-patient-token');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateProfile,
        switchDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
