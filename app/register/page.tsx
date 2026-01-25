'use client'

import { useState, useEffect, Suspense } from 'react'
import { registerUser } from '@/app/actions/register' 
import { loginUser } from '@/app/actions/login'
import { Building2, User, ArrowRight, Loader2, Eye, EyeOff, KeyRound, Mail, ArrowLeft } from 'lucide-react'
import { sendRecoveryEmail } from '@/app/actions/send-emails';

// 1. CAMBIAMOS EL NOMBRE DEL COMPONENTE ORIGINAL A "AuthContent"
function AuthContent() {
  // ESTADOS DE NAVEGACIÓN
  const [isLoginMode, setIsLoginMode] = useState(false)
  const [isRecoveryMode, setIsRecoveryMode] = useState(false)
  
  const [selectedRole, setSelectedRole] = useState<'PARTICULAR' | 'AGENCIA' | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [strength, setStrength] = useState(0)
  
  // ESTADO PARA MENSAJES DE ÉXITO/ERROR
  const [message, setMessage] = useState<string | null>(null)

  // Medidor de fuerza (Solo para registro)
  useEffect(() => {
    if (isLoginMode) return;
    let score = 0;
    if (password.length > 5) score++;
    if (password.length > 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    setStrength(score);
  }, [password, isLoginMode]);

  const getStrengthColor = () => {
    if (strength <= 1) return "bg-red-500 w-1/4";
    if (strength === 2) return "bg-orange-400 w-2/4";
    if (strength === 3) return "bg-yellow-400 w-3/4";
    return "bg-green-500 w-full";
  };

  const getStrengthLabel = () => {
    if (strength <= 1) return "Débil";
    if (strength === 2) return "Regular";
    if (strength === 3) return "Buena";
    return "Segura";
  };

  // MANEJADOR DE ENVÍO
  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setMessage(null)
    
    // CASO 1: RECUPERACIÓN DE CONTRASEÑA
    if (isRecoveryMode) {
        const email = formData.get('email') as string;
        
        // 🔥 DISPARAMOS EL EMAIL REAL
        const result = await sendRecoveryEmail(email);
        
        if (result.success) {
             setMessage("✅ Hemos enviado un enlace de recuperación a su correo.");
        } else {
             setMessage("❌ Error al enviar: " + (result.error || "Inténtelo de nuevo"));
        }
        
        setLoading(false);
        return;
    }
    
    // CASO 2: LOGIN
    if (isLoginMode) {
      const result = await loginUser(formData)
      if (result?.error) setMessage(`❌ ${result.error}`)
    } 
    // CASO 3: REGISTRO
    else {
      if (selectedRole) formData.append('role', selectedRole)
      const result = await registerUser(formData)
      if (result?.error) setMessage(`❌ ${result.error}`)
    }
    
    setLoading(false)
  }

  return (
<div className="w-full h-full bg-[#F5F5F7] flex items-center justify-center p-4 font-sans">
      <div className="max-w-4xl w-full">
        
        {/* CABECERA DINÁMICA */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 mb-2">Stratosfere ID.</h1>
          <p className="text-gray-500 text-lg font-medium">
            {isRecoveryMode ? "Protocolo de Recuperación" : (isLoginMode ? "Acceda a su terminal de mando." : "Seleccione su perfil de acceso.")}
          </p>
        </div>

        {/* SELECCIÓN DE ROL */}
        {!isLoginMode && !selectedRole && !isRecoveryMode && (
          <div className="grid md:grid-cols-2 gap-6 animate-in fade-in zoom-in duration-500">
            <button onClick={() => setSelectedRole('PARTICULAR')} className="bg-white p-8 rounded-[32px] shadow-sm hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-blue-100 text-left group relative overflow-hidden">
               <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform shadow-sm"><User size={28} strokeWidth={2.5} /></div>
               <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Soy Particular</h3>
               <p className="text-gray-500 mb-8 leading-relaxed font-medium">Quiero comprar, alquilar o vender mi propia propiedad.</p>
               <div className="flex items-center text-blue-600 font-bold text-sm tracking-wide uppercase">Crear cuenta personal <ArrowRight className="ml-2 w-4 h-4" /></div>
            </button>

            <button onClick={() => setSelectedRole('AGENCIA')} className="bg-white p-8 rounded-[32px] shadow-sm hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-gray-200 text-left group relative overflow-hidden">
               <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform shadow-lg"><Building2 size={28} strokeWidth={2.5} /></div>
               <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Soy Profesional</h3>
               <p className="text-gray-500 mb-8 leading-relaxed font-medium">Soy Agencia, Inversor o Personal Shopper.</p>
               <div className="flex items-center text-gray-900 font-bold text-sm tracking-wide uppercase">Crear cuenta de empresa <ArrowRight className="ml-2 w-4 h-4" /></div>
            </button>
          </div>
        )}

        {/* CAJA DE FORMULARIO MAESTRA */}
        {(isLoginMode || selectedRole || isRecoveryMode) && (
          <div className="max-w-md mx-auto bg-white p-10 rounded-[40px] shadow-2xl animate-in slide-in-from-bottom-8 duration-500 relative overflow-hidden">
            
            <button 
                onClick={() => {
                    if (isRecoveryMode) setIsRecoveryMode(false);
                    else if (isLoginMode) { }
                    else setSelectedRole(null);
                    setMessage(null);
                }} 
                className={`text-xs font-bold text-gray-400 hover:text-gray-900 mb-8 flex items-center uppercase tracking-widest transition-colors ${isLoginMode && !isRecoveryMode ? 'invisible' : ''}`}
            >
                <ArrowLeft size={14} className="mr-1" /> Volver
            </button>
            
            <div className="mb-6">
              {!isLoginMode && !isRecoveryMode && <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest mb-4 ${selectedRole === 'AGENCIA' ? 'bg-black text-white' : 'bg-blue-100 text-blue-700'}`}>CUENTA {selectedRole}</span>}
              
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter">
                  {isRecoveryMode ? "Restablecer Clave" : (isLoginMode ? "Bienvenido de nuevo" : "Sus credenciales")}
              </h2>
              
              {message && (
                  <div className={`mt-4 p-4 rounded-xl text-sm font-bold ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {message}
                  </div>
              )}
            </div>

            <form action={handleSubmit} className="space-y-5">
              
              {!isLoginMode && !isRecoveryMode && (
                  <div className="group animate-in fade-in slide-in-from-top-2">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Nombre Completo</label>
                    <input name="name" type="text" required className="w-full px-5 py-4 rounded-2xl border border-gray-200 font-bold text-gray-900 focus:border-blue-500 bg-gray-50 focus:bg-white outline-none transition-all" />
                  </div>
              )}

              {!isLoginMode && !isRecoveryMode && selectedRole === 'AGENCIA' && (
                <>
                  <div className="group animate-in fade-in slide-in-from-top-2">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Nombre Empresa</label>
                    <input name="companyName" type="text" required className="w-full px-5 py-4 rounded-2xl border border-gray-200 font-bold text-gray-900 focus:border-blue-500 bg-gray-50 focus:bg-white outline-none transition-all" />
                  </div>
                  <div className="group animate-in fade-in slide-in-from-top-2">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">CIF / ID Fiscal</label>
                    <input name="cif" type="text" required className="w-full px-5 py-4 rounded-2xl border border-gray-200 font-bold text-gray-900 focus:border-blue-500 bg-gray-50 focus:bg-white outline-none transition-all" />
                  </div>
                </>
              )}

              <div className="group">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Email {isRecoveryMode && "de Recuperación"}</label>
                <div className="relative">
                    <input name="email" type="email" required className="w-full px-5 py-4 rounded-2xl border border-gray-200 font-bold text-gray-900 focus:border-blue-500 bg-gray-50 focus:bg-white outline-none transition-all pl-12" placeholder="nombre@correo.com" />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>

              {!isRecoveryMode && (
                  <div className="group">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">Contraseña</label>
                        {isLoginMode && (
                            <button type="button" onClick={() => { setIsRecoveryMode(true); setMessage(null); }} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider hover:underline">
                                ¿Olvidó la clave?
                            </button>
                        )}
                    </div>
                    <div className="relative">
                      <input 
                        name="password" 
                        type={showPassword ? "text" : "password"} 
                        required 
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl border border-gray-200 font-bold text-gray-900 focus:border-blue-500 bg-gray-50 focus:bg-white outline-none transition-all pr-12" 
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    
                    {!isLoginMode && password.length > 0 && (
                        <div className="mt-3 flex items-center gap-3 animate-fade-in">
                            <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-500 ease-out ${getStrengthColor()}`}></div>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 min-w-[50px] text-right">{getStrengthLabel()}</span>
                        </div>
                    )}
                  </div>
              )}

              <div className="pt-2">
                <button type="submit" disabled={loading} className="w-full bg-[#1d1d1f] text-white py-5 rounded-2xl font-bold text-lg hover:bg-black transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 flex justify-center items-center shadow-xl shadow-gray-200">
                    {loading ? <Loader2 className="animate-spin" /> : (isRecoveryMode ? 'Enviar Enlace Mágico' : (isLoginMode ? 'Entrar al Sistema' : 'Inicializar Sistema'))}
                </button>
              </div>
            </form>
            
            {!isRecoveryMode && (
                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                    <p className="text-xs font-medium text-gray-500 mb-2">
                        {isLoginMode ? "¿Aún no tienes acceso?" : "¿Ya tienes cuenta?"}
                    </p>
                    <button 
                        onClick={() => {
                            setIsLoginMode(!isLoginMode);
                            setSelectedRole(null); 
                            setMessage(null);
                        }} 
                        className="text-sm font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wide hover:underline transition-all"
                    >
                        {isLoginMode ? "Crear una cuenta nueva" : "Iniciar Sesión"}
                    </button>
                </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}

// 2. EXPORTAMOS POR DEFECTO EL WRAPPER CON SUSPENSE
export default function AuthPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4">
        <Suspense
          fallback={
            <div className="flex items-center justify-center">
              <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
          }
        >
          <AuthContent />
        </Suspense>
      </main>

      {/* ✅ FOOTER LEGAL ABAJO */}
      <footer className="pb-10 pt-6">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] md:text-sm text-black/70">
            <a className="underline underline-offset-4 hover:text-black" href="/pricing">
              Pricing
            </a>
            <a className="underline underline-offset-4 hover:text-black" href="/terms">
              Términos
            </a>
            <a className="underline underline-offset-4 hover:text-black" href="/privacy">
              Privacidad
            </a>
            <a className="underline underline-offset-4 hover:text-black" href="/refunds">
              Reembolsos
            </a>
          </div>

          <div className="mt-3 text-[11px] md:text-[12px] text-black/40">
            © {new Date().getFullYear()} Stratosfere
          </div>
        </div>
      </footer>
    </div>
  );
}
