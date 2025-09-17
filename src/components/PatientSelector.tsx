import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ChevronsUpDown, User, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePatients } from "@/hooks/usePatients";

interface PatientSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  onPatientSelect?: (patient: { id: string; name: string; phone: string }) => void;
  placeholder?: string;
}

export const PatientSelector = ({ 
  value, 
  onValueChange, 
  onPatientSelect,
  placeholder = "Seleccionar paciente..." 
}: PatientSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { patients, loading } = usePatients();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedPatient = patients.find(patient => patient.name === value);

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.name.toLowerCase().includes(searchLower) ||
      (patient.phone && patient.phone.includes(searchTerm))
    );
  });

  const handleSelect = (patient: any) => {
    console.log('PatientSelector: handleSelect called with:', patient.name);
    onValueChange(patient.name);
    onPatientSelect?.({
      id: patient.id,
      name: patient.name,
      phone: patient.phone || ""
    });
    console.log('PatientSelector: patient selected successfully');
    setSearchTerm("");
    setOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setSearchTerm("");
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  // Prevent event bubbling for patient items
  const handlePatientClick = (e: React.MouseEvent, patient: any) => {
    e.preventDefault();
    e.stopPropagation();
    handleSelect(patient);
  };

  const handlePatientTouch = (e: React.TouchEvent, patient: any) => {
    e.preventDefault();
    e.stopPropagation();
    handleSelect(patient);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4" />
          <span className="truncate">
            {selectedPatient ? selectedPatient.name : placeholder}
          </span>
        </div>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      
      {open && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg overflow-hidden"
          style={{ minWidth: '100%' }}
        >
          {/* Search Input */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
                autoFocus
              />
            </div>
          </div>
          
          {/* Patient List */}
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Cargando pacientes...
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No se encontraron pacientes.
              </div>
            ) : (
              <div className="py-1">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2 cursor-pointer hover:bg-accent transition-colors text-sm",
                      value === patient.name && "bg-accent"
                    )}
                    onMouseDown={(e) => handlePatientClick(e, patient)}
                    onTouchStart={(e) => handlePatientTouch(e, patient)}
                  >
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{patient.name}</div>
                        {patient.phone && (
                          <div className="text-xs text-muted-foreground truncate">
                            {patient.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    <Check
                      className={cn(
                        "h-4 w-4 text-primary",
                        value === patient.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};