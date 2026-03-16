import { useState } from 'react'
import { Save, Shield, Mail, Bell, Globe, Database, RefreshCw } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

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
          <h2 className="text-xl font-bold text-gray-900">Innstillinger</h2>
          <p className="text-gray-500 text-sm">Administrer nettsideinnstillinger og integrasjoner</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          variant={hasChanges ? 'accent' : 'secondary'}
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Lagrer...' : 'Lagre'}
        </Button>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="w-5 h-5 text-[#5F4E9D]" />
            Generelt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteTitle">Sidetittel</Label>
            <Input
              id="siteTitle"
              type="text"
              value={settings.siteTitle}
              onChange={(e) => updateSetting('siteTitle', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteDescription">Beskrivelse (SEO)</Label>
            <Textarea
              id="siteDescription"
              value={settings.siteDescription}
              onChange={(e) => updateSetting('siteDescription', e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="w-5 h-5 text-[#5F4E9D]" />
            Kontaktinformasjon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">E-post</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => updateSetting('contactEmail', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                type="text"
                value={settings.phone}
                onChange={(e) => updateSetting('phone', e.target.value)}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                type="text"
                value={settings.address}
                onChange={(e) => updateSetting('address', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="w-5 h-5 text-[#5F4E9D]" />
            Sosiale medier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebookUrl">Facebook URL</Label>
              <Input
                id="facebookUrl"
                type="url"
                value={settings.facebookUrl}
                onChange={(e) => updateSetting('facebookUrl', e.target.value)}
                placeholder="https://facebook.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagramUrl">Instagram URL</Label>
              <Input
                id="instagramUrl"
                type="url"
                value={settings.instagramUrl}
                onChange={(e) => updateSetting('instagramUrl', e.target.value)}
                placeholder="https://instagram.com/..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="w-5 h-5 text-[#5F4E9D]" />
            Integrasjoner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="googleMapsKey">Google Maps API Key</Label>
            <Input
              id="googleMapsKey"
              type="password"
              value={settings.googleMapsKey}
              onChange={(e) => updateSetting('googleMapsKey', e.target.value)}
              placeholder="AIza..."
            />
            <p className="text-gray-400 text-xs">
              Brukes for egendefinert kart-styling. Valgfritt.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="w-5 h-5 text-[#5F4E9D]" />
            Varsler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div className="space-y-0.5">
              <div className="text-sm font-medium text-gray-900">E-postvarsler</div>
              <div className="text-sm text-gray-500">Motta e-post når noen sender inn kontaktskjema</div>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-red-500" />
            Faresone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 p-4">
            <div className="space-y-0.5">
              <div className="text-sm font-medium text-gray-900">Vedlikeholdsmodus</div>
              <div className="text-sm text-gray-500">
                Vis en &quot;under vedlikehold&quot; melding til besøkende
              </div>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
              className={settings.maintenanceMode ? '!bg-red-500' : ''}
            />
          </div>
        </CardContent>
      </Card>

      {/* Supabase Info */}
      <Card className="border-l-4 border-l-[#5F4E9D]">
        <CardContent className="pt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Database</h3>
          <p className="text-gray-500 text-sm">
            Innstillinger lagres i Supabase. For å endre database-konfigurasjon,
            oppdater miljøvariablene i <code className="text-[#5F4E9D] font-mono bg-gray-100 px-1 rounded">.env</code> filen.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
