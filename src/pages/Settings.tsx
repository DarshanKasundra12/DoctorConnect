import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Settings as SettingsIcon, 
  User, 
  Palette, 
  Upload, 
  Save,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/hooks/use-toast';

interface UserSettings {
  id?: string;
  theme_mode: string;
  primary_color: string;
  clinic_logo_url?: string;
}

interface Profile {
  id?: string;
  full_name?: string;
  avatar_url?: string;
}

const Settings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    theme_mode: 'light',
    primary_color: '#2563eb',
    clinic_logo_url: ''
  });
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    avatar_url: ''
  });
  const [loading, setLoading] = useState(false);

  const predefinedColors = [
    { name: 'Blue', value: '#2563eb' },
    { name: 'Green', value: '#059669' },
    { name: 'Purple', value: '#7c3aed' },
    { name: 'Pink', value: '#db2777' },
    { name: 'Orange', value: '#ea580c' },
    { name: 'Teal', value: '#0d9488' },
  ];

  const fetchUserSettings = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (data) {
      setSettings(data);
    }
  };

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (data) {
      setProfile(data);
    }
  };

  useEffect(() => {
    fetchUserSettings();
    fetchProfile();
  }, [user]);

  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const applyPrimaryColor = (color: string) => {
    const root = document.documentElement;
    const hsl = hexToHsl(color);
    root.style.setProperty('--primary', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
    root.style.setProperty('--primary-foreground', hsl.l > 50 ? '0 0% 0%' : '0 0% 100%');
  };

  const saveSettings = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Upsert user settings
      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...settings
        });

      if (settingsError) throw settingsError;

      // Upsert profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: user.id,
            ...profile
          },
          { onConflict: 'user_id' }
        );

      if (profileError) throw profileError;

      toast({ title: "Success", description: "Settings saved successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'logo') => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${type}-${Math.random()}.${fileExt}`;
    const bucketName = type === 'avatar' ? 'avatars' : 'clinic-logos';
    const filePath = `${user.id}/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (type === 'avatar') {
        setProfile({ ...profile, avatar_url: data.publicUrl });
      } else {
        setSettings({ ...settings, clinic_logo_url: data.publicUrl });
      }

      toast({ title: "Success", description: `${type} uploaded successfully` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const applyTheme = (themeMode: string) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (themeMode === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(themeMode);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setSettings({ ...settings, theme_mode: newTheme });
    applyTheme(newTheme);
  };

  useEffect(() => {
    if (settings.primary_color) {
      applyPrimaryColor(settings.primary_color);
    }
  }, [settings.primary_color]);

  useEffect(() => {
    if (settings.theme_mode) {
      applyTheme(settings.theme_mode);
    }
  }, [settings.theme_mode]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application preferences</p>
        </div>
        
        <Button onClick={saveSettings} disabled={loading} className="w-full sm:w-auto">
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Avatar className="h-20 w-20 flex-shrink-0">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-lg">
                {profile.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="w-full sm:w-auto">
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <Button variant="outline" asChild className="w-full sm:w-auto">
                  <span>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Avatar
                  </span>
                </Button>
              </Label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'avatar')}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={profile.full_name || ''}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email (Read-only)</Label>
            <Input
              id="email"
              value={user?.email || ''}
              disabled
              className="bg-muted"
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Mode */}
          <div>
            <Label className="text-base font-medium">Theme Mode</Label>
            <p className="text-sm text-muted-foreground mb-3">Choose your preferred theme</p>
            <div className="flex flex-col sm:flex-row gap-3">
              {[
                { value: 'light', label: 'Light', icon: Sun },
                { value: 'dark', label: 'Dark', icon: Moon },
                { value: 'system', label: 'System', icon: Monitor }
              ].map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant={settings.theme_mode === value ? "default" : "outline"}
                  onClick={() => handleThemeChange(value)}
                  className="flex-1"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Primary Color */}
          <div>
            <Label className="text-base font-medium">Primary Color</Label>
            <p className="text-sm text-muted-foreground mb-3">Choose your app's primary color</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {predefinedColors.map((color) => (
                <Button
                  key={color.value}
                  variant={settings.primary_color === color.value ? "default" : "outline"}
                  onClick={() => setSettings({ ...settings, primary_color: color.value })}
                  className="justify-start"
                >
                  <div 
                    className="w-4 h-4 rounded-full mr-2" 
                    style={{ backgroundColor: color.value }}
                  />
                  {color.name}
                </Button>
              ))}
            </div>
            <div className="mt-3">
              <Label htmlFor="custom-color">Custom Color</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="custom-color"
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="w-full sm:w-20 h-10"
                />
                <Input
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  placeholder="#2563eb"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinic Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Clinic Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Clinic Logo</Label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2">
              {settings.clinic_logo_url && (
                <img 
                  src={settings.clinic_logo_url} 
                  alt="Clinic Logo" 
                  className="h-16 w-16 object-cover rounded border flex-shrink-0"
                />
              )}
              <div className="w-full sm:w-auto">
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <Button variant="outline" asChild className="w-full sm:w-auto">
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Logo
                    </span>
                  </Button>
                </Label>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'logo')}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;