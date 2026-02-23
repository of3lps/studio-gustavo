import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Ajusta o relógio do servidor (UTC) para o horário de Brasília (UTC-3)
    const now = new Date();
    now.setHours(now.getHours() - 3);

    const todayStr = now.toISOString().split('T')[0];
    const currentHour = now.getHours();

    // Busca TODOS os agendamentos confirmados para o dia de hoje
    const { data: appointments } = await supabase
      .from('appointments')
      .select('*')
      .eq('date', todayStr)
      .eq('status', 'confirmed');

    if (!appointments || appointments.length === 0) {
      return new Response(JSON.stringify({ message: "Nenhum corte para hoje." }), { headers: { "Content-Type": "application/json" } });
    }

    // Função auxiliar para mandar o Push
    async function sendPush(userId: string, title: string, body: string) {
      const { data: profile } = await supabase.from('profiles').select('push_token').eq('id', userId).single();
      if (profile?.push_token) {
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: profile.push_token, sound: 'default', title: title, body: body })
        });
      }
    }

    // =================================================================
    // REGRA 1: SÃO EXATAMENTE 6H DA MANHÃ? (Avisa todo mundo do dia)
    // =================================================================
    if (currentHour === 6) {
      for (const appt of appointments) {
        const timeStr = appt.time.substring(0, 5);
        await sendPush(appt.user_id, 'Hoje é dia de talento! ✂️', `Seu horário no Studio Gustavo é hoje às ${timeStr}. Te esperamos!`);
      }
    }

    // =================================================================
    // REGRA 2: FALTAM 2 HORAS PARA ALGUM CORTE?
    // =================================================================
    const targetHour = currentHour + 2;
    const targetHourStr = targetHour.toString().padStart(2, '0'); // Ex: se agora são 14h, vira "16"

    for (const appt of appointments) {
      // Se o horário do corte começar com a nossa "hora alvo" (Ex: "16:00", "16:30")
      if (appt.time.startsWith(targetHourStr)) {
        const timeStr = appt.time.substring(0, 5);
        await sendPush(appt.user_id, 'Falta pouco! ⏳', `Seu corte é em 2 horas (${timeStr}). Não se atrase!`);
      }
    }

    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})