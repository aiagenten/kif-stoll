import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ================================================
// Database types
// ================================================

export interface ContactSubmission {
  id?: string
  created_at?: string
  name: string
  email: string
  phone: string
  reg_number?: string
  service: 'esport' | 'trening' | 'bursdag' | 'arrangement'
  message: string
  status?: 'new' | 'read' | 'replied'
}

export interface Review {
  id?: string
  created_at?: string
  author: string
  rating: number
  text: string
  visible: boolean
}

export interface Package {
  id?: string
  name: string
  tier: 'bronse' | 'solv' | 'gull' | 'diamant'
  description: string
  features: string[]
  durability: string
  checkup_price: number
  popular?: boolean
  order_index: number
}

export interface SiteContent {
  id?: string
  key: string
  value: string
  updated_at?: string
}

export interface BlogPost {
  id?: string
  created_at?: string
  updated_at?: string
  title: string
  slug: string
  excerpt?: string
  content: string
  featured_image?: string
  author?: string
  published: boolean
  meta_title?: string
  meta_description?: string
}

export interface Event {
  id?: string
  created_at?: string
  updated_at?: string
  title: string
  description?: string
  date: string
  time?: string
  location?: string
  image?: string
  event_type: 'tournament' | 'trening' | 'arrangement' | 'bursdag'
  capacity?: number
  booking_enabled: boolean
  published: boolean
}

export interface Booking {
  id?: string
  created_at?: string
  event_id?: string
  name: string
  email: string
  phone?: string
  participants: number
  status: 'pending' | 'confirmed' | 'cancelled'
  notes?: string
}

export interface Sponsor {
  id?: string
  created_at?: string
  name: string
  logo_url?: string
  website?: string
  order_index: number
  visible: boolean
}

// ================================================
// CRUD functions
// ================================================

export async function submitContactForm(data: Omit<ContactSubmission, 'id' | 'created_at' | 'status'>) {
  const { error } = await supabase
    .from('contact_submissions')
    .insert([{ ...data, status: 'new' }])
  if (error) throw error
  return { success: true }
}

export async function getReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('visible', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Review[]
}

export async function getPackages() {
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .order('order_index', { ascending: true })
  if (error) throw error
  return data as Package[]
}

export async function getContent(key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('site_content')
    .select('value')
    .eq('key', key)
    .single()
  if (error) return null
  return data?.value
}

export async function getAllContent(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('site_content')
    .select('key, value')
  if (error) {
    console.error('Error fetching content:', error)
    return {}
  }
  const content: Record<string, string> = {}
  data?.forEach((item: SiteContent) => { content[item.key] = item.value })
  return content
}

export async function updateContent(key: string, value: string): Promise<boolean> {
  const { error } = await supabase
    .from('site_content')
    .upsert({ key, value }, { onConflict: 'key' })
  if (error) { console.error('Error updating content:', error); return false }
  return true
}

export async function updateMultipleContent(items: { key: string; value: string }[]): Promise<boolean> {
  const { error } = await supabase
    .from('site_content')
    .upsert(items, { onConflict: 'key' })
  if (error) { console.error('Error updating content:', error); return false }
  return true
}

// Events
export async function getEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('published', true)
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })
  if (error) throw error
  return data as Event[]
}

export async function getAllEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return data as Event[]
}

export async function createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase.from('events').insert([event]).select().single()
  if (error) throw error
  return data as Event
}

export async function updateEvent(id: string, event: Partial<Event>) {
  const { data, error } = await supabase.from('events').update(event).eq('id', id).select().single()
  if (error) throw error
  return data as Event
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw error
}

// Bookings
export async function createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'status'>) {
  const { data, error } = await supabase
    .from('bookings')
    .insert([{ ...booking, status: 'pending' }])
    .select()
    .single()
  if (error) throw error
  return data as Booking
}

export async function getBookings() {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, events(title, date)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updateBookingStatus(id: string, status: Booking['status']) {
  const { error } = await supabase.from('bookings').update({ status }).eq('id', id)
  if (error) throw error
}

// Sponsors
export async function getSponsors() {
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .eq('visible', true)
    .order('order_index', { ascending: true })
  if (error) throw error
  return data as Sponsor[]
}

export async function getAllSponsors() {
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .order('order_index', { ascending: true })
  if (error) throw error
  return data as Sponsor[]
}

export async function createSponsor(sponsor: Omit<Sponsor, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('sponsors').insert([sponsor]).select().single()
  if (error) throw error
  return data as Sponsor
}

export async function updateSponsor(id: string, sponsor: Partial<Sponsor>) {
  const { data, error } = await supabase.from('sponsors').update(sponsor).eq('id', id).select().single()
  if (error) throw error
  return data as Sponsor
}

export async function deleteSponsor(id: string) {
  const { error } = await supabase.from('sponsors').delete().eq('id', id)
  if (error) throw error
}

// Chat message quota
export async function getChatMessageCount(): Promise<number> {
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const { count, error } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', firstOfMonth)
  if (error) return 0
  return count || 0
}

export async function saveChatMessage(message: string, role: 'user' | 'assistant', sessionId: string) {
  await supabase.from('chat_messages').insert([{ message, role, session_id: sessionId }])
}

// Image upload
export async function uploadImage(file: File, folder: string = 'general'): Promise<string | null> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const { data, error } = await supabase.storage
    .from('images')
    .upload(fileName, file, { cacheControl: '3600', upsert: false })
  if (error) { console.error('Upload error:', error); return null }
  const { data: urlData } = supabase.storage.from('images').getPublicUrl(data.path)
  return urlData.publicUrl
}

export async function uploadVideo(file: File, folder: string = 'general'): Promise<string | null> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const { data, error } = await supabase.storage
    .from('videos')
    .upload(fileName, file, { cacheControl: '3600', upsert: false })
  if (error) {
    // Fallback: try images bucket
    const { data: imgData, error: imgErr } = await supabase.storage
      .from('images')
      .upload(fileName, file, { cacheControl: '3600', upsert: false })
    if (imgErr) { console.error('Upload video error:', imgErr); return null }
    const { data: urlData } = supabase.storage.from('images').getPublicUrl(imgData.path)
    return urlData.publicUrl
  }
  const { data: urlData } = supabase.storage.from('videos').getPublicUrl(data.path)
  return urlData.publicUrl
}

export async function deleteImage(url: string): Promise<boolean> {
  const urlObj = new URL(url)
  const pathParts = urlObj.pathname.split('/storage/v1/object/public/images/')
  if (pathParts.length < 2) return false
  const { error } = await supabase.storage.from('images').remove([pathParts[1]])
  if (error) { console.error('Delete error:', error); return false }
  return true
}

// Default STOLL content
export const defaultContent: Record<string, string> = {
  // Hero
  hero_title: 'NORGES BESTE ESPORTSENTER!',
  hero_subtitle: 'STOLL Esportsenter er Bergens fremste arena for gaming og esport. Konkurrér, tren og opplev det beste innen esport i moderne omgivelser.',
  hero_image: '',
  hero_video: '',

  // About
  about_history: 'STOLL Esportsenter åpnet dørene som Bergens første dedikerte esportsenter. Vi har bygget et fellesskap av gamere, konkurrenter og entusiaster som deler lidenskapen for esport.',
  about_growth: 'Fra en liten start har vi vokst til å bli regionens ledende esportsenter med hundrevis av medlemmer og ukentlige arrangementer.',
  about_values: 'Vi tror på inkludering, fair play og lidenskap. Enten du er nybegynner eller proff – det er plass til deg på STOLL.',
  about_guarantee: 'Som medlem hos STOLL får du tilgang til alle fasiliteter, rabatt på arrangementer og en eksklusiv arena tilpasset esport på høyt nivå.',
  about_team_image: '',

  // Contact
  contact_phone: '55 55 55 55',
  contact_email_verksted: 'info@stoll.gg',
  contact_email_booking: 'booking@stoll.gg',
  contact_email_sponsorer: 'sponsorer@stoll.gg',
  contact_address: 'Bergen, Norge',

  // Services (esport-tilpasset)
  service_verksted: 'Profesjonelle gaming-rigger med de nyeste PC-ene, skjermene og periferiene. Spill på utstyr som gir deg den beste opplevelsen.',
  service_coaching: 'Ukentlige treninger, coaching-sesjoner og scrim-muligheter for lag og individuelle spillere i alle spilltitler.',
  service_turneringer: 'Fra lokale turneringer til regionale og nasjonale mesterskap. STOLL er arenaen der drømmene lever.',

  // Opening hours / åpningstider
  opening_weekdays: 'Man-Fre: 14:00 - 22:00',
  opening_saturday: 'Lørdag: 11:00 - 23:00',
  opening_sunday: 'Søndag: 12:00 - 20:00',

  // Social
  social_facebook: 'https://www.facebook.com/stoll.gg',
  social_instagram: 'https://www.instagram.com/stoll.gg',
}

export async function initializeDefaultContent(): Promise<void> {
  const items = Object.entries(defaultContent).map(([key, value]) => ({ key, value }))
  await supabase.from('site_content').upsert(items, { onConflict: 'key', ignoreDuplicates: true })
}

// ================================================
// SoMe Module Types
// ================================================

export interface SomePost {
  id?: string
  created_at?: string
  updated_at?: string
  title?: string
  content: string
  image_url?: string
  platform?: 'facebook' | 'instagram' | 'both'
  post_type?: 'event_reminder' | 'weekly_update' | 'recap' | 'general' | 'campaign'
  event_id?: string
  status?: 'draft' | 'approved' | 'scheduled' | 'published' | 'rejected'
  scheduled_at?: string
  published_at?: string
  meta_post_id?: string
  feedback?: string
  engagement_data?: Record<string, unknown>
}

export interface BrandRule {
  id?: string
  created_at?: string
  rule: string
  category?: 'tone' | 'vocabulary' | 'emoji' | 'formatting' | 'topics'
  active?: boolean
}

export interface SomeAccount {
  id?: string
  created_at?: string
  platform: 'facebook' | 'instagram'
  page_id?: string
  page_name?: string
  access_token?: string
  token_expires_at?: string
  connected?: boolean
}

export interface SomeScheduleItem {
  id?: string
  day_of_week?: number
  time_of_day?: string
  post_type?: string
  platform?: string
  active?: boolean
}

// ================================================
// SoMe Posts CRUD
// ================================================

export async function getAllSomePosts() {
  const { data, error } = await supabase
    .from('some_posts')
    .select('*, events(title, date)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as SomePost[]
}

export async function createSomePost(post: Omit<SomePost, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('some_posts')
    .insert([post])
    .select()
    .single()
  if (error) throw error
  return data as SomePost
}

export async function updateSomePost(id: string, post: Partial<SomePost>) {
  const { data, error } = await supabase
    .from('some_posts')
    .update({ ...post, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as SomePost
}

export async function deleteSomePost(id: string) {
  const { error } = await supabase.from('some_posts').delete().eq('id', id)
  if (error) throw error
}

// ================================================
// Brand Rules CRUD
// ================================================

export async function getAllBrandRules() {
  const { data, error } = await supabase
    .from('some_brand_rules')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as BrandRule[]
}

export async function createBrandRule(rule: Omit<BrandRule, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('some_brand_rules')
    .insert([rule])
    .select()
    .single()
  if (error) throw error
  return data as BrandRule
}

export async function updateBrandRule(id: string, rule: Partial<BrandRule>) {
  const { data, error } = await supabase
    .from('some_brand_rules')
    .update(rule)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as BrandRule
}

export async function deleteBrandRule(id: string) {
  const { error } = await supabase.from('some_brand_rules').delete().eq('id', id)
  if (error) throw error
}

// ================================================
// SoMe Accounts
// ================================================

export async function getSomeAccounts() {
  const { data, error } = await supabase
    .from('some_accounts')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as SomeAccount[]
}

export async function updateSomeAccount(id: string, account: Partial<SomeAccount>) {
  const { data, error } = await supabase
    .from('some_accounts')
    .update(account)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as SomeAccount
}

// ================================================
// SoMe Schedule
// ================================================

export async function getSomeSchedule() {
  const { data, error } = await supabase
    .from('some_schedule')
    .select('*')
    .order('day_of_week', { ascending: true })
  if (error) throw error
  return data as SomeScheduleItem[]
}

export async function updateSomeSchedule(id: string, item: Partial<SomeScheduleItem>) {
  const { data, error } = await supabase
    .from('some_schedule')
    .update(item)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as SomeScheduleItem
}
