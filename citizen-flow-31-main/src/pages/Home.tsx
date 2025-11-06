import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Wind, Car, Zap, MapPin, Bell } from 'lucide-react';
import { toast } from 'sonner';

interface Alert {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  zone: string;
  is_read: boolean;
  created_at: string;
}

export default function Home() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadAlerts();
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    setProfile(data);
  };

  const loadAlerts = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      toast.error('Failed to load alerts');
    } else {
      setAlerts(data || []);
    }
    setLoading(false);
  };

  const markAsRead = async (alertId: string) => {
    await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('id', alertId);
    
    setAlerts(alerts.map(a => a.id === alertId ? { ...a, is_read: true } : a));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'aqi': return Wind;
      case 'traffic': return Car;
      case 'utility': return Zap;
      default: return AlertCircle;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  // Mock alerts for demo
  useEffect(() => {
    if (user && alerts.length === 0 && !loading) {
      const mockAlerts = [
        {
          id: '1',
          user_id: user.id,
          type: 'aqi',
          title: 'Air Quality Alert',
          message: 'AQI levels are moderate in your area. Consider limiting outdoor activities.',
          severity: 'warning',
          zone: 'Downtown',
          is_read: false,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          user_id: user.id,
          type: 'traffic',
          title: 'Traffic Update',
          message: 'Heavy traffic on Main St. Consider using alternate route via Oak Ave.',
          severity: 'info',
          zone: 'Downtown',
          is_read: false,
          created_at: new Date().toISOString()
        }
      ];
      setAlerts(mockAlerts);
    }
  }, [user, alerts, loading]);

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-1">Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}!</h1>
          <p className="text-primary-foreground/80">Here's what's happening in your area</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <Bell className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{alerts.filter(a => !a.is_read).length}</div>
            <div className="text-xs text-muted-foreground">New Alerts</div>
          </Card>
          <Card className="p-4 text-center">
            <Wind className="h-6 w-6 mx-auto mb-2 text-success" />
            <div className="text-2xl font-bold">Good</div>
            <div className="text-xs text-muted-foreground">Air Quality</div>
          </Card>
          <Card className="p-4 text-center">
            <Zap className="h-6 w-6 mx-auto mb-2 text-warning" />
            <div className="text-2xl font-bold">3</div>
            <div className="text-xs text-muted-foreground">Services OK</div>
          </Card>
        </div>

        {/* Alerts Feed */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Alerts
          </h2>
          
          {loading ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">Loading alerts...</p>
            </Card>
          ) : alerts.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No alerts at this time</p>
            </Card>
          ) : (
            alerts.map((alert) => {
              const Icon = getAlertIcon(alert.type);
              return (
                <Card key={alert.id} className={`p-4 ${!alert.is_read ? 'border-l-4 border-l-primary' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{alert.title}</h3>
                        <Badge variant={getSeverityColor(alert.severity) as any}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {alert.zone}
                        </span>
                        <span>{new Date(alert.created_at).toLocaleDateString()}</span>
                      </div>
                      {!alert.is_read && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="mt-2"
                          onClick={() => markAsRead(alert.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
