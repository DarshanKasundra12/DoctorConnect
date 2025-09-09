export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          appointment_type: string
          created_at: string
          id: string
          note: string | null
          patient_id: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          appointment_type: string
          created_at?: string
          id?: string
          note?: string | null
          patient_id?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          appointment_type?: string
          created_at?: string
          id?: string
          note?: string | null
          patient_id?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          call_duration: number | null
          call_notes: string | null
          call_outcome: string | null
          call_type: string
          created_at: string
          id: string
          patient_id: string | null
          appointment_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          call_duration?: number | null
          call_notes?: string | null
          call_outcome?: string | null
          call_type?: string
          created_at?: string
          id?: string
          patient_id?: string | null
          appointment_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          call_duration?: number | null
          call_notes?: string | null
          call_outcome?: string | null
          call_type?: string
          created_at?: string
          id?: string
          patient_id?: string | null
          appointment_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calls_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string
          created_at: string
          file_size: number
          file_type: string
          id: string
          title: string
          updated_at: string
          upload_date: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          file_size: number
          file_type: string
          id?: string
          title: string
          updated_at?: string
          upload_date?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          file_size?: number
          file_type?: string
          id?: string
          title?: string
          updated_at?: string
          upload_date?: string
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          invoice_number: string
          patient_id: string | null
          service_description: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          invoice_number: string
          patient_id?: string | null
          service_description: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          invoice_number?: string
          patient_id?: string | null
          service_description?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
          sources: Json | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
          sources?: Json | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
          sources?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          abdomen: string | null
          address: string | null
          allergies: string | null
          anesthesia_history: string | null
          asa_classification: string | null
          blood_group: string | null
          blood_pressure: string | null
          blood_urea: number | null
          cardiovascular: string | null
          central_nervous_system: string | null
          chest_xray: string | null
          chief_complaint: string | null
          created_at: string
          diagnosis: string | null
          drug_history: string | null
          ecg: string | null
          email: string | null
          emergency_contact: string | null
          full_name: string
          gender: string | null
          height: number | null
          hemoglobin_percentage: number | null
          id: string
          medical_history: string | null
          other_investigations: string | null
          phone: string | null
          pulse: number | null
          random_blood_sugar: number | null
          respiration: number | null
          respiratory_system: string | null
          serum_creatinine: number | null
          temperature: number | null
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          abdomen?: string | null
          address?: string | null
          allergies?: string | null
          anesthesia_history?: string | null
          asa_classification?: string | null
          blood_group?: string | null
          blood_pressure?: string | null
          blood_urea?: number | null
          cardiovascular?: string | null
          central_nervous_system?: string | null
          chest_xray?: string | null
          chief_complaint?: string | null
          created_at?: string
          diagnosis?: string | null
          drug_history?: string | null
          ecg?: string | null
          email?: string | null
          emergency_contact?: string | null
          full_name: string
          gender?: string | null
          height?: number | null
          hemoglobin_percentage?: number | null
          id?: string
          medical_history?: string | null
          other_investigations?: string | null
          phone?: string | null
          pulse?: number | null
          random_blood_sugar?: number | null
          respiration?: number | null
          respiratory_system?: string | null
          serum_creatinine?: number | null
          temperature?: number | null
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          abdomen?: string | null
          address?: string | null
          allergies?: string | null
          anesthesia_history?: string | null
          asa_classification?: string | null
          blood_group?: string | null
          blood_pressure?: string | null
          blood_urea?: number | null
          cardiovascular?: string | null
          central_nervous_system?: string | null
          chest_xray?: string | null
          chief_complaint?: string | null
          created_at?: string
          diagnosis?: string | null
          drug_history?: string | null
          ecg?: string | null
          email?: string | null
          emergency_contact?: string | null
          full_name?: string
          gender?: string | null
          height?: number | null
          hemoglobin_percentage?: number | null
          id?: string
          medical_history?: string | null
          other_investigations?: string | null
          phone?: string | null
          pulse?: number | null
          random_blood_sugar?: number | null
          respiration?: number | null
          respiratory_system?: string | null
          serum_creatinine?: number | null
          temperature?: number | null
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          created_at: string
          dosage: string
          duration: string
          frequency: string
          id: string
          medication_name: string
          patient_id: string | null
          prescribed_date: string
          special_instructions: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dosage: string
          duration: string
          frequency: string
          id?: string
          medication_name: string
          patient_id?: string | null
          prescribed_date?: string
          special_instructions?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dosage?: string
          duration?: string
          frequency?: string
          id?: string
          medication_name?: string
          patient_id?: string | null
          prescribed_date?: string
          special_instructions?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          clinic_name: string | null
          created_at: string
          doctor_registration_number: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          phone_number: string | null
          specialization: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          clinic_name?: string | null
          created_at?: string
          doctor_registration_number?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          phone_number?: string | null
          specialization?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          clinic_name?: string | null
          created_at?: string
          doctor_registration_number?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          phone_number?: string | null
          specialization?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      teleconsult_meetings: {
        Row: {
          created_at: string
          duration: number | null
          id: string
          meeting_id: string | null
          meeting_url: string | null
          notes: string | null
          patient_id: string | null
          scheduled_date: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          id?: string
          meeting_id?: string | null
          meeting_url?: string | null
          notes?: string | null
          patient_id?: string | null
          scheduled_date?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          id?: string
          meeting_id?: string | null
          meeting_url?: string | null
          notes?: string | null
          patient_id?: string | null
          scheduled_date?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teleconsult_meetings_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          clinic_logo_url: string | null
          created_at: string
          id: string
          primary_color: string | null
          theme_mode: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          clinic_logo_url?: string | null
          created_at?: string
          id?: string
          primary_color?: string | null
          theme_mode?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          clinic_logo_url?: string | null
          created_at?: string
          id?: string
          primary_color?: string | null
          theme_mode?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
