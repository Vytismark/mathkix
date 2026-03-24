export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      blog_posts: {
        Row: { id: string; slug: string; title: string; description: string; category: string; date: string; read_time: number; author: string; content: string; published: boolean; created_at: string; updated_at: string }
        Insert: { id?: string; slug: string; title: string; description?: string; category?: string; date?: string; read_time?: number; author?: string; content?: string; published?: boolean }
        Update: { slug?: string; title?: string; description?: string; category?: string; date?: string; read_time?: number; author?: string; content?: string; published?: boolean; updated_at?: string }
        Relationships: []
      }
      profiles: {
        Row: { id: string; email: string; full_name: string | null; avatar_url: string | null; stripe_customer_id: string | null; notification_preferences: Json; dashboard_pin_hash: string | null; created_at: string; updated_at: string }
        Insert: { id: string; email: string; full_name?: string | null; avatar_url?: string | null; stripe_customer_id?: string | null; notification_preferences?: Json; dashboard_pin_hash?: string | null }
        Update: { full_name?: string | null; avatar_url?: string | null; stripe_customer_id?: string | null; notification_preferences?: Json; dashboard_pin_hash?: string | null }
        Relationships: []
      }
      subscriptions: {
        Row: { id: string; profile_id: string; stripe_subscription_id: string | null; stripe_price_id: string | null; plan_type: string; status: string; current_period_start: string | null; current_period_end: string | null; cancel_at_period_end: boolean; created_at: string; updated_at: string }
        Insert: { id?: string; profile_id: string; stripe_subscription_id?: string | null; stripe_price_id?: string | null; plan_type?: string; status?: string; current_period_start?: string | null; current_period_end?: string | null; cancel_at_period_end?: boolean }
        Update: { stripe_subscription_id?: string | null; stripe_price_id?: string | null; plan_type?: string; status?: string; current_period_start?: string | null; current_period_end?: string | null; cancel_at_period_end?: boolean }
        Relationships: [{ foreignKeyName: string; columns: string[]; isOneToOne: boolean; referencedRelation: string; referencedColumns: string[] }]
      }
      children: {
        Row: {
          id: string; profile_id: string; name: string; avatar_id: string
          school_grade: number | null; grade_level: number | null
          learning_pace: 'steady' | 'average' | 'quick'
          challenge_preference: 'gentle' | 'balanced' | 'loves_challenge'
          attention_span: 'short' | 'medium' | 'long'
          parent_goal: 'catch_up' | 'reinforce' | 'advance'
          motivation_style: 'rewards' | 'challenge' | 'encouragement'
          learning_notes: string | null
          domain_mastery: Json; domain_grades: Json
          xp_total: number; streak_days: number; last_active: string | null
          placement_done: boolean; created_at: string; updated_at: string
          span_calibration_score: number; span_question_offset: number
          modality_scores: Json; preferred_modality: string | null
          current_frontier: Json; strengths: Json; gaps: Json
          learning_profile: Json
        }
        Insert: {
          id?: string; profile_id: string; name: string; avatar_id?: string
          school_grade?: number | null; grade_level?: number | null
          domain_mastery?: Json; domain_grades?: Json
          learning_pace?: 'steady' | 'average' | 'quick'
          challenge_preference?: 'gentle' | 'balanced' | 'loves_challenge'
          attention_span?: 'short' | 'medium' | 'long'
          parent_goal?: 'catch_up' | 'reinforce' | 'advance'
          motivation_style?: 'rewards' | 'challenge' | 'encouragement'
          learning_notes?: string | null
          xp_total?: number; streak_days?: number; last_active?: string | null; placement_done?: boolean
          span_calibration_score?: number; span_question_offset?: number
          modality_scores?: Json; preferred_modality?: string | null
          current_frontier?: Json; strengths?: Json; gaps?: Json
          learning_profile?: Json
        }
        Update: {
          name?: string; avatar_id?: string
          school_grade?: number | null; grade_level?: number | null
          domain_mastery?: Json; domain_grades?: Json
          learning_pace?: 'steady' | 'average' | 'quick'
          challenge_preference?: 'gentle' | 'balanced' | 'loves_challenge'
          attention_span?: 'short' | 'medium' | 'long'
          parent_goal?: 'catch_up' | 'reinforce' | 'advance'
          motivation_style?: 'rewards' | 'challenge' | 'encouragement'
          learning_notes?: string | null
          xp_total?: number; streak_days?: number; last_active?: string | null; placement_done?: boolean
          span_calibration_score?: number; span_question_offset?: number
          modality_scores?: Json; preferred_modality?: string | null
          current_frontier?: Json; strengths?: Json; gaps?: Json
          learning_profile?: Json
        }
        Relationships: [{ foreignKeyName: string; columns: string[]; isOneToOne: boolean; referencedRelation: string; referencedColumns: string[] }]
      }
      diagnostic_questions: {
        Row: { id: string; grade_level: number; domain: string; standard_code: string | null; question_text: string; question_type: string; options: Json | null; correct_answer: string; difficulty: number; visual_asset: string | null; created_at: string }
        Insert: { id?: string; grade_level: number; domain: string; standard_code?: string | null; question_text: string; question_type: string; options?: Json | null; correct_answer: string; difficulty: number; visual_asset?: string | null }
        Update: { grade_level?: number; domain?: string }
        Relationships: []
      }
      quiz_sessions: {
        Row: { id: string; child_id: string; status: string; questions_asked: Json; total_correct: number; total_asked: number; ai_raw_response: string | null; recommended_grade: number | null; confidence_score: number | null; domain_scores: Json; domain_grades: Json; scoring_method: string | null; started_at: string; completed_at: string | null }
        Insert: { id?: string; child_id: string; status?: string; questions_asked?: Json; total_correct?: number; total_asked?: number; ai_raw_response?: string | null; recommended_grade?: number | null; confidence_score?: number | null; domain_scores?: Json; domain_grades?: Json; scoring_method?: string | null; completed_at?: string | null }
        Update: { status?: string; questions_asked?: Json; total_correct?: number; total_asked?: number; ai_raw_response?: string | null; recommended_grade?: number | null; confidence_score?: number | null; domain_scores?: Json; domain_grades?: Json; scoring_method?: string | null; completed_at?: string | null }
        Relationships: [
          {
            foreignKeyName: 'quiz_sessions_child_id_fkey'
            columns: ['child_id']
            isOneToOne: false
            referencedRelation: 'children'
            referencedColumns: ['id']
          }
        ]
      }
      lessons: {
        Row: { id: string; grade_level: number; domain: string; standard_code: string | null; title: string; description: string | null; lesson_type: string; difficulty: number; xp_reward: number; questions: Json; sort_order: number; is_active: boolean; created_at: string }
        Insert: { id?: string; grade_level: number; domain: string; standard_code?: string | null; title: string; description?: string | null; lesson_type: string; difficulty: number; xp_reward?: number; questions?: Json; sort_order?: number; is_active?: boolean }
        Update: { grade_level?: number; domain?: string; title?: string; description?: string | null; difficulty?: number; xp_reward?: number; questions?: Json; sort_order?: number; is_active?: boolean }
        Relationships: []
      }
      lesson_attempts: {
        Row: { id: string; child_id: string; lesson_id: string; status: string; score_pct: number | null; answers: Json; xp_earned: number; time_spent_sec: number | null; started_at: string; completed_at: string | null }
        Insert: { id?: string; child_id: string; lesson_id: string; status?: string; score_pct?: number | null; answers?: Json; xp_earned?: number; time_spent_sec?: number | null; completed_at?: string | null }
        Update: { status?: string; score_pct?: number | null; answers?: Json; xp_earned?: number; time_spent_sec?: number | null; completed_at?: string | null }
        Relationships: [
          {
            foreignKeyName: 'lesson_attempts_child_id_fkey'
            columns: ['child_id']
            isOneToOne: false
            referencedRelation: 'children'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'lesson_attempts_lesson_id_fkey'
            columns: ['lesson_id']
            isOneToOne: false
            referencedRelation: 'lessons'
            referencedColumns: ['id']
          }
        ]
      }
      child_standard_mastery: {
        Row: { id: string; child_id: string; standard_code: string; mastery_level: number; attempts: number; last_attempted: string | null }
        Insert: { id?: string; child_id: string; standard_code: string; mastery_level?: number; attempts?: number; last_attempted?: string | null }
        Update: { mastery_level?: number; attempts?: number; last_attempted?: string | null }
        Relationships: [{ foreignKeyName: string; columns: string[]; isOneToOne: boolean; referencedRelation: string; referencedColumns: string[] }]
      }
      progress_snapshots: {
        Row: { id: string; child_id: string; week_start: string; lessons_completed: number; xp_earned: number; avg_score_pct: number | null; domains_practiced: string[] | null; created_at: string }
        Insert: { id?: string; child_id: string; week_start: string; lessons_completed?: number; xp_earned?: number; avg_score_pct?: number | null; domains_practiced?: string[] | null }
        Update: { lessons_completed?: number; xp_earned?: number; avg_score_pct?: number | null; domains_practiced?: string[] | null }
        Relationships: [{ foreignKeyName: string; columns: string[]; isOneToOne: boolean; referencedRelation: string; referencedColumns: string[] }]
      }
      behavioral_events: {
        Row: { id: string; child_id: string; session_id: string | null; event_type: string; domain: string | null; standard_code: string | null; question_id: string | null; time_ms: number | null; metadata: Json; created_at: string }
        Insert: { id?: string; child_id: string; session_id?: string | null; event_type: string; domain?: string | null; standard_code?: string | null; question_id?: string | null; time_ms?: number | null; metadata?: Json }
        Update: { metadata?: Json }
        Relationships: [{ foreignKeyName: 'behavioral_events_child_id_fkey'; columns: ['child_id']; isOneToOne: false; referencedRelation: 'children'; referencedColumns: ['id'] }]
      }
      topic_affinity: {
        Row: { id: string; child_id: string; domain: string; affinity_score: number; sessions_in_domain: number; correct_streak_best: number; avg_response_ms: number | null; emoji_positive: number; emoji_negative: number; last_updated: string }
        Insert: { id?: string; child_id: string; domain: string; affinity_score?: number; sessions_in_domain?: number; correct_streak_best?: number; avg_response_ms?: number | null; emoji_positive?: number; emoji_negative?: number }
        Update: { affinity_score?: number; sessions_in_domain?: number; correct_streak_best?: number; avg_response_ms?: number | null; emoji_positive?: number; emoji_negative?: number; last_updated?: string }
        Relationships: [{ foreignKeyName: 'topic_affinity_child_id_fkey'; columns: ['child_id']; isOneToOne: false; referencedRelation: 'children'; referencedColumns: ['id'] }]
      }
      spaced_repetition_items: {
        Row: { id: string; child_id: string; standard_code: string; domain: string; grade_level: number; ease_factor: number; interval_days: number; repetitions: number; next_review_at: string; last_reviewed_at: string | null; last_score_pct: number | null; times_reviewed: number; created_at: string }
        Insert: { id?: string; child_id: string; standard_code: string; domain: string; grade_level: number; ease_factor?: number; interval_days?: number; repetitions?: number; next_review_at?: string; last_reviewed_at?: string | null; last_score_pct?: number | null; times_reviewed?: number }
        Update: { ease_factor?: number; interval_days?: number; repetitions?: number; next_review_at?: string; last_reviewed_at?: string | null; last_score_pct?: number | null; times_reviewed?: number }
        Relationships: [{ foreignKeyName: 'sr_items_child_id_fkey'; columns: ['child_id']; isOneToOne: false; referencedRelation: 'children'; referencedColumns: ['id'] }]
      }
      practice_sessions: {
        Row: { id: string; child_id: string; status: string; engine_state: Json; engagement_summary: Json; questions_answered: number; correct_count: number; xp_earned: number; started_at: string; completed_at: string | null }
        Insert: { id?: string; child_id: string; status?: string; engine_state?: Json; engagement_summary?: Json; questions_answered?: number; correct_count?: number; xp_earned?: number; completed_at?: string | null }
        Update: { status?: string; engine_state?: Json; engagement_summary?: Json; questions_answered?: number; correct_count?: number; xp_earned?: number; completed_at?: string | null }
        Relationships: [{ foreignKeyName: 'practice_sessions_child_id_fkey'; columns: ['child_id']; isOneToOne: false; referencedRelation: 'children'; referencedColumns: ['id'] }]
      }
      achievements: {
        Row: { id: string; child_id: string; achievement_code: string; achievement_type: string; title: string; description: string; icon_slug: string; xp_bonus: number; metadata: Json; earned_at: string }
        Insert: { id?: string; child_id: string; achievement_code: string; achievement_type: string; title: string; description: string; icon_slug?: string; xp_bonus?: number; metadata?: Json }
        Update: { metadata?: Json }
        Relationships: [{ foreignKeyName: 'achievements_child_id_fkey'; columns: ['child_id']; isOneToOne: false; referencedRelation: 'children'; referencedColumns: ['id'] }]
      }
      question_reviews: {
        Row: { id: string; question_ref: string; question_source: string; question_snapshot: Json; status: string; comment: string | null; suggested_fix: string | null; reviewed_at: string; ai_flags: string[]; ai_notes: string | null; is_ai_review: boolean }
        Insert: { id?: string; question_ref: string; question_source: string; question_snapshot: Json; status: string; comment?: string | null; suggested_fix?: string | null; reviewed_at?: string; ai_flags?: string[]; ai_notes?: string | null; is_ai_review?: boolean }
        Update: { status?: string; comment?: string | null; suggested_fix?: string | null; ai_flags?: string[]; ai_notes?: string | null; is_ai_review?: boolean }
        Relationships: []
      }
      support_tickets: {
        Row: {
          id: string; profile_id: string; subject: string; description: string
          status: 'open' | 'awaiting_human' | 'resolved' | 'closed'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          ai_message_count: number; escalated: boolean; escalation_reason: string | null
          created_at: string; updated_at: string
        }
        Insert: {
          id?: string; profile_id: string; subject: string; description: string
          status?: 'open' | 'awaiting_human' | 'resolved' | 'closed'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          ai_message_count?: number; escalated?: boolean; escalation_reason?: string | null
        }
        Update: {
          subject?: string; description?: string
          status?: 'open' | 'awaiting_human' | 'resolved' | 'closed'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          ai_message_count?: number; escalated?: boolean; escalation_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'support_tickets_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      support_messages: {
        Row: { id: string; ticket_id: string; sender_type: 'user' | 'ai' | 'admin'; content: string; created_at: string }
        Insert: { id?: string; ticket_id: string; sender_type: 'user' | 'ai' | 'admin'; content: string }
        Update: { content?: string }
        Relationships: [
          {
            foreignKeyName: 'support_messages_ticket_id_fkey'
            columns: ['ticket_id']
            isOneToOne: false
            referencedRelation: 'support_tickets'
            referencedColumns: ['id']
          }
        ]
      }
      modality_attempts: {
        Row: { id: string; child_id: string; standard_code: string; modality: string; score_pct: number | null; time_spent_sec: number | null; engagement_signal: string | null; completed_at: string }
        Insert: { id?: string; child_id: string; standard_code: string; modality: string; score_pct?: number | null; time_spent_sec?: number | null; engagement_signal?: string | null }
        Update: { score_pct?: number | null; time_spent_sec?: number | null; engagement_signal?: string | null }
        Relationships: [{ foreignKeyName: 'modality_attempts_child_id_fkey'; columns: ['child_id']; isOneToOne: false; referencedRelation: 'children'; referencedColumns: ['id'] }]
      }
      email_queue: {
        Row: { id: string; profile_id: string; sequence_key: string; send_at: string; sent_at: string | null; cancelled_at: string | null; failed_at: string | null; error: string | null; metadata: Json; created_at: string }
        Insert: { id?: string; profile_id: string; sequence_key: string; send_at: string; sent_at?: string | null; cancelled_at?: string | null; failed_at?: string | null; error?: string | null; metadata?: Json }
        Update: { send_at?: string; sent_at?: string | null; cancelled_at?: string | null; failed_at?: string | null; error?: string | null; metadata?: Json }
        Relationships: [{ foreignKeyName: 'email_queue_profile_id_fkey'; columns: ['profile_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] }]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
