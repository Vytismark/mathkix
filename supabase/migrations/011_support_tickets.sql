-- Support ticket system tables

CREATE TABLE public.support_tickets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject         text NOT NULL,
  description     text NOT NULL,
  status          text NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open','awaiting_human','resolved','closed')),
  priority        text NOT NULL DEFAULT 'medium'
                    CHECK (priority IN ('low','medium','high','urgent')),
  ai_message_count integer NOT NULL DEFAULT 0,
  escalated       boolean NOT NULL DEFAULT false,
  escalation_reason text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.support_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('user','ai','admin')),
  content     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_support_tickets_profile ON public.support_tickets(profile_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_messages_ticket ON public.support_messages(ticket_id);

-- RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Parents can view their own tickets
CREATE POLICY "Users can view own tickets"
  ON public.support_tickets FOR SELECT
  USING (auth.uid() = profile_id);

-- Parents can create tickets
CREATE POLICY "Users can create tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- Parents can view messages on their own tickets
CREATE POLICY "Users can view messages on own tickets"
  ON public.support_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.support_tickets
    WHERE support_tickets.id = support_messages.ticket_id
      AND support_tickets.profile_id = auth.uid()
  ));

-- Parents can insert user-type messages on their own tickets
CREATE POLICY "Users can send messages on own tickets"
  ON public.support_messages FOR INSERT
  WITH CHECK (
    sender_type = 'user'
    AND EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE support_tickets.id = support_messages.ticket_id
        AND support_tickets.profile_id = auth.uid()
    )
  );

-- Auto-update updated_at on ticket changes
CREATE OR REPLACE FUNCTION update_support_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_support_ticket_timestamp();
