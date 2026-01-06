'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { resetPassword } from '@/app/actions/reset'
import { Loader2, ArrowRight, Lock, CheckCircle2 } from 'lucide-react'

function ResetContent() {
  const searchParams = useSearchParams()
  // Capturamos el email que viene en el enlace mágico
  const email = searchParams.get('email')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    // Añadimos el email al formulario oculto
    if (email) formData.append('email', email)
    
    const result = await resetPassword(formData)
    if (result?.error) {
        setError(result.error)
        setLoading(false)
    }
  }

  if (!email) {
    return (
        <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center font-sans">
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock size={20} />
                </div>
                <h1 className="text-xl font-semibold text-gray-900 mb-2">Enlace no válido</h1>
                <p className="text-gray-500 text-sm">El enlace de recuperación parece estar incompleto o ha caducado.</p>
                <a href="/" className="mt-6 inline-block text-blue-600 text-sm font-medium hover:underline">Volver al inicio</a>
            </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center font-sans p-4">
      <div className="max-w-md w-full bg-white p-10 rounded-[32px] shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-4">
                <Lock className="w-5 h-5 text-gray-900" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Nueva Contraseña</h1>
            <p className="text-gray-500 text-sm">
                Establezca una nueva clave de acceso para <span className="font-medium text-gray-900">{email}</span>
            </p>
        </div>

        <form action={handleSubmit} className="space-y-4">
            
            <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider pl-1">Nueva Clave</label>
                <input 
                    name="password" 
                    type="password" 
                    required 
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 font-medium placeholder-gray-300"
                />
            </div>

            <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider pl-1">Confirmar Clave</label>
                <input 
                    name="confirm" 
                    type="password" 
                    required 
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 font-medium placeholder-gray-300"
                />
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-red-500" />
                    {error}
                </div>
            )}

            <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-2 bg-[#1d1d1f] hover:bg-black text-white py-4 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <>Actualizar Acceso <ArrowRight className="w-4 h-4" /></>}
            </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <a href="/" className="text-xs font-medium text-gray-400 hover:text-gray-900 transition-colors">Cancelar y volver</a>
        </div>

      </div>
    </div>
  )
}

export default function ResetPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#F5F5F7]" />}>
            <ResetContent />
        </Suspense>
    )
}

