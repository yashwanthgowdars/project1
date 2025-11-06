import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User, LogOut, FileText, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Profile() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
    loadReports();
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

  const loadReports = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    setReports(data || []);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <header className="bg-primary text-primary-foreground p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-1">Profile</h1>
          <p className="text-primary-foreground/80">Manage your account</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Profile Info */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{profile?.full_name || 'Citizen'}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-3">
            {profile?.age && (
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Age</span>
                <span className="font-medium">{profile.age}</span>
              </div>
            )}
            {profile?.commute_pattern && (
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Commute Pattern</span>
                <span className="font-medium">{profile.commute_pattern}</span>
              </div>
            )}
            {profile?.home_zone && (
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Home Zone</span>
                <span className="font-medium">{profile.home_zone}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Reports */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Reports
          </h3>
          {reports.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No reports yet</p>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="p-3 bg-muted rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium">{report.ticket_id}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      report.status === 'resolved' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-warning/10 text-warning'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{report.category}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => toast.info('Settings coming soon')}
          >
            <Settings className="h-5 w-5 mr-2" />
            Settings
          </Button>
          <Button 
            variant="destructive" 
            className="w-full justify-start"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
