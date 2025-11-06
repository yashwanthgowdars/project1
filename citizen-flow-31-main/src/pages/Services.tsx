import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, Clock, Hospital, Home, Pill, Users } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  hours: string;
  is_24_7: boolean;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    const { data, error } = await supabase
      .from('local_services')
      .select('*')
      .order('name');

    if (!error) {
      setServices(data || []);
    }
    setLoading(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hospital': return Hospital;
      case 'pharmacy': return Pill;
      case 'shelter': return Home;
      case 'community': return Users;
      default: return MapPin;
    }
  };

  const filteredServices = filter === 'all' 
    ? services 
    : services.filter(s => s.category === filter);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'hospital', label: 'Hospitals' },
    { id: 'pharmacy', label: 'Pharmacies' },
    { id: 'shelter', label: 'Shelters' },
    { id: 'community', label: 'Community' }
  ];

  return (
    <div className="min-h-screen pb-20 bg-background">
      <header className="bg-primary text-primary-foreground p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-1">Local Services</h1>
          <p className="text-primary-foreground/80">Find nearby community resources</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Filter Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={filter === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(cat.id)}
              className="whitespace-nowrap"
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Services List */}
        {loading ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">Loading services...</p>
          </Card>
        ) : filteredServices.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No services found in this category</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredServices.map((service) => {
              const Icon = getCategoryIcon(service.category);
              return (
                <Card key={service.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{service.name}</h3>
                        {service.is_24_7 && (
                          <Badge className="bg-success text-success-foreground">24/7</Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{service.address}</span>
                        </div>
                        
                        {service.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <a 
                              href={`tel:${service.phone}`}
                              className="text-primary hover:underline"
                            >
                              {service.phone}
                            </a>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{service.hours}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => window.open(`tel:${service.phone}`)}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(service.address)}`)}
                        >
                          <MapPin className="h-4 w-4 mr-1" />
                          Directions
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
