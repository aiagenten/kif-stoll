import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Facebook,
  Instagram,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Check,
  Link as LinkIcon,
  Calendar,
  BookOpen,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import {
  getAllBrandRules,
  createBrandRule,
  updateBrandRule,
  deleteBrandRule,
  getSomeAccounts,
  getSomeSchedule,
  updateSomeSchedule,
} from '../../lib/supabase'
import type { BrandRule, SomeAccount, SomeScheduleItem } from '../../lib/supabase'

const categoryLabels: Record<string, string> = {
  tone:        '🗣️ Tone',
  vocabulary:  '📝 Ordvalg',
  emoji:       '😊 Emoji',
  formatting:  '📐 Formatering',
  topics:      '💡 Temaer',
}

const dayNames = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag']

const postTypeLabels: Record<string, string> = {
  event_reminder: '📅 Event-påminnelse',
  weekly_update:  '📋 Ukentlig oppdatering',
  recap:          '🎬 Recap',
  general:        '💬 Generelt',
  campaign:       '🚀 Kampanje',
}

export default function AdminSoMeSettings() {
  const [activeTab, setActiveTab] = useState<'accounts' | 'brand' | 'schedule'>('accounts')
  const [loading, setLoading] = useState(true)

  const [accounts, setAccounts] = useState<SomeAccount[]>([])
  const [brandRules, setBrandRules] = useState<BrandRule[]>([])
  const [schedule, setSchedule] = useState<SomeScheduleItem[]>([])

  const [newRule, setNewRule] = useState({ rule: '', category: 'tone' as BrandRule['category'] })
  const [editingRule, setEditingRule] = useState<string | null>(null)
  const [editRuleText, setEditRuleText] = useState('')
  const [savingRule, setSavingRule] = useState(false)

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [accs, rules, sched] = await Promise.all([
        getSomeAccounts(),
        getAllBrandRules(),
        getSomeSchedule(),
      ])
      setAccounts(accs)
      setBrandRules(rules)
      setSchedule(sched)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Brand Rules
  const handleAddRule = async () => {
    if (!newRule.rule.trim()) return
    setSavingRule(true)
    try {
      const created = await createBrandRule({ rule: newRule.rule.trim(), category: newRule.category, active: true })
      setBrandRules(prev => [...prev, created])
      setNewRule({ rule: '', category: 'tone' })
    } catch (err) {
      console.error(err)
    } finally {
      setSavingRule(false)
    }
  }

  const handleToggleRule = async (rule: BrandRule) => {
    if (!rule.id) return
    try {
      const updated = await updateBrandRule(rule.id, { active: !rule.active })
      setBrandRules(prev => prev.map(r => r.id === rule.id ? updated : r))
    } catch (err) {
      console.error(err)
    }
  }

  const handleEditRule = (rule: BrandRule) => {
    setEditingRule(rule.id!)
    setEditRuleText(rule.rule)
  }

  const handleSaveEditRule = async (id: string) => {
    if (!editRuleText.trim()) return
    try {
      const updated = await updateBrandRule(id, { rule: editRuleText.trim() })
      setBrandRules(prev => prev.map(r => r.id === id ? updated : r))
      setEditingRule(null)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Slett denne brand-regelen?')) return
    try {
      await deleteBrandRule(id)
      setBrandRules(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  // Schedule
  const handleToggleSchedule = async (item: SomeScheduleItem) => {
    if (!item.id) return
    try {
      const updated = await updateSomeSchedule(item.id, { active: !item.active })
      setSchedule(prev => prev.map(s => s.id === item.id ? updated : s))
    } catch (err) {
      console.error(err)
    }
  }

  const handleMetaConnect = (platform: string) => {
    // Placeholder – real OAuth flow would redirect to Meta's auth endpoint
    alert(`Meta OAuth-flow for ${platform} er ikke konfigurert ennå.\n\nI produksjon vil dette videresende til:\nhttps://www.facebook.com/dialog/oauth?...\n\nKontakt utvikler for å sette opp app-ID og callback URL i Meta Developer Console.`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#5F4E9D]" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          SoMe Innstillinger
        </h2>
        <p className="text-gray-500 text-sm mt-1">Administrer kontoer, brand rules og publiseringsplan</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
        {([
          { key: 'accounts', label: 'Kontoer', icon: LinkIcon },
          { key: 'brand',    label: 'Brand Rules', icon: BookOpen },
          { key: 'schedule', label: 'Publiseringsplan', icon: Calendar },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-[#5F4E9D] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ACCOUNTS TAB */}
      {activeTab === 'accounts' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="bg-[#1C244B] rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#F2DE27] flex-shrink-0 mt-0.5" />
            <p className="text-gray-300 text-sm">
              For å koble Facebook og Instagram må du opprette en Meta Business App og konfigurere OAuth-callback URL i Meta Developer Console. 
              Klikk "Koble til" for å starte (placeholder-flow).
            </p>
          </div>

          {/* Facebook */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#1877F2]/10 flex items-center justify-center">
                  <Facebook className="w-5 h-5 text-[#1877F2]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Facebook</p>
                  {accounts.find(a => a.platform === 'facebook')?.connected ? (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Tilkoblet: {accounts.find(a => a.platform === 'facebook')?.page_name || 'Side'}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400">Ikke tilkoblet</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleMetaConnect('Facebook')}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ background: '#1877F2', color: 'white' }}
              >
                {accounts.find(a => a.platform === 'facebook')?.connected ? 'Administrer' : 'Koble til'}
              </button>
            </div>
          </div>

          {/* Instagram */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #833AB4, #FD1D1D, #FCAF45)' }}>
                  <Instagram className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Instagram</p>
                  {accounts.find(a => a.platform === 'instagram')?.connected ? (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Tilkoblet: {accounts.find(a => a.platform === 'instagram')?.page_name || 'Profil'}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400">Ikke tilkoblet</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleMetaConnect('Instagram')}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                style={{ background: 'linear-gradient(135deg, #833AB4, #FD1D1D)' }}
              >
                {accounts.find(a => a.platform === 'instagram')?.connected ? 'Administrer' : 'Koble til'}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 p-5 text-center">
            <p className="text-gray-500 text-sm">
              Trenger hjelp? Se{' '}
              <a
                href="https://developers.facebook.com/docs/facebook-login"
                target="_blank"
                rel="noreferrer"
                className="text-[#5F4E9D] underline"
              >
                Meta for Developers dokumentasjon
              </a>
            </p>
          </div>
        </motion.div>
      )}

      {/* BRAND RULES TAB */}
      {activeTab === 'brand' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Add new rule */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
            <h3 className="font-semibold text-gray-900">Legg til brand-regel</h3>
            <div className="flex gap-2">
              <select
                value={newRule.category}
                onChange={e => setNewRule(prev => ({ ...prev, category: e.target.value as BrandRule['category'] }))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F4E9D]/30 flex-shrink-0"
              >
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <input
                type="text"
                value={newRule.rule}
                onChange={e => setNewRule(prev => ({ ...prev, rule: e.target.value }))}
                placeholder="Beskriv regelen..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F4E9D]/30"
                onKeyDown={e => e.key === 'Enter' && handleAddRule()}
              />
              <button
                onClick={handleAddRule}
                disabled={savingRule || !newRule.rule.trim()}
                className="px-4 py-2 rounded-lg text-white font-medium text-sm disabled:opacity-50 flex items-center gap-1"
                style={{ background: '#5F4E9D' }}
              >
                {savingRule ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Rules list */}
          {Object.entries(categoryLabels).map(([cat, catLabel]) => {
            const catRules = brandRules.filter(r => r.category === cat)
            if (catRules.length === 0) return null
            return (
              <div key={cat} className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
                <h3 className="font-semibold text-gray-900 text-sm">{catLabel}</h3>
                <div className="space-y-2">
                  {catRules.map(rule => (
                    <div
                      key={rule.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                        rule.active ? 'border-gray-100 bg-gray-50' : 'border-dashed border-gray-200 bg-white opacity-60'
                      }`}
                    >
                      <button
                        onClick={() => handleToggleRule(rule)}
                        className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center border transition-colors ${
                          rule.active ? 'bg-[#5F4E9D] border-[#5F4E9D]' : 'border-gray-300'
                        }`}
                      >
                        {rule.active && <Check className="w-3 h-3 text-white" />}
                      </button>

                      {editingRule === rule.id ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={editRuleText}
                            onChange={e => setEditRuleText(e.target.value)}
                            className="flex-1 border border-[#5F4E9D]/30 rounded-lg px-2 py-1 text-sm focus:outline-none"
                            autoFocus
                          />
                          <button onClick={() => handleSaveEditRule(rule.id!)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                            <Save className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingRule(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <p className="flex-1 text-sm text-gray-700">{rule.rule}</p>
                      )}

                      {editingRule !== rule.id && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => handleEditRule(rule)} className="p-1 text-gray-400 hover:text-[#5F4E9D] rounded transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => rule.id && handleDeleteRule(rule.id)} className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {brandRules.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Ingen brand-regler ennå</p>
            </div>
          )}
        </motion.div>
      )}

      {/* SCHEDULE TAB */}
      {activeTab === 'schedule' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
            <h3 className="font-semibold text-gray-900">Auto-publiseringsplan</h3>
            <p className="text-sm text-gray-500">
              Aktive tidsslot brukes til å planlegge automatiske poster. Slå av/på etter behov.
            </p>

            {schedule.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Ingen tidsslot konfigurert</p>
            ) : (
              <div className="space-y-2">
                {schedule.map(item => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                      item.active ? 'border-[#5F4E9D]/20 bg-[#5F4E9D]/5' : 'border-gray-100 bg-gray-50 opacity-60'
                    }`}
                  >
                    <button
                      onClick={() => handleToggleSchedule(item)}
                      className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${
                        item.active ? 'bg-[#5F4E9D]' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        item.active ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>

                    <div className="flex-1 grid grid-cols-3 gap-2 text-sm">
                      <span className="font-medium text-gray-900">
                        {item.day_of_week !== undefined ? dayNames[item.day_of_week] : '–'}
                      </span>
                      <span className="text-gray-600">
                        🕐 {item.time_of_day || '–'}
                      </span>
                      <span className="text-gray-600 text-xs">
                        {item.post_type ? postTypeLabels[item.post_type] || item.post_type : '–'}
                      </span>
                    </div>

                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.platform === 'facebook' ? 'bg-blue-50 text-blue-600' :
                      item.platform === 'instagram' ? 'bg-purple-50 text-purple-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {item.platform === 'facebook' ? '📘 FB' : item.platform === 'instagram' ? '📸 IG' : '📱 Begge'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#1C244B] rounded-xl p-4 flex gap-3 items-start">
            <AlertCircle className="w-4 h-4 text-[#F2DE27] flex-shrink-0 mt-0.5" />
            <p className="text-gray-300 text-sm">
              Auto-publisering krever at Meta-kontoer er tilkoblet og at en Supabase Edge Function for auto-posting er aktivert.
              Kontakt utvikler for å sette opp automatisk publisering.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
