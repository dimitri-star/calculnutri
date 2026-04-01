import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jxpxuiqsqvvhqzmemsjt.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_drJXnGjk41zFIGrYKboOZQ_EKG6xUNa'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
