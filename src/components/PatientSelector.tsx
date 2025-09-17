import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, ChevronsUpDown, User } from "lucide-react";
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
    setSearchTerm(""); // Clear search when selecting
    setOpen(false);
  };

  // Reset search when popover closes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchTerm("");
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span className="truncate">
              {selectedPatient ? selectedPatient.name : placeholder}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
        <div className="p-2">
          <Input
            placeholder="Buscar paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-2"
          />
        </div>
        <ScrollArea className="max-h-60">
          <div className="p-1">
            {loading ? (
              <div className="p-2 text-center text-sm text-muted-foreground">
                Cargando pacientes...
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="p-2 text-center text-sm text-muted-foreground">
                No se encontraron pacientes.
              </div>
            ) : (
              filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => handleSelect(patient)}
                  className={cn(
                    "flex items-center justify-between w-full p-2 rounded-md cursor-pointer hover:bg-accent transition-colors",
                    value === patient.name && "bg-accent"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{patient.name}</div>
                      {patient.phone && (
                        <div className="text-sm text-muted-foreground">
                          {patient.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4",
                      value === patient.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};