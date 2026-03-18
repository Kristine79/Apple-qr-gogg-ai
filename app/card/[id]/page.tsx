'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { decodeCardData, type CarCardData } from '@/lib/utils';
import { 
  Car, 
  Phone, 
  Mail, 
  Send, 
  MessageSquare, 
  AlertTriangle,
  ShieldAlert,
  Info,
  QrCode,
  Download,
  User,
  Zap,
  ChevronDown
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';

const BUTTON_CONFIG: Record<string, { label: string, icon: any, color: string }> = {
  evacuation: { label: 'Эвакуация', icon: AlertTriangle, color: 'bg-orange-500' },
  damage: { label: 'Повреждение', icon: ShieldAlert, color: 'bg-apple-red' },
  vandalism: { label: 'Вандализм', icon: ShieldAlert, color: 'bg-purple-500' },
  message: { label: 'Сообщение', icon: MessageSquare, color: 'bg-blue-500' },
};

export default function PublicCardView() {
  const params = useParams();
  const id = params.id as string;
  const [alertSent, setAlertSent] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [mounted, setMounted] = useState(false);

  const card = React.useMemo(() => {
    if (!id) return null;
    return decodeCardData(id);
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, [card, id]);

  const sendAlert = (type: string) => {
    // Show local success message
    setAlertSent(type);
    
    const config = BUTTON_CONFIG[type];
    
    // Simple notification: Open Telegram with pre-filled message
    if (card?.telegram) {
      const alertMessage = encodeURIComponent(`Здравствуйте! Я у вашего авто ${card.carModel} (${card.plateNumber}). Сигнал: ${config?.label || type}. Пожалуйста, выйдите.`);
      window.open(`https://t.me/${card.telegram.replace('@', '')}?text=${alertMessage}`, '_blank');
    } else if (card?.phone1) {
      // If no telegram, maybe they want to call?
      // window.location.href = `tel:${card.phone1}`;
    }

    setTimeout(() => setAlertSent(null), 3000);
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set high resolution for download
    const scale = 4; // 240 * 4 = 960px
    const size = 240 * scale;
    canvas.width = size;
    canvas.height = size;
    
    const img = new window.Image();
    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, size, size);
        
        const pngFile = canvas.toDataURL('image/png', 1.0);
        const downloadLink = document.createElement('a');
        downloadLink.download = `QR_${card?.plateNumber || 'car'}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (!card) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black p-8 text-center">
        <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 border border-white/10">
          <Info className="w-10 h-10 text-white/40" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Визитка не найдена</h1>
        <p className="text-white/40 mt-3 max-w-xs leading-relaxed">Возможно, ссылка повреждена или неверна. Попробуйте отсканировать код еще раз.</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-8 py-4 px-8 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
        >
          На главную
        </button>
      </div>
    );
  }

  const cardUrl = typeof window !== 'undefined' ? `${window.location.origin}/card/${id}` : '';

  if (!mounted) return null;

  return (
    <div 
      className="min-h-screen pb-12 bg-black text-white font-sans selection:bg-apple-red selection:text-white"
      suppressHydrationWarning
    >
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-apple-red/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-apple-red/5 blur-[120px] rounded-full"></div>
      </div>

      {/* Hero Section */}
      <div className="relative pt-16 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 red-gradient opacity-20 blur-3xl -z-10 transform scale-150"></div>
        
        <div className="max-w-md mx-auto relative z-10">
          <div className="flex justify-between items-start mb-10">
            <div className="w-16 h-16 glass-panel rounded-2xl flex items-center justify-center border border-white/10 shadow-xl">
              <Car className="w-8 h-8 text-apple-red" />
            </div>
            <button 
              onClick={() => setShowQR(true)}
              className="w-12 h-12 glass-panel rounded-2xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all shadow-xl"
            >
              <QrCode className="w-6 h-6 text-white/60" />
            </button>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight leading-tight">
              {card.carModel}
            </h1>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-2xl transform -rotate-1">
              <span className="text-2xl font-black tracking-widest text-black uppercase font-mono">
                {card.plateNumber}
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto px-6 -mt-12 space-y-8 relative z-20">
        {/* Quick Actions */}
        {card.quickButtons.length > 0 && (
          <section className="grid grid-cols-2 gap-4">
            {card.quickButtons.map((btnId) => {
              const config = BUTTON_CONFIG[btnId];
              if (!config) return null;
              const Icon = config.icon;
              const isSent = alertSent === btnId;

              return (
                <motion.button
                  key={btnId}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => sendAlert(btnId)}
                  disabled={!!alertSent}
                  className={`relative overflow-hidden flex flex-col items-center justify-center min-h-[120px] p-6 rounded-[2.5rem] transition-all border shadow-2xl ${
                    isSent 
                      ? 'bg-green-500/20 border-green-500/50 text-green-400' 
                      : 'glass-panel border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${isSent ? 'bg-green-500/20' : 'bg-apple-red/10'}`}>
                    <Icon className={`w-6 h-6 ${isSent ? 'text-green-400 animate-pulse' : 'text-apple-red'}`} />
                  </div>
                  <span className="font-bold text-[10px] uppercase tracking-widest text-center opacity-80">
                    {isSent ? 'Отправлено!' : config.label}
                  </span>
                </motion.button>
              );
            })}
          </section>
        )}

        {/* Contact Info */}
        {card.showContact && (
          <section className="glass-card p-8 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-apple-red/20 flex items-center justify-center">
                <User className="w-4 h-4 text-apple-red" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">
                Владелец авто
              </h3>
            </div>
            
            <div className="space-y-8">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                  <User className="w-7 h-7 text-white/60" />
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tight">{card.ownerName}</p>
                  {card.telegram && (
                    <p className="text-sm font-medium text-apple-red mt-1">
                      {card.telegram}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <a href={`tel:${card.phone1}`} className="flex items-center justify-between group p-4 -m-4 rounded-3xl hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all">
                      <Phone className="w-6 h-6 text-white/40 group-hover:text-white/80" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-white/30">Телефон</p>
                      <p className="font-bold text-lg tracking-tight">{card.phone1}</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-apple-red/20 transition-all">
                    <Phone className="w-4 h-4 text-white/20 group-hover:text-apple-red" />
                  </div>
                </a>

                {card.telegram && (
                  <a href={`https://t.me/${card.telegram.replace('@', '')}`} target="_blank" className="flex items-center justify-between group p-4 -m-4 rounded-3xl hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all">
                        <Send className="w-6 h-6 text-white/40 group-hover:text-white/80" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-white/30">Telegram</p>
                        <p className="font-bold text-lg tracking-tight">{card.telegram}</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-apple-red/20 transition-all">
                      <Send className="w-4 h-4 text-white/20 group-hover:text-apple-red" />
                    </div>
                  </a>
                )}

                {card.whatsapp && (
                  <a href={`https://wa.me/${card.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" className="flex items-center justify-between group p-4 -m-4 rounded-3xl hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all">
                        <MessageSquare className="w-6 h-6 text-white/40 group-hover:text-white/80" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-white/30">WhatsApp</p>
                        <p className="font-bold text-lg tracking-tight">{card.whatsapp}</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-apple-red/20 transition-all">
                      <MessageSquare className="w-4 h-4 text-white/20 group-hover:text-apple-red" />
                    </div>
                  </a>
                )}

                {card.max && (
                  <div className="flex items-center gap-5 p-4 -m-4 rounded-3xl">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                      <Zap className="w-6 h-6 text-white/40" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-white/30">Max</p>
                      <p className="font-bold text-lg tracking-tight">{card.max}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Primary Contact Buttons */}
        <div className="grid grid-cols-1 gap-4">
          {card.phone1 && (
            <a 
              href={`tel:${card.phone1}`}
              className="flex items-center justify-center gap-3 text-white py-6 rounded-[2rem] font-bold text-xl red-gradient shadow-2xl red-glow hover:brightness-110 transition-all active:scale-95"
            >
              <Phone className="w-6 h-6" />
              Позвонить
            </a>
          )}
          {card.telegram && (
            <a 
              href={`https://t.me/${card.telegram.replace('@', '')}`}
              target="_blank"
              className="flex items-center justify-center gap-3 bg-white/10 text-white py-6 rounded-[2rem] font-bold text-xl border border-white/10 hover:bg-white/20 transition-all active:scale-95"
            >
              <Send className="w-6 h-6" />
              Написать в Telegram
            </a>
          )}
        </div>
      </main>

      <footer className="mt-20 mb-12 text-center space-y-8 px-6">
        <div className="flex flex-col items-center gap-6">
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Разработка и поддержка</p>
          <div className="flex items-center gap-8">
            <a 
              href="https://t.me/krisdev13" 
              target="_blank" 
              className="group flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-apple-red/20 group-hover:border-apple-red/30 transition-all">
                <Send className="w-5 h-5 text-white/40 group-hover:text-apple-red" />
              </div>
              <span className="text-[10px] font-bold text-white/40 group-hover:text-white/80 transition-colors">@krisdev13</span>
            </a>
            <a 
              href="mailto:info@premiumwebsite.ru" 
              className="group flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-apple-red/20 group-hover:border-apple-red/30 transition-all">
                <Mail className="w-5 h-5 text-white/40 group-hover:text-apple-red" />
              </div>
              <span className="text-[10px] font-bold text-white/40 group-hover:text-white/80 transition-colors">Email</span>
            </a>
          </div>
        </div>
        <div className="pt-8 border-t border-white/5">
          <p className="text-[10px] text-white/10 font-bold uppercase tracking-widest">© 2026 CarQR. Все права защищены.</p>
        </div>
      </footer>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-2xl"
          >
            {/* Header */}
            <header className="flex items-center justify-between px-8 py-6 border-b border-white/10">
              <h2 className="text-2xl font-bold tracking-tight">Ваш QR-код</h2>
              <button 
                onClick={() => setShowQR(false)}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
              >
                <ChevronDown className="w-6 h-6" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center gap-10">
              <div className="relative group">
                <div className="absolute -inset-4 red-gradient rounded-[3rem] blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative bg-white p-8 rounded-[2.5rem] shadow-2xl">
                  <QRCodeSVG 
                    id="qr-code-svg"
                    value={cardUrl}
                    size={240}
                    level="H"
                    includeMargin={true}
                    imageSettings={{
                      src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ff3b30'%3E%3Cpath d='M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z'/%3E%3C/svg%3E",
                      x: undefined,
                      y: undefined,
                      height: 40,
                      width: 40,
                      excavate: true,
                    }}
                  />
                </div>
              </div>

              <div className="w-full max-w-sm space-y-4">
                <button
                  onClick={downloadQR}
                  className="w-full py-5 px-8 rounded-3xl red-gradient text-white font-bold flex items-center justify-center gap-3 shadow-xl red-glow hover:brightness-110 transition-all"
                >
                  <Download className="w-6 h-6" />
                  Скачать PNG
                </button>
                
                <button
                  onClick={() => setShowQR(false)}
                  className="w-full py-5 px-8 rounded-3xl bg-white/10 text-white font-bold flex items-center justify-center gap-3 border border-white/10 hover:bg-white/20 transition-all"
                >
                  Закрыть
                </button>
              </div>

              <div className="glass-panel p-6 w-full max-w-sm">
                <p className="text-xs text-white/40 leading-relaxed text-center font-medium">
                  Распечатайте этот код и разместите его под лобовым стеклом. При сканировании откроется ваша персональная визитка.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
