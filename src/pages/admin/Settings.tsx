import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Shield, Mail, Bell, Globe, Database, RefreshCw } from 'lucide-react'

interface SettingsData {
  siteTitle: string
  siteDescription: string
  contactEmail: string
  phone: string
  address: string
  googleMapsKey: string
  facebookUrl: string
  instagramUrl: string
  emailNotifications: boolean
  maintenanceMode: boolean
}

const defaultSettings: SettingsData = {
  siteTitle: 'STOLL Esportsenter',
  siteDescription: 'Kongsbergs fremste arena for gaming og esport',
  contactEmail: 'info@stoll.gg',
  phone: '400 80 071',
  address: 'Kirkegata 2, 3616 Kongsberg',
  googleMapsKey: '',
  facebookUrl: 'https://facebook.com/stoll.esport',
  instagramUrl: 'https://instagram.com/stoll.esport',
  emailNotifications: true,
  maintenanceMode: false,
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const updateSetting = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    // TODO: Save to Supabase
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    setHasChanges(false)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Innstillinger</h2>
          <p className="text-gray-500 text-sm">Administrer nettsideinnstillinger og integrasjoner</p>
        </div>
        <motion.button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            hasChanges 
              ? 'gradient-gold text-[#1a1a1a]' 
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
          whileHover={hasChanges ? { scale: 1.05 } : {}}
          whileTap={hasChanges ? { scale: 0.95 } : {}}
        >
          {saving ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>{saving ? 'Lagrer...' : 'Lagre'}</span>
        </motion.button>
      </div>

      {/* General Settings */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
          <Globe className="w-5 h-5 text-[#c9a227]" />
          <span>Generelt</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Sidetittel</label>
            <input
              type="text"
              value={settings.siteTitle}
              onChange={(e) => updateSetting('siteTitle', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:border-[#c9a227] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Beskrivelse (SEO)</label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) => updateSetting('siteDescription', e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:border-[#c9a227] focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Contact Settings */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
          <Mail className="w-5 h-5 text-[#c9a227]" />
          <span>Kontaktinformasjon</span>
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">E-post</label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => updateSetting('contactEmail', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:border-[#c9a227] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Telefon</label>
            <input
              type="text"
              value={settings.phone}
              onChange={(e) => updateSetting('phone', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:border-[#c9a227] focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-400 text-sm mb-2">Adresse</label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => updateSetting('address', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:border-[#c9a227] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
          <Globe className="w-5 h-5 text-[#c9a227]" />
          <span>Sosiale medier</span>
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Facebook URL</label>
            <input
              type="url"
              value={settings.facebookUrl}
              onChange={(e) => updateSetting('facebookUrl', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:border-[#c9a227] focus:outline-none"
              placeholder="https://facebook.com/..."
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Instagram URL</label>
            <input
              type="url"
              value={settings.instagramUrl}
              onChange={(e) => updateSetting('instagramUrl', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:border-[#c9a227] focus:outline-none"
              placeholder="https://instagram.com/..."
            />
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
          <Database className="w-5 h-5 text-[#c9a227]" />
          <span>Integrasjoner</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Google Maps API Key</label>
            <input
              type="password"
              value={settings.googleMapsKey}
              onChange={(e) => updateSetting('googleMapsKey', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:border-[#c9a227] focus:outline-none"
              placeholder="AIza..."
            />
            <p className="text-gray-600 text-xs mt-1">
              Brukes for egendefinert kart-styling. Valgfritt.
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
          <Bell className="w-5 h-5 text-[#c9a227]" />
          <span>Varsler</span>
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#2a2a2a] rounded-lg">
            <div>
              <div className="text-white font-medium">E-postvarsler</div>
              <div className="text-gray-500 text-sm">Motta e-post når noen sender inn kontaktskjema</div>
            </div>
            <button
              onClick={() => updateSetting('emailNotifications', !settings.emailNotifications)}
              className={`w-14 h-8 rounded-full transition-colors relative ${
                settings.emailNotifications ? 'bg-[#c9a227]' : 'bg-gray-700'
              }`}
            >
              <div 
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.emailNotifications ? 'left-7' : 'left-1'
                }`} 
              />
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass rounded-xl p-6 border-l-4 border-red-500">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-red-500" />
          <span>Faresone</span>
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#2a2a2a] rounded-lg">
            <div>
              <div className="text-white font-medium">Vedlikeholdsmodus</div>
              <div className="text-gray-500 text-sm">
                Vis en "under vedlikehold" melding til besøkende
              </div>
            </div>
            <button
              onClick={() => updateSetting('maintenanceMode', !settings.maintenanceMode)}
              className={`w-14 h-8 rounded-full transition-colors relative ${
                settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-700'
              }`}
            >
              <div 
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.maintenanceMode ? 'left-7' : 'left-1'
                }`} 
              />
            </button>
          </div>
        </div>
      </div>

      {/* Supabase Info */}
      <div className="glass rounded-xl p-6 border-l-4 border-[#c9a227]">
        <h3 className="text-lg font-semibold text-white mb-2">💡 Database</h3>
        <p className="text-gray-400 text-sm">
          Innstillinger lagres i Supabase. For å endre database-konfigurasjon, 
          oppdater miljøvariablene i <code className="text-[#c9a227]">.env</code> filen.
        </p>
      </div>
    </div>
  )
}
