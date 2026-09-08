import { ThemeSwitcher } from '../components/common/ThemeSwitcher';

import { useTheme } from '../context/ThemeContext';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '@/services/api';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  Store,
  User,
  Sparkles,
  ShieldCheck,
  Percent,
  Palette,
  Globe,
  FileText,
  Boxes,
  Zap,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Layers,
  ShoppingBag,
  ExternalLink,
  X,
  CreditCard,
  Sliders,
  Play,
  Pause,
  RefreshCw,
  QrCode,
  Printer,
  MousePointerClick
} from 'lucide-react';

export const AdminLoginPage = () => {
  const { loginAdmin, registerMerchant, oauthLogin, googleSignIn, completeGoogleRedirect } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  // Returning from the Google full-page redirect — finish the sign-in
  useEffect(() => {
    let cancelled = false;
    completeGoogleRedirect().then((res) => {
      if (!cancelled && res?.success) {
        window.location.href = res.user?.role === 'SUPER_ADMIN' ? '/super-admin' : '/admin';
      }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Real-OAuth callback: backend redirects back with ?oauth_token=...
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get('oauth_cancelled')) {
      // User closed the account chooser — quietly back to the login form
      window.history.replaceState({}, '', '/login');
      return;
    }
    if (q.get('oauth_error')) {
      setError('Sign-in was cancelled or could not be completed. Please try again or use email and password.');
      window.history.replaceState({}, '', '/login');
      return;
    }
    const t = q.get('oauth_token');
    if (t) {
      localStorage.setItem('gojulex_jwt_token', t);
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${t}` } })
        .then((r) => r.json())
        .then((res) => {
          const u = res.user || res.data;
          if (u) {
            const userObj = { ...u, avatar: u.avatarUrl };
            localStorage.setItem('gojulex_auth_user', JSON.stringify(userObj));
            window.location.href = u.role === 'SUPER_ADMIN' ? '/super-admin' : '/admin';
          } else {
            window.location.href = '/login?oauth_error=1';
          }
        })
        .catch(() => {});
    }
  }, []);

  // Modal / Drawer state for Login / Register
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'

  // Sign In Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign Up Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regStoreName, setRegStoreName] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ----------------------------------------------------
  // PILLAR 3D CAROUSEL (Aceternity-style effects)
  // ----------------------------------------------------
  const [pillarIndex, setPillarIndex] = useState(0);
  const pillarDragStart = useRef(null);

  const pillarSlides = [
    { icon: Percent, bubble: 'bg-amber-50 border-amber-200 text-amber-600', bubbleDark: 'bg-amber-500/10 border-amber-500/40 text-amber-300', bg: 'linear-gradient(160deg, #FFFBEB 0%, #FFF9E8 100%)', bgDark: 'linear-gradient(160deg, #1C1C1C 0%, #161616 100%)', title: '0% Platform Commission', desc: 'No intermediary marketplace cut. You retain 100% of your retail sales with direct merchant bank settlement.' },
    { icon: Palette, bubble: 'bg-[#FFF1F2] border-[#FECDD3] text-[#9F1239]', bubbleDark: 'bg-rose-500/10 border-rose-500/40 text-rose-300', bg: 'linear-gradient(160deg, #FFF1F2 0%, #FFF9E8 100%)', bgDark: 'linear-gradient(160deg, #1C1C1C 0%, #161616 100%)', title: 'Visual Theme Customizer', desc: 'Full control over hero banners, announcement ribbons, trust badges, typography, and color palettes in real-time.' },
    { icon: Globe, bubble: 'bg-purple-50 border-purple-200 text-purple-600', bubbleDark: 'bg-purple-500/10 border-purple-500/40 text-purple-300', bg: 'linear-gradient(160deg, #FAF5FF 0%, #FFF9E8 100%)', bgDark: 'linear-gradient(160deg, #1C1C1C 0%, #161616 100%)', title: 'Instant Subdomain & Custom Domains', desc: 'Instantly live at yourbrand.gojulex.com with 1-click custom domain mapping for your brand.' },
    { icon: FileText, bubble: 'bg-emerald-50 border-emerald-200 text-emerald-600', bubbleDark: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300', bg: 'linear-gradient(160deg, #ECFDF5 0%, #FFF9E8 100%)', bgDark: 'linear-gradient(160deg, #1C1C1C 0%, #161616 100%)', title: 'GST Tax Invoices & Print', desc: 'Dual CGST/SGST breakdowns, HSN codes, printable tax invoices, and automated WhatsApp order confirmations.' },
    { icon: CreditCard, bubble: 'bg-rose-50 border-rose-200 text-rose-600', bubbleDark: 'bg-rose-500/10 border-rose-500/40 text-rose-300', bg: 'linear-gradient(160deg, #FFF1F2 0%, #FFF9E8 100%)', bgDark: 'linear-gradient(160deg, #1C1C1C 0%, #161616 100%)', title: '1-Click Checkout, UPI & COD', desc: 'Frictionless checkout with instant Google Pay, PhonePe, Paytm QR, cards, net banking, and cash on delivery.' },
    { icon: ShieldCheck, bubble: 'bg-yellow-50 border-yellow-200 text-yellow-600', bubbleDark: 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300', bg: 'linear-gradient(160deg, #FEFCE8 0%, #FFF9E8 100%)', bgDark: 'linear-gradient(160deg, #1C1C1C 0%, #161616 100%)', title: 'Escrow & Tenant Isolation', desc: 'Multi-tenant architecture guarantees complete store privacy, zero cross-store data leakage, and master admin oversight.' },
  ];

  const pillarNext = () => setPillarIndex((i) => (i + 1) % pillarSlides.length);
  const pillarPrev = () => setPillarIndex((i) => (i - 1 + pillarSlides.length) % pillarSlides.length);

  const handleCarouselDragStart = (e) => {
    pillarDragStart.current = e.touches ? e.touches[0].clientX : e.clientX;
  };
  const handleCarouselDragMove = (e) => {
    if (pillarDragStart.current === null) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const diff = pillarDragStart.current - x;
    if (Math.abs(diff) > 60) {
      diff > 0 ? pillarNext() : pillarPrev();
      pillarDragStart.current = x;
    }
  };
  const handleCarouselDragEnd = () => {
    pillarDragStart.current = null;
  };

  const [calcSales, setCalcSales] = useState(75000);
  const [previewTheme, setPreviewTheme] = useState('blush');
  const [activeDomainTab, setActiveDomainTab] = useState('subdomain');
  const [activeInvoiceFormat, setActiveInvoiceFormat] = useState('A4');

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState('next');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);

  // ----------------------------------------------------
  // HERO THEME CARDS — uniform grid coverage with smooth
  // looping wander (every zone always has a card; no
  // clustering, no empty regions, rims reachable, no cuts)
  // ----------------------------------------------------
  const heroRoamRef = useRef(null);
  useEffect(() => {
    const container = heroRoamRef.current;
    if (!container || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cards = [...container.querySelectorAll('[data-roam]')];
    const W = container.clientWidth, H = container.clientHeight;
    const COLS = 3, ROWS = 3;
    const state = cards.map((el, i) => {
      const w = el.offsetWidth || 200, h = el.offsetHeight || 200;
      const col = i % COLS, row = Math.floor(i / COLS);
      const cw = W / COLS, ch = H / ROWS;
      return {
        el, w, h,
        homeX: cw * col + cw / 2 + (Math.random() - 0.5) * cw * 0.18 - w / 2,
        homeY: ch * row + ch / 2 + (Math.random() - 0.5) * ch * 0.18 - h / 2,
        ax: cw * 0.34,
        ay: ch * 0.34,
        tx: 42 + Math.random() * 22,
        ty: 50 + Math.random() * 26,
        px: Math.random() * Math.PI * 2,
        py: Math.random() * Math.PI * 2,
        rp: Math.random() * Math.PI * 2,
      };
    });
    let raf;
    const tick = (now) => {
      const t = now / 1000;
      for (const c of state) {
        let x = c.homeX + c.ax * Math.sin((2 * Math.PI * t) / c.tx + c.px);
        let y = c.homeY + c.ay * Math.sin((2 * Math.PI * t) / c.ty + c.py);
        x = Math.max(0, Math.min(W - c.w, x));
        y = Math.max(0, Math.min(H - c.h, y));
        const rot = 8 * Math.sin((2 * Math.PI * t) / 34 + c.rp);
        c.el.style.transform = 'translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px) rotate(' + rot.toFixed(2) + 'deg)';
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const totalSlides = 4;

  const nextSlide = () => {
    setSlideDirection('next');
    setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
    setProgress(0);
  };

  const prevSlide = () => {
    setSlideDirection('prev');
    setCurrentSlideIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
    setProgress(0);
  };

  const goToSlide = (idx) => {
    setSlideDirection(idx > currentSlideIndex ? 'next' : 'prev');
    setCurrentSlideIndex(idx);
    setProgress(0);
  };

  // Auto-rotation progress timer
  useEffect(() => {
    if (!isAutoPlaying) return;
    const stepMs = 50;
    const totalMs = 4500;
    const interval = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          nextSlide();
          return 0;
        }
        return old + (stepMs / totalMs) * 100;
      });
    }, stepMs);
    return () => clearInterval(interval);
  }, [isAutoPlaying, currentSlideIndex]);

  // Touch and drag swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches ? e.touches[0].clientX : e.clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    touchEndX.current = e.touches ? e.touches[0].clientX : e.clientX;
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
  };

  // ----------------------------------------------------
  // SHOWCASE SLIDES DEFINITIONS
  // ----------------------------------------------------
  const showcaseSlides = [
    {
      id: 'slide_zero_fee',
      tag: '0% COMMISSION ENGINE',
      title: 'Sell Big. Pay Zero Platform Cuts.',
      subtitle: 'Keep every single rupee. No marketplace percentage cuts, no hidden deductions.',
      badge: 'Keep 100%',
      icon: Percent,
      highlightStats: [
        { label: 'Platform Fee', value: '0.0%' },
        { label: 'Revenue Kept', value: '100%' },
        { label: 'Payout Cycle', value: 'Instant T+1' }
      ],
      previewGraphic: (
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="bg-white dark:bg-obsidian-850 border border-[#EFE2BC] rounded-3xl p-6 sm:p-8 text-left space-y-6 shadow-sm relative overflow-hidden transition hover:shadow-md w-full h-full flex flex-col justify-center"
        >
          <div className="flex items-center justify-between border-b border-[#EFE2BC] pb-3">
            <div>
              <span className="font-bold text-lg text-[#0F172A] dark:text-slate-100 block">Interactive Fee Calculator</span>
              <span className="text-sm text-[#475569] dark:text-slate-400">Drag slider to test your store\'s monthly sales</span>
            </div>
            <span className="font-mono font-bold text-base bg-[#FBF0D2] dark:bg-obsidian-800 text-[#8A6200] px-2.5 py-1 rounded-xl border border-[#E7D49E]">
              ₹{calcSales.toLocaleString('en-IN')}/mo
            </span>
          </div>

          {/* Interactive Range Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-base font-bold text-[#475569] dark:text-slate-400">
              <span>₹10,000</span>
              <span className="text-[#A87A00]">Monthly GMV</span>
              <span>₹5,00,000</span>
            </div>
            <input
              type="range"
              min="10000"
              max="500000"
              step="5000"
              value={calcSales}
              onChange={(e) => setCalcSales(Number(e.target.value))}
              className="w-full accent-[#9F1239] cursor-pointer h-2 bg-[#FBF0D2] dark:bg-obsidian-800 rounded-lg"
            />
          </div>

          {/* Comparison Cards */}
          <div className="space-y-2 text-base">
            <div className="flex justify-between items-center text-amber-800 bg-amber-50 p-3.5 rounded-xl border border-amber-200 font-medium">
              <span>Marketplace (25% Cut)</span>
              <span className="font-mono font-bold">-₹{Math.round(calcSales * 0.25).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-800 font-bold bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-xs">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Go Julex 0% Take-Rate</span>
              </div>
              <span className="font-mono text-base">+₹{calcSales.toLocaleString('en-IN')} (100% Yours)</span>
            </div>
          </div>

        </div>
      )
    },
    {
      id: 'slide_customizer',
      tag: 'VISUAL THEME ENGINE',
      title: 'Design Your Dream Store in Minutes.',
      subtitle: 'Custom palettes, typography, and live drag-and-drop layouts with zero coding.',
      badge: 'Zero Code',
      icon: Palette,
      highlightStats: [
        { label: 'Theme Presets', value: '8+ Curated' },
        { label: 'Layout Blocks', value: '12+ Modules' },
        { label: 'Mobile Responsive', value: '100% Tested' }
      ],
      previewGraphic: (
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-obsidian-850 border border-[#EFE2BC] rounded-3xl p-6 sm:p-8 text-left space-y-6 shadow-sm relative overflow-hidden transition hover:shadow-md w-full h-full flex flex-col justify-center"
        >
          <div className="flex items-center justify-between border-b border-[#EFE2BC] pb-2">
            <div>
              <span className="font-bold text-lg text-[#0F172A] dark:text-slate-100 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#A87A00]" /> Live Storefront Palette
              </span>
              <span className="text-sm text-[#475569] dark:text-slate-400">Click a swatch to see instant real-time theme styling</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-base bg-[#FBF0D2] dark:bg-obsidian-800 text-[#8A6200] border border-[#E7D49E] font-bold">
              Active
            </span>
          </div>

          {/* Interactive Palette Switcher */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'blush', name: 'Pastel Blush', color: '#fedddd', border: '#F8B4B4', text: '#881337' },
              { id: 'gold', name: 'Royal Gold', color: '#FEF3C7', border: '#FDE68A', text: '#B45309' },
              { id: 'emerald', name: 'Botanical', color: '#ECFDF5', border: '#A7F3D0', text: '#065F46' },
              { id: 'obsidian', name: 'Noir Luxury', color: '#1E293B', border: '#475569', text: '#F8FAFC' }
            ].map((th) => (
              <button
                key={th.id}
                type="button"
                onClick={() => setPreviewTheme(th.id)}
                className={'p-3 rounded-2xl border text-center transition cursor-pointer ' + (previewTheme === th.id ? 'ring-2 ring-offset-1 ring-[#9F1239] font-bold shadow-xs' : 'opacity-70 hover:opacity-100')}
                style={{ backgroundColor: th.color, borderColor: th.border, color: th.text }}
              >
                <span className="text-sm block font-bold truncate">{th.name}</span>
              </button>
            ))}
          </div>

        </div>
      )
    },
    {
      id: 'slide_isolation',
      tag: 'MULTI-TENANT CLOUD',
      title: 'Your Private Store. Your Custom Domain.',
      subtitle: 'Dedicated sandbox database and instant custom domain with free SSL.',
      badge: '100% Private',
      icon: Boxes,
      highlightStats: [
        { label: 'Database Sandbox', value: '100% Isolated' },
        { label: 'Custom Domain', value: 'Instant SSL' },
        { label: 'Uptime SLA', value: '99.99%' }
      ],
      previewGraphic: (
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-obsidian-850 border border-[#EFE2BC] rounded-3xl p-6 sm:p-8 text-left space-y-6 shadow-sm relative overflow-hidden transition hover:shadow-md w-full h-full flex flex-col justify-center"
        >
          <div className="text-lg font-bold text-[#0F172A] dark:text-slate-100 flex items-center justify-between border-b border-[#EFE2BC] pb-2">
            <span>Tenant Domain Routing</span>
            <span className="text-emerald-700 font-mono text-base bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              ● Active Sandbox
            </span>
          </div>

          {/* Interactive Subdomain vs Custom Domain Tab */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#FBF0D2] dark:bg-obsidian-800 border border-[#E7D49E] text-base font-bold">
            <button
              type="button"
              onClick={() => setActiveDomainTab('subdomain')}
              className={'py-2 rounded-xl transition cursor-pointer text-center ' + (activeDomainTab === 'subdomain' ? 'bg-white text-[#8A6200] shadow-xs' : 'text-[#475569] dark:text-slate-400 hover:text-[#0F172A] dark:text-slate-100')}
            >
              Cloud Subdomain
            </button>
            <button
              type="button"
              onClick={() => setActiveDomainTab('custom')}
              className={'py-2 rounded-xl transition cursor-pointer text-center ' + (activeDomainTab === 'custom' ? 'bg-white text-[#8A6200] shadow-xs' : 'text-[#475569] dark:text-slate-400 hover:text-[#0F172A] dark:text-slate-100')}
            >
              Custom Domain (.in / .com)
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-[#FDFAEE] dark:bg-obsidian-800 border border-[#EFE2BC] space-y-2">
            <div className="flex items-center justify-between text-base">
              <span className="text-xs text-[#475569] dark:text-slate-400 font-medium">Domain Route:</span>
              <span className="font-mono text-[#A87A00] font-bold">
                {activeDomainTab === 'subdomain' ? 'abisjewel.gojulex.com' : 'abisjewel.in'}
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'slide_invoices',
      tag: 'GST & TAX COMPLIANCE',
      title: 'Tax Invoicing on Pure Autopilot.',
      subtitle: 'Instant GST receipts, automated WhatsApp updates, and 1-click thermal & A4 print.',
      badge: 'Auto GST',
      icon: FileText,
      highlightStats: [
        { label: 'GST Formats', value: 'A4 & Thermal' },
        { label: 'PIN Codes', value: '19,000+' },
        { label: 'Tax Calculations', value: 'Automated' }
      ],
      previewGraphic: (
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-obsidian-850 border border-[#EFE2BC] rounded-3xl p-6 sm:p-8 text-left space-y-6 shadow-sm relative overflow-hidden transition hover:shadow-md w-full h-full flex flex-col justify-center"
        >
          <div className="flex items-center justify-between text-base border-b border-[#EFE2BC] pb-2">
            <span className="font-bold text-lg text-[#0F172A] dark:text-slate-100">GST Tax Receipt Simulator</span>
            <span className="font-mono text-base text-[#8A6200] bg-[#FBF0D2] dark:bg-obsidian-800 px-2 py-0.5 rounded-full border border-[#E7D49E]">
              INV-2026-8801
            </span>
          </div>

          {/* Interactive Format Toggle */}
          <div className="grid grid-cols-2 gap-2 text-base">
            <button
              type="button"
              onClick={() => setActiveInvoiceFormat('A4')}
              className={'p-3 rounded-xl border text-center font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ' + (activeInvoiceFormat === 'A4' ? 'bg-[#9F1239] text-white border-[#9F1239]' : 'bg-[#FDFAEE] dark:bg-obsidian-800 border-[#EFE2BC] text-[#475569] dark:text-slate-400')}
            >
              <Printer className="w-3.5 h-3.5" /> Classic A4 PDF
            </button>
            <button
              type="button"
              onClick={() => setActiveInvoiceFormat('thermal')}
              className={'p-3 rounded-xl border text-center font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ' + (activeInvoiceFormat === 'thermal' ? 'bg-[#9F1239] text-white border-[#9F1239]' : 'bg-[#FDFAEE] dark:bg-obsidian-800 border-[#EFE2BC] text-[#475569] dark:text-slate-400')}
            >
              <QrCode className="w-3.5 h-3.5" /> Thermal POS Slip
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-base">
            <div className="p-4 rounded-2xl bg-[#FBF0D2] dark:bg-obsidian-800 border border-[#EFE2BC]">
              <span className="text-[#475569] dark:text-slate-400 block text-xs">CGST (9%)</span>
              <span className="font-mono font-bold text-[#0F172A] dark:text-slate-100">₹225.00</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#FBF0D2] dark:bg-obsidian-800 border border-[#EFE2BC]">
              <span className="text-[#475569] dark:text-slate-400 block text-xs">SGST (9%)</span>
              <span className="font-mono font-bold text-[#0F172A] dark:text-slate-100">₹225.00</span>
            </div>
          </div>

        </div>
      )
    }
  ];

  const activeSlide = showcaseSlides[currentSlideIndex];

  // ----------------------------------------------------
  // UNIFIED SIGN IN HANDLER
  // ----------------------------------------------------
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email address and password.');
      return;
    }

    setLoading(true);

    try {
      const result = await loginAdmin(email.trim(), password);
      if (result && result.success) {
        if (result.user?.role === 'SUPER_ADMIN') {
          navigate('/super-admin');
        } else {
          navigate('/onboarding');
        }
      } else {
        setError(result?.message || 'Invalid credentials. Please verify your email and password.');
        setLoading(false);
      }
    } catch (err) {
      setError('Authentication connection error.');
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // MERCHANT SIGN UP HANDLER
  // ----------------------------------------------------
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (!regEmail.trim() || !regPassword.trim() || !regStoreName.trim()) {
      setError('Please fill in your name, business email, store name, and password.');
      return;
    }

    setLoading(true);

    try {
      // 1) REAL account first: tenant + owner user in the backend database,
      //    so email + password login actually works.
      const backend = await api.auth.signupStore({
        name: regName.trim() || regEmail.split('@')[0],
        email: regEmail.trim(),
        password: regPassword,
        storeName: regStoreName.trim(),
        category: 'Custom E-Commerce Store'
      });
      if (!backend?.success) {
        setError(backend?.message || 'Could not create your store. Please try again.');
        setLoading(false);
        return;
      }
      localStorage.setItem('gojulex_jwt_token', backend.token);

      const cleanSub = (backend.store?.slug || regStoreName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'mystore');
      const result = await registerMerchant({
        email: regEmail.trim(),
        password: regPassword,
        name: regName.trim() || regEmail.split('@')[0],
        storeName: regStoreName.trim(),
        subdomain: cleanSub,
        customDomain: cleanSub + '.in',
        category: 'Custom E-Commerce Store',
        themePresetId: 'preset_pure_minimal',
        startWithEmptyCatalog: true
      });

      if (result && result.success) {
        navigate('/admin');
      } else {
        setError(result?.message || 'Failed to create merchant store.');
        setLoading(false);
      }
    } catch (err) {
      setError('Store creation connection error.');
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen overflow-y-auto overflow-x-hidden snap-y snap-mandatory julex-landing-bg text-[#0F172A] dark:text-slate-100 selection:bg-amber-200 selection:text-amber-900 font-sans">
      {/* Faint circular theme cards wandering the FULL first viewport, edge to edge, never clipped */}
      <div ref={heroRoamRef} className="absolute left-0 right-0 top-[73px] h-[calc(100vh-73px)] hidden lg:block pointer-events-none z-0">
        {[
          '/hero-images/theme-1.png','/hero-images/theme-2.png','/hero-images/theme-3.png','/hero-images/theme-4.png',
          '/hero-images/theme-5.png','/hero-images/theme-6.png','/hero-images/theme-7.png','/hero-images/theme-8.png',
          '/hero-images/theme-9.png',
        ].map((src) => (
          <div key={src} data-roam className="absolute left-0 top-0 will-change-transform">
            <div className="h-52 w-52 xl:h-60 xl:w-60 rounded-full overflow-hidden border-2 border-[#E7D7AE]/70 dark:border-gold-400/40 shadow-xl shadow-black/10 [filter:blur(1px)] opacity-[0.18] pointer-events-auto cursor-pointer transition-all duration-300 hover:opacity-40 hover:[filter:blur(0px)] hover:scale-110 hover:border-[#B8860B] dark:hover:border-gold-300 hover:shadow-[0_0_35px_rgba(184,134,11,0.45)]">
              <img src={src} alt="" aria-hidden className="w-full h-full object-cover" draggable={false} />
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Floating Constellation & Glow Animation Canvas */}
      {/* TOP NAVIGATION BAR — fixed so each screen below aligns exactly to the viewport */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-[#EFE2BC] dark:border-obsidian-700 bg-white/90 dark:bg-obsidian-900/90 dark:bg-obsidian-900/90 backdrop-blur-xl px-4 sm:px-8 py-2 flex items-center justify-between shadow-xs">
        {/* Left: Golden Brand Identity — logo with subtitle centered beneath */}
        <Link to="/" className="flex flex-col items-center group">
          <img src="/images/go-julex-logo.png" alt="Go Julex" className="h-9 sm:h-10 w-auto" />
          <span className="text-[9px] uppercase tracking-[0.22em] text-amber-800 dark:text-gold-300 font-bold mt-0.5">
            Multi-Tenant Platform
          </span>
        </Link>

        {/* Center Navigation Links */}
        <div className="hidden lg:flex items-center gap-8 text-sm text-[#475569] dark:text-slate-400 font-semibold">
          <a href="#showcase" className="hover:text-[#A87A00] transition">Platform Showcase</a>
          <a href="#tenants-get" className="hover:text-[#A87A00] transition">What Tenants Get</a>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold whitespace-nowrap" style={{ borderColor: '#D4AF37', color: '#B8860B' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] dark:bg-gold-300" />
            0% Commission Fee
          </span>
        </div>

        {/* Right: Theme Switch, Sign In & Launch Buttons */}
        <div className="flex items-center gap-2.5">
          <ThemeSwitcher />
          <button
            onClick={() => {
              setAuthMode('signin');
              setIsAuthOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#FBF0D2] dark:bg-obsidian-800 border border-[#EFE2BC] text-sm font-bold text-[#8A6200] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Lock className="w-4 h-4 text-[#A87A00]" />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => {
              setAuthMode('signup');
              setIsAuthOpen(true);
            }}
            className="px-4 sm:px-5 py-2 rounded-xl bg-[#A87A00] hover:bg-[#8A6200] text-white font-bold text-sm shadow-md shadow-amber-900/20 transition transform hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Store className="w-4 h-4" />
            <span>Start Your Store</span>
          </button>
        </div>
      </header>

      {/* HERO — fills exactly the first viewport below the fixed header */}
      <section id="showcase" className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 pt-[73px] snap-start">
        <div className="relative w-full h-[calc(100vh-73px)] flex items-center justify-center overflow-hidden">
          <div className="relative z-10 text-center space-y-5 max-w-4xl mx-auto flex flex-col items-center justify-center py-8 px-4">
          <h1 className="font-serif text-[2.75rem] sm:text-6xl lg:text-7xl font-black tracking-tight text-[#0F172A] dark:text-slate-100 leading-tight">
            Launch Your Independent Brand Storefront.{' '}
            <span className="text-[#A87A00] inline-block">
              Retain 100% of Every Sale.
            </span>
          </h1>

          <p className="text-lg sm:text-xl lg:text-2xl text-[#475569] dark:text-slate-400 font-normal max-w-3xl mx-auto leading-relaxed">Launch a high-converting luxury storefront in minutes. 0% take-rate. Instant checkout. Keep 100% of every rupee.</p>
        </div>
        </div>

      </section>

      {/* WHAT WE PROVIDE TO TENANTS (6 PILLARS) */}
      <section id="tenants-get" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-[#EFE2BC] snap-start">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-[#A87A00] font-bold block">
            THE SAAS TENANT ECOSYSTEM
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F172A] dark:text-slate-100">
            Everything Provided to Every Store Owner
          </h2>
          <p className="text-sm text-[#475569] dark:text-slate-400 max-w-2xl mx-auto">
            From instant storefront deployment to automated GST tax invoicing, our multi-tenant cloud provides everything in one unified dashboard.
          </p>
        </div>

        {/* Aceternity-style 3D carousel: drag, arrows, dots */}
        <div
          className="relative h-[480px] select-none cursor-grab active:cursor-grabbing"
          style={{ perspective: '1600px' }}
          onMouseDown={handleCarouselDragStart}
          onMouseMove={handleCarouselDragMove}
          onMouseUp={handleCarouselDragEnd}
          onMouseLeave={handleCarouselDragEnd}
          onTouchStart={handleCarouselDragStart}
          onTouchMove={handleCarouselDragMove}
          onTouchEnd={handleCarouselDragEnd}
        >
          <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
            {pillarSlides.map((slide, i) => {
              let offset = i - pillarIndex;
              const half = pillarSlides.length / 2;
              if (offset > half) offset -= pillarSlides.length;
              if (offset < -half) offset += pillarSlides.length;
              if (Math.abs(offset) > 2) return null;
              const IconComp = slide.icon;
              return (
                <div
                  key={slide.title}
                  onClick={() => offset !== 0 && setPillarIndex(i)}
                  className="absolute left-1/2 top-1/2 w-[300px] sm:w-[360px] h-[420px] rounded-3xl overflow-hidden border shadow-2xl flex flex-col items-center justify-center text-center p-8 gap-5"
                  style={{
                    background: isDarkMode ? slide.bgDark : slide.bg,
                    borderColor: offset === 0 ? '#A87A00' : '#EFE2BC',
                    transform: 'translate(-50%, -50%) translateX(' + (offset * 55) + '%) translateZ(' + (-Math.abs(offset) * 220) + 'px) rotateY(' + (offset * -32) + 'deg) scale(' + (offset === 0 ? 1 : 0.92) + ')',
                    zIndex: 10 - Math.abs(offset),
                    opacity: Math.abs(offset) > 1 ? 0.35 : 1,
                    transition: 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.55s ease',
                    pointerEvents: offset === 0 ? 'auto' : 'none',
                  }}
                >
                  <div className={'w-16 h-16 rounded-2xl flex items-center justify-center border-2 ' + (isDarkMode ? slide.bubbleDark : slide.bubble)}>
                    <IconComp className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-[#0F172A] dark:text-slate-100 leading-snug">
                    {slide.title}
                  </h3>
                  <p className="text-sm text-[#475569] dark:text-slate-400 leading-relaxed max-w-[260px]">
                    {slide.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <button
            onClick={pillarPrev}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/80 dark:bg-obsidian-800/80 border border-[#EFE2BC] dark:border-obsidian-600 shadow-md flex items-center justify-center text-[#8A6200] hover:scale-110 transition cursor-pointer"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={pillarNext}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/80 dark:bg-obsidian-800/80 border border-[#EFE2BC] dark:border-obsidian-600 shadow-md flex items-center justify-center text-[#8A6200] hover:scale-110 transition cursor-pointer"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {pillarSlides.map((_, dIdx) => (
              <button
                key={dIdx}
                onClick={() => setPillarIndex(dIdx)}
                className={'h-2 rounded-full transition-all duration-300 cursor-pointer ' + (dIdx === pillarIndex ? 'w-7 bg-[#A87A00]' : 'w-2 bg-[#E7D49E] hover:bg-[#A87A00]')}
              />
            ))}
          </div>
        </div>

      </section>

      {/* LUXURY BRANDING & PACKAGING SHOWCASE */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 snap-start">
        <div className="relative rounded-3xl overflow-hidden border border-[#EFE2BC] shadow-xl bg-white dark:bg-obsidian-850">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 relative h-72 sm:h-96">
              <img
                src="/images/gojulex_luxury_bags.jpg"
                alt="Go Julex Luxury Brand Packaging"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white dark:to-obsidian-850 hidden lg:block" />
            </div>
            <div className="lg:col-span-5 p-6 sm:p-10 space-y-4 text-left">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#9F1239] font-bold block">
                ✦ LUXURY PACKAGING & BRANDING
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-slate-100">
                Elevate Your Store with Signature Luxury Appeal
              </h2>
              <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400 leading-relaxed">
                From high-end packaging to tailored digital storefronts, Go Julex gives your independent brand an elite, recognizable identity with 0% take-rate.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setIsAuthOpen(true);
                  }}
                  className="px-5 py-3 rounded-xl bg-[#9F1239] hover:bg-[#881337] text-white font-bold text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <span>Build Your Luxury Storefront</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-[#EFE2BC] bg-white dark:bg-obsidian-900 py-8 text-center text-xs text-[#475569] dark:text-slate-400 space-y-2 snap-start">
        <img src="/images/go-julex-logo.png" alt="Go Julex" className="h-14 w-auto mx-auto" />
        <p className="text-[11px] text-amber-800 uppercase tracking-widest font-bold">
          Multi-Tenant Commerce Cloud
        </p>
        <p className="max-w-md mx-auto">
          Empowering modern independent makers and direct-to-consumer luxury brands across India.
        </p>
        <p className="text-[11px] text-slate-400">
          © {new Date().getFullYear()} Go Julex Inc. All rights reserved. • 0% Platform Fee SaaS Architecture
        </p>
      </footer>

      {/* UNIFIED SIGN IN / SIGN UP MODAL (Light Theme Glass) */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-obsidian-850 border border-[#EFE2BC] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setIsAuthOpen(false);
                setError('');
              }}
              className="absolute top-5 right-5 p-2 rounded-xl bg-[#FBF0D2] dark:bg-obsidian-800 hover:bg-slate-100 text-[#475569] dark:text-slate-400 hover:text-[#0F172A] dark:text-slate-100 border border-[#EFE2BC] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Top Branding in Modal */}
            <div className="text-center space-y-1">
              <img src="/images/go-julex-logo.png" alt="Go Julex" className="h-14 w-auto mx-auto" />
              <p className="text-xs text-[#475569] dark:text-slate-400">
                {authMode === 'signin'
                  ? 'Unified entry for Super Admin and Merchant Store Owners'
                  : 'Launch your 0% commission direct-to-consumer store'}
              </p>
            </div>

            {/* Tab Mode Toggle */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#FBF0D2] dark:bg-obsidian-800 border border-[#E7D49E] text-sm font-bold">
              <button
                type="button"
                onClick={() => { setAuthMode('signin'); setError(''); }}
                className={'py-2 rounded-xl transition cursor-pointer ' + (authMode === 'signin' ? 'bg-white text-[#8A6200] shadow-xs' : 'text-[#475569] dark:text-slate-400 hover:text-[#0F172A] dark:text-slate-100')}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setError(''); }}
                className={'py-2 rounded-xl transition cursor-pointer ' + (authMode === 'signup' ? 'bg-white text-[#8A6200] shadow-xs' : 'text-[#475569] dark:text-slate-400 hover:text-[#0F172A] dark:text-slate-100')}
              >
                Create Store
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-amber-800 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* TAB 1: SIGN IN FORM */}
            {authMode === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-4 text-left">
                <div>
                  <label className="text-sm font-semibold text-[#475569] dark:text-slate-400 block mb-1.5">
                    Email Address / Store ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. abinayaramasamy502@gmail.com or admin@gojulex.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-obsidian-850 border border-[#EFE2BC] rounded-xl text-[#0F172A] dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#9F1239] focus:ring-2 focus:ring-rose-100 font-medium transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#475569] dark:text-slate-400 block mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-obsidian-850 border border-[#EFE2BC] rounded-xl text-[#0F172A] dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#9F1239] focus:ring-2 focus:ring-rose-100 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#A87A00] hover:bg-[#8A6200] text-white font-bold text-sm shadow-lg shadow-amber-900/20 transition transform active:scale-98 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                    </>
                  ) : (
                    <>
                      Enter Cloud Dashboard <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Social Login Divider */}
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#EFE2BC]" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-[#94A3B8] text-[10px] font-bold uppercase tracking-widest">
                      Or Continue With
                    </span>
                  </div>
                </div>

                {/* Social Logins */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={async () => {
                      setLoading(true);
                      const res = await googleSignIn();
                      if (res?.redirecting) return; // full-page Google redirect in progress
                      if (res?.success) {
                        navigate(res.user?.role === 'SUPER_ADMIN' ? '/super-admin' : '/admin');
                      } else if (!res?.cancelled) {
                        setError(res?.message || 'Google sign-in failed.');
                      }
                      setLoading(false);
                    }}
                    disabled={loading}
                    className="p-2.5 rounded-xl bg-[#FDFAEE] dark:bg-obsidian-800 hover:bg-slate-100 border border-[#EFE2BC] text-xs font-semibold text-[#0F172A] dark:text-slate-100 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setLoading(true);
                      const res = await oauthLogin('microsoft');
                      if (res?.redirecting) return;
                      if (res?.success) {
                        navigate(res.user?.role === 'SUPER_ADMIN' ? '/super-admin' : '/admin');
                      } else {
                        setError(res?.message || 'Microsoft sign-in failed.');
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="p-2.5 rounded-xl bg-[#FDFAEE] dark:bg-obsidian-800 hover:bg-slate-100 border border-[#EFE2BC] text-xs font-semibold text-[#0F172A] dark:text-slate-100 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 23 23">
                      <rect fill="#F25022" x="1" y="1" width="10" height="10" />
                      <rect fill="#7FBA00" x="12" y="1" width="10" height="10" />
                      <rect fill="#00A4EF" x="1" y="12" width="10" height="10" />
                      <rect fill="#FFB900" x="12" y="12" width="10" height="10" />
                    </svg>
                    <span>Microsoft</span>
                  </button>
                </div>
              </form>
            ) : (
              /* TAB 2: SIGN UP FORM */
              <form onSubmit={handleSignUp} className="space-y-3.5 text-left">
                <div>
                  <label className="text-sm font-semibold text-[#475569] dark:text-slate-400 block mb-1">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Abinaya"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-obsidian-850 border border-[#EFE2BC] rounded-xl text-[#0F172A] dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#9F1239] focus:ring-2 focus:ring-rose-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#475569] dark:text-slate-400 block mb-1">
                    Store / Brand Name
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={regStoreName}
                      onChange={(e) => setRegStoreName(e.target.value)}
                      placeholder="e.g. Abi's Jewelry Boutique"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-obsidian-850 border border-[#EFE2BC] rounded-xl text-[#0F172A] dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#9F1239] focus:ring-2 focus:ring-rose-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#475569] dark:text-slate-400 block mb-1">
                    Business Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. owner@abisjewel.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-obsidian-850 border border-[#EFE2BC] rounded-xl text-[#0F172A] dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#9F1239] focus:ring-2 focus:ring-rose-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#475569] dark:text-slate-400 block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-obsidian-850 border border-[#EFE2BC] rounded-xl text-[#0F172A] dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#9F1239] focus:ring-2 focus:ring-rose-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#A87A00] hover:bg-[#8A6200] text-white font-bold text-sm shadow-lg shadow-amber-900/20 transition transform active:scale-98 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Launching Store...
                    </>
                  ) : (
                    <>
                      Create Store & Launch <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
