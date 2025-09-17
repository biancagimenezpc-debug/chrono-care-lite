import { useState, useEffect } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
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

  const handleSelect = (patientName: string) => {
    console.log('PatientSelector: handleSelect called with:', patientName);
    const patient = patients.find(p => p.name === patientName);
    console.log('PatientSelector: found patient:', patient);
    if (patient) {
      onValueChange(patient.name);
      onPatientSelect?.({ 
        id: patient.id,
        name: patient.name, 
        phone: patient.phone || "" 
      });
      console.log('PatientSelector: patient selected successfully');
    }
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
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Buscar paciente..." 
            className="h-9"
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList className="max-h-60 overflow-y-auto">
            <CommandEmpty>
              {loading ? "Cargando pacientes..." : "No se encontraron pacientes."}
            </CommandEmpty>
            <CommandGroup>
              {filteredPatients.map((patient) => (
                <CommandItem
                  key={patient.id}
                  value={patient.name}
                  onSelect={(currentValue) => {
                    console.log('CommandItem onSelect triggered with:', currentValue);
                    handleSelect(patient.name);
                  }}
                  onMouseDown={(e) => {
                    // Prevent default to avoid interfering with click
                    e.preventDefault();
                  }}
                  onMouseUp={(e) => {
                    // Handle the actual click on mouse up
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('CommandItem onMouseUp triggered for:', patient.name);
                    handleSelect(patient.name);
                  }}
                  className="cursor-pointer hover:bg-accent data-[selected=true]:bg-accent focus:bg-accent"
                >
                  <div className="flex items-center justify-between w-full pointer-events-none">
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
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};