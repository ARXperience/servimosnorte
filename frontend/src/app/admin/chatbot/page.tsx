'use client';
import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { FiWifi, FiWifiOff, FiSave, FiPlus, FiTrash2, FiSend, FiRefreshCw, FiMessageCircle, FiArrowLeft, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ChatbotPage() {
    const [status, setStatus] = useState<any>({ connected: false, initializing: false, hasQR: false });
    const [qrImage, setQrImage] = useState<string | null>(null);
    const [config, setConfig] = useState<any>(null);
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedConv, setSelectedConv] = useState<any>(null);
    const [selectedMessages, setSelectedMessages] = useState<any[]>([]);
    const [testMsg, setTestMsg] = useState('');
    const [testResponse, setTestResponse] = useState('');
    const [testing, setTesting] = useState(false);
    const [manualMsg, setManualMsg] = useState('');
    const [sendingManual, setSendingManual] = useState(false);
    const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'connection' | 'config' | 'conversations'>('connection');
    const pollRef = useRef<NodeJS.Timeout | null>(null);
    const connectedNotifiedRef = useRef(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadData();
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedMessages]);

    const loadData = async () => {
        try {
            const [s, c, convs] = await Promise.all([
                api.getChatbotStatus(),
                api.getChatbotConfig(),
                api.getChatbotConversations(),
            ]);
            setStatus(s);
            setConfig(c);
            setConversations(convs);
            try { setFaqs(JSON.parse(c.faqs || '[]')); } catch { setFaqs([]); }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const stopPolling = () => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    };

    const handleConnect = async () => {
        try {
            stopPolling();
            connectedNotifiedRef.current = false;
            await api.connectWhatsApp();
            toast.success('Inicializando conexión... esperando QR');

            pollRef.current = setInterval(async () => {
                if (connectedNotifiedRef.current) return;
                try {
                    const s = await api.getChatbotStatus();
                    setStatus(s);
                    if (s.hasQR) {
                        const qr = await api.getChatbotQR();
                        if (qr.qr) setQrImage(qr.qr);
                    }
                    if (s.connected && !connectedNotifiedRef.current) {
                        connectedNotifiedRef.current = true;
                        stopPolling();
                        setQrImage(null);
                        toast.success('✅ ¡WhatsApp conectado!');
                        loadData();
                    }
                } catch (e) { /* polling error, ignore */ }
            }, 2000);
        } catch (err: any) { toast.error(err.message); }
    };

    const handleDisconnect = async () => {
        try {
            await api.disconnectWhatsApp();
            toast.success('Desconectado');
            setStatus({ connected: false, initializing: false, hasQR: false });
            setQrImage(null);
            if (pollRef.current) clearInterval(pollRef.current);
        } catch (err: any) { toast.error(err.message); }
    };

    const handleSaveConfig = async () => {
        try {
            await api.updateChatbotConfig({ ...config, faqs: JSON.stringify(faqs) });
            toast.success('Configuración guardada');
        } catch (err: any) { toast.error(err.message); }
    };

    const addFaq = () => setFaqs([...faqs, { question: '', answer: '' }]);
    const removeFaq = (i: number) => setFaqs(faqs.filter((_, idx) => idx !== i));
    const updateFaq = (i: number, field: string, value: string) => {
        const updated = [...faqs];
        (updated[i] as any)[field] = value;
        setFaqs(updated);
    };

    const handleTestMessage = async () => {
        if (!testMsg.trim()) return;
        setTesting(true);
        try {
            const res = await api.testChatbotMessage(testMsg);
            setTestResponse(res.response);
        } catch (err: any) { toast.error(err.message); }
        finally { setTesting(false); }
    };

    const openConversation = (conv: any) => {
        setSelectedConv(conv);
        try { setSelectedMessages(JSON.parse(conv.messages || '[]')); } catch { setSelectedMessages([]); }
    };

    const handleSendManual = async () => {
        if (!manualMsg.trim() || !selectedConv) return;
        setSendingManual(true);
        try {
            await api.sendManualChatMessage(selectedConv.phone, manualMsg);
            toast.success('Mensaje enviado');
            // Optimistic update
            setSelectedMessages([...selectedMessages, { role: 'model', content: manualMsg, timestamp: new Date().toISOString() }]);
            setManualMsg('');
            // Background refresh
            loadData();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSendingManual(false);
        }
    };

    const handleDeleteConversation = async () => {
        if (!selectedConv) return;
        if (!confirm('¿Estás seguro de que deseas eliminar permanentemente esta conversación?')) return;
        try {
            await api.deleteChatbotConversation(selectedConv.phone);
            toast.success('Conversación eliminada');
            setSelectedConv(null);
            loadData();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <div>
                <h2 className="text-heading text-primary-500">🤖 Bot de WhatsApp</h2>
                <p className="text-gray-500">Conectar, configurar, y entrenar al bot con Gemini AI</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b pb-1">
                {([
                    { key: 'connection', label: '📱 Conexión', icon: <FiWifi /> },
                    { key: 'config', label: '⚙️ Config & Entrenamiento', icon: <FiSave /> },
                    { key: 'conversations', label: '💬 Conversaciones', icon: <FiMessageCircle /> },
                ] as const).map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`px-5 py-3 rounded-t-xl font-semibold transition-all text-sm ${activeTab === tab.key ? 'bg-accent-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Connection Tab */}
            {activeTab === 'connection' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card p-8">
                        <h3 className="text-xl font-bold text-primary-500 mb-4">Estado de Conexión</h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${status.connected ? 'bg-green-100' : status.initializing ? 'bg-yellow-100' : 'bg-gray-100'
                                }`}>
                                {status.connected ? (
                                    <FiWifi className="text-3xl text-green-500" />
                                ) : status.initializing ? (
                                    <div className="w-8 h-8 border-3 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <FiWifiOff className="text-3xl text-gray-400" />
                                )}
                            </div>
                            <div>
                                <p className="text-lg font-bold">
                                    {status.connected ? '✅ Conectado' : status.initializing ? '⏳ Conectando...' : '❌ Desconectado'}
                                </p>
                                <p className="text-gray-500 text-sm">
                                    {status.connected
                                        ? 'El bot está activo y respondiendo mensajes automáticamente'
                                        : status.initializing
                                            ? 'Esperando que escanees el código QR...'
                                            : 'Presiona "Conectar" para generar el QR'}
                                </p>
                            </div>
                        </div>

                        {!status.connected ? (
                            <button onClick={handleConnect} disabled={status.initializing} className="btn-primary w-full">
                                <FiWifi className="mr-2" />
                                {status.initializing ? 'Esperando QR...' : 'Conectar WhatsApp'}
                            </button>
                        ) : (
                            <button onClick={handleDisconnect} className="btn-danger w-full">
                                <FiWifiOff className="mr-2" /> Desconectar
                            </button>
                        )}

                        {/* Test Bot */}
                        <div className="mt-8 pt-6 border-t">
                            <h4 className="font-bold text-gray-700 mb-3">🧪 Probar el Bot (sin WhatsApp)</h4>
                            <div className="flex gap-2 mb-3">
                                <input className="input flex-1 !py-3" value={testMsg}
                                    onChange={(e) => setTestMsg(e.target.value)}
                                    placeholder="Escriba un mensaje de prueba..."
                                    onKeyDown={(e) => e.key === 'Enter' && handleTestMessage()} />
                                <button onClick={handleTestMessage} disabled={testing} className="btn-primary btn-sm !min-w-0 px-4">
                                    {testing ? '⏳' : <FiSend />}
                                </button>
                            </div>
                            {testResponse && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <p className="text-xs font-semibold text-green-700 mb-1">🤖 Bot (Gemini 2.5 Flash):</p>
                                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{testResponse}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className="card p-8 flex flex-col items-center justify-center min-h-[400px]">
                        <h3 className="text-xl font-bold text-primary-500 mb-6">Código QR</h3>
                        {qrImage ? (
                            <div className="text-center">
                                <img src={qrImage} alt="QR WhatsApp" className="w-80 h-80 rounded-2xl shadow-lg mx-auto" />
                                <p className="text-accent-600 font-semibold mt-4 animate-pulse-glow inline-block px-4 py-2 rounded-xl">
                                    📱 Escanee con WhatsApp en su teléfono
                                </p>
                                <p className="text-gray-400 text-sm mt-2">WhatsApp → Dispositivos vinculados → Vincular dispositivo</p>
                            </div>
                        ) : status.connected ? (
                            <div className="text-center">
                                <p className="text-7xl mb-4">✅</p>
                                <p className="text-xl text-green-600 font-bold">¡Conectado exitosamente!</p>
                                <p className="text-gray-400 mt-2">El bot responde mensajes automáticamente</p>
                            </div>
                        ) : status.initializing ? (
                            <div className="text-center">
                                <div className="w-16 h-16 border-4 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-gray-500 font-semibold">Generando código QR...</p>
                                <p className="text-gray-400 text-sm mt-2">Esto puede tomar unos segundos</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-7xl mb-4">📱</p>
                                <p className="text-gray-400 text-lg">Presione "Conectar" para generar el código QR</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Config Tab */}
            {activeTab === 'config' && (
                <div className="space-y-6">
                    <div className="card p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-primary-500">🧠 Instrucciones del Bot (Entrenamiento)</h3>
                            <button onClick={handleSaveConfig} className="btn-primary btn-sm">
                                <FiSave className="mr-2" /> Guardar Todo
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="label text-lg">Prompt del Sistema (personalidad y reglas)</label>
                                <p className="text-gray-400 text-sm mb-2">Define cómo se comporta el bot, qué servicios ofrece, precios, etc.</p>
                                <textarea
                                    className="input font-mono text-sm"
                                    rows={10}
                                    value={config?.systemPrompt || ''}
                                    onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                                    placeholder="Define la personalidad, reglas y conocimiento del bot..."
                                />
                            </div>
                            <div>
                                <label className="label text-lg">Instrucciones Personalizadas</label>
                                <p className="text-gray-400 text-sm mb-2">Información extra: precios actuales, promociones, horarios especiales...</p>
                                <textarea
                                    className="input font-mono text-sm"
                                    rows={5}
                                    value={config?.customInstructions || ''}
                                    onChange={(e) => setConfig({ ...config, customInstructions: e.target.value })}
                                    placeholder="Añade precios, servicios especiales, promociones, etc."
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Horario de atención</label>
                                    <input className="input" value={config?.businessHours || ''}
                                        onChange={(e) => setConfig({ ...config, businessHours: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label">Teléfono del negocio</label>
                                    <input className="input" value={config?.businessPhone || ''}
                                        onChange={(e) => setConfig({ ...config, businessPhone: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="label mb-0">Bot activo:</label>
                                <button onClick={() => setConfig({ ...config, isActive: !config?.isActive })}
                                    className={`w-14 h-7 rounded-full transition-all ${config?.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                                    <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${config?.isActive ? 'translate-x-7' : 'translate-x-0.5'}`} />
                                </button>
                                <span className="text-sm text-gray-500">{config?.isActive ? 'Respondiendo mensajes' : 'Pausado'}</span>
                            </div>
                        </div>
                    </div>

                    {/* FAQs */}
                    <div className="card p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-primary-500">❓ Preguntas Frecuentes</h3>
                            <button onClick={addFaq} className="btn-outline btn-sm"><FiPlus className="mr-2" /> Agregar</button>
                        </div>
                        <div className="space-y-4">
                            {faqs.map((faq, i) => (
                                <div key={i} className="p-4 bg-gray-50 rounded-xl">
                                    <div className="flex justify-between items-start mb-2">
                                        <label className="text-sm font-bold text-gray-600">Pregunta {i + 1}</label>
                                        <button onClick={() => removeFaq(i)} className="p-1 text-red-400 hover:text-red-600"><FiTrash2 /></button>
                                    </div>
                                    <input className="input mb-2 !py-2.5" placeholder="Ej: ¿Cuánto cuesta reparar una licuadora?"
                                        value={faq.question} onChange={(e) => updateFaq(i, 'question', e.target.value)} />
                                    <textarea className="input !py-2.5" rows={2} placeholder="Respuesta..."
                                        value={faq.answer} onChange={(e) => updateFaq(i, 'answer', e.target.value)} />
                                </div>
                            ))}
                            {faqs.length === 0 && (
                                <p className="text-gray-400 text-center py-6">No hay FAQs. Agrega preguntas frecuentes para que el bot las use como referencia.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Conversations Tab */}
            {activeTab === 'conversations' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: '600px' }}>
                    {/* Conversation List */}
                    <div className="card p-0 lg:col-span-1 overflow-hidden">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-primary-500">💬 Chats ({conversations.length})</h3>
                            <button onClick={loadData} className="p-2 hover:bg-gray-200 rounded-lg"><FiRefreshCw /></button>
                        </div>
                        <div className="overflow-y-auto" style={{ maxHeight: '550px' }}>
                            {conversations.map((c) => {
                                let msgCount = 0;
                                let lastMsg = '';
                                try {
                                    const msgs = JSON.parse(c.messages || '[]');
                                    msgCount = msgs.length;
                                    lastMsg = msgs.length > 0 ? msgs[msgs.length - 1].content.substring(0, 60) + '...' : '';
                                } catch { }
                                return (
                                    <div key={c.id} onClick={() => openConversation(c)}
                                        className={`p-4 border-b cursor-pointer hover:bg-accent-50 transition-all ${selectedConv?.id === c.id ? 'bg-accent-50 border-l-4 border-l-accent-500' : ''
                                            }`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="font-bold text-sm">{c.customerName || c.phone.replace('@c.us', '')}</p>
                                            <span className="text-xs text-gray-400">{new Date(c.lastActivity).toLocaleDateString('es-CO')}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mb-1">{c.phone.replace('@c.us', '')}</p>
                                        <p className="text-sm text-gray-500 truncate">{lastMsg || 'Sin mensajes'}</p>
                                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                                            {msgCount} msgs
                                        </span>
                                    </div>
                                );
                            })}
                            {conversations.length === 0 && (
                                <div className="text-center py-16 text-gray-400">
                                    <FiMessageCircle className="text-5xl mx-auto mb-3" />
                                    <p>No hay conversaciones</p>
                                    <p className="text-sm">Cuando el bot reciba mensajes, aparecerán aquí</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Message Viewer */}
                    <div className="card p-0 lg:col-span-2 flex flex-col overflow-hidden">
                        {selectedConv ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b bg-primary-500 text-white flex items-center gap-3">
                                    <button onClick={() => setSelectedConv(null)} className="lg:hidden p-1 hover:bg-white/20 rounded">
                                        <FiArrowLeft />
                                    </button>
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                        <FiMessageCircle className="text-lg" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold">{selectedConv.customerName || 'Cliente'}</p>
                                        <p className="text-xs text-white/70">{selectedConv.phone.replace('@c.us', '')}</p>
                                    </div>
                                    <button onClick={handleDeleteConversation} className="p-2 bg-red-500/80 hover:bg-red-600 rounded-lg transition-colors text-white" title="Eliminar conversación">
                                        <FiTrash2 />
                                    </button>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" style={{ maxHeight: '500px' }}>
                                    {selectedMessages.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                                            <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${msg.role === 'user'
                                                ? 'bg-white text-gray-800 rounded-bl-none'
                                                : 'bg-accent-500 text-white rounded-br-none'
                                                }`}>
                                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-gray-400' : 'text-white/60'}`}>
                                                    {msg.role === 'user' ? '👤 Cliente' : '🤖 Bot'} · {new Date(msg.timestamp).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {selectedMessages.length === 0 && (
                                        <p className="text-center text-gray-400 py-8">No hay mensajes en esta conversación</p>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                                
                                {/* Manual Input */}
                                <div className="p-4 bg-white border-t flex gap-2">
                                    <input 
                                        className="input flex-1 !py-3" 
                                        value={manualMsg}
                                        onChange={(e) => setManualMsg(e.target.value)}
                                        placeholder="Escribe un mensaje manual..."
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendManual()}
                                        disabled={!status.connected}
                                    />
                                    <button 
                                        onClick={handleSendManual} 
                                        disabled={sendingManual || !status.connected || !manualMsg.trim()} 
                                        className="btn-primary !px-5"
                                        title={!status.connected ? "El bot debe estar conectado para enviar mensajes" : ""}
                                    >
                                        {sendingManual ? '⏳' : <FiSend />}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                <FiEye className="text-6xl mb-4" />
                                <p className="text-lg font-semibold">Selecciona una conversación</p>
                                <p className="text-sm">Haz clic en un chat para ver los mensajes</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
