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
  const { patients, loading } = usePatients();

  const selectedPatient = patients.find(patient => patient.name === value);

  const handleSelect = (patientName: string) => {
    const patient = patients.find(p => p.name === patientName);
    if (patient) {
      onValueChange(patient.name);
      onPatientSelect?.({ 
        id: patient.id,
        name: patient.name, 
        phone: patient.phone || "" 
      });
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
        <Command>
          <CommandInput 
            placeholder="Buscar paciente..." 
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>
              {loading ? "Cargando pacientes..." : "No se encontraron pacientes."}
            </CommandEmpty>
            <CommandGroup>
              {patients.map((patient) => (
                <CommandItem
                  key={patient.id}
                  value={patient.name}
                  onSelect={() => handleSelect(patient.name)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
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