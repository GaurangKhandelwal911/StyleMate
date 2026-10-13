'use client';

import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Ruler,
  Palette,
  Shield,
  Loader2,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { ComplexionPicker, COMPLEXION_SHADES } from '@/components/profile/ComplexionPicker';
import { useToast } from '@/components/ui/Toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
  initialMode?: 'login' | 'onboarding';
}

const GENDER_OPTIONS = [
  {
    id: "Masculine / Men's silhouettes",
    title: 'Masculine',
    subtitle: "Men's cuts & tailored silhouettes",
    icon: '👔',
  },
  {
    id: "Feminine / Women's silhouettes",
    title: 'Feminine',
    subtitle: "Women's silhouettes & tailored aesthetics",
    icon: '👗',
  },
  {
    id: 'Gender-neutral / Androgynous silhouettes',
    title: 'Gender-Neutral',
    subtitle: 'Relaxed, modern androgynous fits',
    icon: '🧥',
  },
];

const HEIGHT_OPTIONS = [
  { id: 'Under 5\'5" (165 cm)', label: 'Petite / Under 5\'5"', range: '< 165 cm' },
  { id: '5\'5" – 5\'9" (165 – 175 cm)', label: 'Average / 5\'5" – 5\'9"', range: '165 – 175 cm' },
  { id: '5\'10" – 6\'1" (178 – 185 cm)', label: 'Tall / 5\'10" – 6\'1"', range: '178 – 185 cm' },
  { id: '6\'2" and above (188+ cm)', label: 'Very Tall / 6\'2"+', range: '188+ cm' },
];

export function LoginModal({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'onboarding',
}: LoginModalProps) {
  const { success, error: toastError } = useToast();

  const [mode, setMode] = useState<'login' | 'onboarding'>(initialMode);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState("Masculine / Men's silhouettes");
  const [complexion, setComplexion] = useState(COMPLEXION_SHADES[5].valueString);
  const [height, setHeight] = useState('5\'10" – 6\'1" (178 – 185 cm)');

  if (!isOpen) return null;

  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      toastError('Email Required', 'Please enter your account email to sign in.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();
      if (data.success) {
        success('Logged In', `Welcome back, ${data.user.name}!`);
        onAuthSuccess(data.user);
        onClose();
      } else {
        toastError('Login Failed', data.error);
      }
    } catch (err) {
      console.error(err);
      toastError('Error', 'Failed to log in.');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || 'Style Explorer',
          email: email.trim().toLowerCase() || `user_${Date.now()}@example.com`,
          gender,
          complexion,
          height,
        }),
      });

      const data = await res.json();
      if (data.success) {
        success('Welcome to StyleMate!', `Profile initialized for ${data.user.name}.`);
        onAuthSuccess(data.user);
        onClose();
      } else {
        toastError('Onboarding Failed', data.error);
      }
    } catch (err) {
      console.error(err);
      toastError('Error', 'Failed to save styling profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] border border-[#EAE4D7] rounded-3xl max-w-xl w-full shadow-modal overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 px-6 border-b border-[#F0EBE1] flex items-center justify-between bg-[#FDFCF9]">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#47583D] flex items-center justify-center text-white text-xs font-semibold">
              S
            </span>
            <div>
              <h2 className="text-base font-bold text-[#151413]">
                {mode === 'login' ? 'Sign In to StyleMate' : 'Welcome & Style Profile Setup'}
              </h2>
              <p className="text-[11px] text-[#78716C]">
                {mode === 'login'
                  ? 'Access your saved virtual closet'
                  : `Step ${step} of 4 • Personalized Styling Setup`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8C8984] hover:text-[#151413] rounded-full hover:bg-[#F3EFE6] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-[#F0EBE1] bg-[#FAF8F5] px-6">
          <button
            type="button"
            onClick={() => setMode('onboarding')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              mode === 'onboarding'
                ? 'border-[#47583D] text-[#2A3524]'
                : 'border-transparent text-[#78716C] hover:text-[#151413]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Profile Questionnaire</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              mode === 'login'
                ? 'border-[#47583D] text-[#2A3524]'
                : 'border-transparent text-[#78716C] hover:text-[#151413]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Existing Login</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7">
          {mode === 'login' ? (
            /* Quick Login Form */
            <form onSubmit={handleQuickLogin} className="space-y-5">
              <div className="space-y-1 text-center py-2">
                <h3 className="font-bold text-lg text-[#151413]">Sign in to your Wardrobe</h3>
                <p className="text-xs text-[#686561]">
                  Enter your email address to continue to your digital closet.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#151413] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8C8984] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. aryan@example.com"
                    className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-[#DDD5C7] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#47583D]"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#47583D] hover:bg-[#384630] text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('aryan@example.com');
                    handleQuickLogin({ preventDefault: () => {} } as any);
                  }}
                  className="w-full py-2.5 px-4 bg-[#FAF8F5] hover:bg-[#F3EFE6] border border-[#DDD5C7] text-[#151413] rounded-xl text-xs font-semibold transition"
                >
                  Continue as Demo Account (Aryan Sharma)
                </button>
              </div>
            </form>
          ) : (
            /* Multi-Step Onboarding Questionnaire */
            <div className="space-y-6">
              {/* Progress Steps Bar */}
              <div className="flex items-center justify-between pb-2">
                {[
                  { stepNum: 1, label: 'Identity' },
                  { stepNum: 2, label: 'Gender' },
                  { stepNum: 3, label: 'Complexion' },
                  { stepNum: 4, label: 'Height' },
                ].map((s) => (
                  <div key={s.stepNum} className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        step === s.stepNum
                          ? 'bg-[#47583D] text-white shadow-xs'
                          : step > s.stepNum
                          ? 'bg-[#E7ECE3] text-[#2A3524]'
                          : 'bg-[#F3EFE6] text-[#8C8984]'
                      }`}
                    >
                      {step > s.stepNum ? <Check className="w-3.5 h-3.5" /> : s.stepNum}
                    </div>
                    <span
                      className={`text-xs font-semibold hidden sm:inline ${
                        step === s.stepNum ? 'text-[#151413]' : 'text-[#8C8984]'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Step 1: Name and Email */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-[#151413]">
                      What should StyleMate call you?
                    </h3>
                    <p className="text-xs text-[#78716C]">
                      Your name will be used across your dashboard greetings and wardrobe profile.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#151413] mb-1.5">
                      Your Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#8C8984] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Aryan Sharma"
                        className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-[#DDD5C7] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#47583D]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#151413] mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#8C8984] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. aryan@example.com"
                        className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-[#DDD5C7] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#47583D]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Gender & Silhouettes */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-[#151413]">
                      Select your preferred styling silhouette
                    </h3>
                    <p className="text-xs text-[#78716C]">
                      StyleMate will tailor outfit cuts, types, and proportions to your preference.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {GENDER_OPTIONS.map((opt) => {
                      const active = gender === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setGender(opt.id)}
                          className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
                            active
                              ? 'bg-[#E7ECE3] border-[#5A6E4F] ring-1 ring-[#5A6E4F] shadow-xs'
                              : 'bg-[#FAF8F5] border-[#EAE4D7] hover:bg-[#F3EFE6]'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <span className="text-2xl p-2 rounded-xl bg-white shadow-2xs">
                              {opt.icon}
                            </span>
                            <div>
                              <span className="text-xs sm:text-sm font-bold text-[#151413] block">
                                {opt.title}
                              </span>
                              <span className="text-[11px] text-[#78716C]">
                                {opt.subtitle}
                              </span>
                            </div>
                          </div>
                          {active && (
                            <div className="w-5 h-5 rounded-full bg-[#47583D] flex items-center justify-center text-white">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Complexion with Visual Color Icons */}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-[#C76A52]" />
                      <h3 className="font-bold text-base text-[#151413]">
                        Pick your Complexion & Undertone
                      </h3>
                    </div>
                    <p className="text-xs text-[#78716C]">
                      Click on your closest skin shade below. The AI style engine will match colors that naturally illuminate your undertone.
                    </p>
                  </div>

                  {/* Visual Color Icons Component */}
                  <ComplexionPicker
                    value={complexion}
                    onChange={(newVal) => setComplexion(newVal)}
                  />
                </div>
              )}

              {/* Step 4: Height Selection */}
              {step === 4 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-[#5A6E4F]" />
                      <h3 className="font-bold text-base text-[#151413]">
                        What is your height range?
                      </h3>
                    </div>
                    <p className="text-xs text-[#78716C]">
                      Helps optimize trouser breaks, outerwear length, and silhouette balance.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {HEIGHT_OPTIONS.map((opt) => {
                      const active = height === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setHeight(opt.id)}
                          className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
                            active
                              ? 'bg-[#E7ECE3] border-[#5A6E4F] ring-1 ring-[#5A6E4F] shadow-xs'
                              : 'bg-[#FAF8F5] border-[#EAE4D7] hover:bg-[#F3EFE6]'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold text-[#151413] block">
                              {opt.label}
                            </span>
                            <span className="text-[11px] text-[#78716C]">{opt.range}</span>
                          </div>
                          {active && (
                            <div className="w-5 h-5 rounded-full bg-[#47583D] flex items-center justify-center text-white">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navigation Footer */}
              <div className="pt-4 border-t border-[#F0EBE1] flex items-center justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="px-4 py-2 rounded-xl border border-[#DDD5C7] text-xs font-semibold text-[#686561] hover:bg-[#F7F4EE] transition flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (step === 1 && !name.trim()) {
                        toastError('Validation', 'Please enter your name.');
                        return;
                      }
                      setStep((s) => s + 1);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#47583D] hover:bg-[#384630] text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleOnboardingSubmit}
                    className="px-6 py-2.5 rounded-xl bg-[#47583D] hover:bg-[#384630] text-white text-xs font-semibold transition flex items-center gap-2 shadow-xs disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Setting up your wardrobe...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Complete Setup & Enter Closet</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
