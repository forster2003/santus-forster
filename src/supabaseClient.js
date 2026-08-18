import { createClient } from "@supabase/supabase-js";

// =========================================================================
// SUPABASE CONFIGURATION
// Replace the values below with your actual Supabase Project URL and Public Key.
// You can find these in your Supabase Dashboard -> Project Settings -> API.
// =========================================================================

const SUPABASE_URL = "https://hwbsiyjmskdcubgenzbe.supabase.co/rest/v1/";
const SUPABASE_PUBLIC_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3YnNpeWptc2tkY3ViZ2VuemJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3NDU0MzEsImV4cCI6MjEwMDMyMTQzMX0.vvtRc7h7eJHomMdPuQaA-UZwL1Xtp5bgchkUSQU6P0g";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
