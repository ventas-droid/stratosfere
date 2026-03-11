"use client";

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, TrendingUp, Clock, AlertTriangle, Search, Filter, 
  CheckCircle2, FileText, Download, ShieldCheck, Zap, Loader2
} from 'lucide-react';
import { getTacticalInvoicesAction, markInvoiceAsPaidAction } from '@/app/actions-billing';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default function AdminBillingHistory() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('TODOS');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    const res = await getTacticalInvoicesAction();
    if (res.success && res.data) {
      setInvoices(res.data);
    }
    setLoading(false);
  };

  const handleMarkAsPaid = async (id: string, invoiceNumber: string) => {
    if (window.confirm(`💰 ¿Confirma la recepción de fondos para la factura ${invoiceNumber}?`)) {
      const res = await markInvoiceAsPaidAction(id);
      if (res.success) {
        setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'PAGADO' } : inv));
      } else {
        alert("🚨 Error al procesar el pago en los servidores.");
      }
    }
  };

  // 🔥 NUEVO MOTOR PREMIUM: EXPORTAR A EXCEL CON DISEÑO GOD MODE
  const handleExportExcel = async () => {
    if (filteredInvoices.length === 0) return alert("⚠️ No hay datos para exportar.");

    // 1. Instanciamos el Libro de Excel Profesional
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Operaciones Stratosfere', {
      views: [{ state: 'frozen', ySplit: 1 }] // Congela la cabecera al hacer scroll
    });

    // 2. Definimos las Columnas y sus Anchos Milimétricos
    worksheet.columns = [
      { header: 'ID OPERACIÓN', key: 'id', width: 16 },
      { header: 'FECHA EMISIÓN', key: 'date', width: 18 },
      { header: 'AGENCIA CLIENTE', key: 'agency', width: 35 },
      { header: 'REFERENCIA ACTIVO', key: 'ref', width: 22 },
      { header: 'CONCEPTO / SERVICIO', key: 'service', width: 30 },
      { header: 'IMPORTE (€)', key: 'amount', width: 15 },
      { header: 'ESTADO CONTABLE', key: 'status', width: 20 }
    ];

    // 3. Pintamos la Cabecera de Negro (Estilo Stratosfere)
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } }; // Fondo Slate-900
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    // 4. Inyectamos los Datos
    filteredInvoices.forEach(inv => {
      const row = worksheet.addRow({
        id: inv.invoiceNumber,
        date: new Date(inv.createdAt).toLocaleDateString('es-ES'),
        agency: inv.agencyName,
        ref: inv.targetRef || "N/A",
        service: inv.serviceType,
        amount: inv.amount,
        status: inv.status
      });

      // Estilo de las filas de datos
      row.alignment = { vertical: 'middle', horizontal: 'left' };
      row.getCell('amount').alignment = { horizontal: 'center' };
      row.getCell('status').alignment = { horizontal: 'center' };
      row.font = { size: 10 };

      // 5. Semáforo de Colores para el Estado
      const statusCell = row.getCell('status');
      if (inv.status === 'PAGADO') {
          statusCell.font = { color: { argb: 'FF059669' }, bold: true }; // Verde Esmeralda
      } else if (inv.status === 'PENDIENTE') {
          statusCell.font = { color: { argb: 'FFD97706' }, bold: true }; // Naranja Ámbar
      } else {
          statusCell.font = { color: { argb: 'FFDC2626' }, bold: true }; // Rojo
      }
    });

    // 6. Empaquetamos y Descargamos
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Reporte_Finanzas_Stratosfere_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.xlsx`);
  };
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.agencyName.toLowerCase().includes(searchTerm.toLowerCase()) || inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'TODOS' || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPagado = invoices.filter(i => i.status === 'PAGADO').reduce((sum, i) => sum + i.amount, 0);
  const totalPendiente = invoices.filter(i => i.status === 'PENDIENTE').reduce((sum, i) => sum + i.amount, 0);
  const tasaExito = invoices.length > 0 ? Math.round((invoices.filter(i => i.status === 'PAGADO').length / invoices.length) * 100) : 0;

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PAGADO': return <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full text-[10px] font-black tracking-widest uppercase w-fit"><CheckCircle2 size={12}/> Confirmado</span>;
      case 'PENDIENTE': return <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-full text-[10px] font-black tracking-widest uppercase w-fit"><Clock size={12}/> En Tránsito</span>;
      case 'CADUCADO': return <span className="flex items-center gap-1 px-2.5 py-1 bg-red-500/10 text-red-600 border border-red-500/20 rounded-full text-[10px] font-black tracking-widest uppercase w-fit"><AlertTriangle size={12}/> Interceptado</span>;
      default: return null;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in text-slate-800">
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2.5 rounded-xl text-white shadow-lg shadow-slate-900/20"><Briefcase size={28} /></div>
          <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Centro de Mando Financiero</h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><ShieldCheck size={14}/> Nivel de Acceso: GOD MODE</p>
          </div>
        </div>
        <button onClick={handleExportExcel} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30">
          <Download size={14} /> Exportar Reporte
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-emerald-500/10 group-hover:scale-110 transition-transform duration-500"><TrendingUp size={120} /></div>
          <div className="relative z-10">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Capital Asegurado</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900">{totalPagado}</span><span className="text-xl font-bold text-slate-400">€</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-amber-500/10 group-hover:scale-110 transition-transform duration-500"><Clock size={120} /></div>
          <div className="relative z-10">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Capital en Tránsito</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900">{totalPendiente}</span><span className="text-xl font-bold text-slate-400">€</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[24px] p-6 shadow-xl relative overflow-hidden group text-white">
          <div className="absolute -right-6 -top-6 text-white/5 group-hover:scale-110 transition-transform duration-500"><Zap size={120} /></div>
          <div className="relative z-10">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tasa de Impacto</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">{tasaExito}</span><span className="text-xl font-bold text-blue-400">%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden">
        
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Rastrear agencia o ID de Albarán..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"/>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={16} className="text-slate-400" />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black tracking-widest uppercase text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="TODOS">Todas las Operaciones</option>
              <option value="PAGADO">Confirmados</option>
              <option value="PENDIENTE">En Tránsito</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                 <Loader2 size={32} className="animate-spin text-blue-500" />
                 <p className="font-bold uppercase tracking-widest text-xs">Sincronizando Base de Datos...</p>
             </div>
          ) : (
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-4 text-[10px] font-black tracking-widest uppercase text-slate-400">ID Operación</th>
                    <th className="p-4 text-[10px] font-black tracking-widest uppercase text-slate-400">Agencia Objetivo</th>
                    <th className="p-4 text-[10px] font-black tracking-widest uppercase text-slate-400">Fecha</th>
                    <th className="p-4 text-[10px] font-black tracking-widest uppercase text-slate-400">Munición</th>
                    <th className="p-4 text-[10px] font-black tracking-widest uppercase text-slate-400">Importe</th>
                    <th className="p-4 text-[10px] font-black tracking-widest uppercase text-slate-400">Estado</th>
                    <th className="p-4 text-[10px] font-black tracking-widest uppercase text-slate-400 text-center">Acciones</th>
                </tr>
                </thead>
                <tbody>
                {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors group">
                        <td className="p-4 text-xs font-mono font-black text-slate-900">{inv.invoiceNumber}</td>
                        <td className="p-4 text-sm font-bold text-slate-800">{inv.agencyName}</td>
                        <td className="p-4 text-xs font-bold text-slate-500">{formatDate(inv.createdAt)}</td>
                        <td className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">{inv.serviceType}</td>
                        <td className="p-4 text-sm font-black text-slate-900">{inv.amount} €</td>
                        <td className="p-4">{getStatusBadge(inv.status)}</td>
                       <td className="p-4 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        
                        {/* 📄 BOTÓN DEL DOCUMENTO (SIEMPRE VISIBLE) */}
                        <button 
                            onClick={() => {
                                if (inv.mollieLink && inv.mollieLink.length > 5) {
                                    window.open(inv.mollieLink, '_blank');
                                } else {
                                    alert("⚠️ Fuego de Salva: Esta factura antigua se generó sin enlace de Mollie.");
                                }
                            }} 
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors" 
                            title="Abrir Enlace de Pago / Mollie"
                        >
                            <FileText size={16} />
                        </button>

                        {/* ✅ BOTÓN DE COBRO MANUAL */}
                        {inv.status === 'PENDIENTE' && (
                            <button onClick={() => handleMarkAsPaid(inv.id, inv.invoiceNumber)} className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors" title="Confirmar Recepción de Transferencia">
                                <CheckCircle2 size={16} />
                            </button>
                        )}
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400 font-bold text-sm">
                        El radar está limpio. No hay operaciones registradas.
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}