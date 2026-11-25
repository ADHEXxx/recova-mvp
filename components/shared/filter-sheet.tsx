"use client";

import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function FilterSheet({
  children,
  activeCount = 0,
  onClear,
}: {
  children: ReactNode;
  activeCount?: number;
  onClear?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="default"
        className="gap-2 lg:hidden"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filtros
        {activeCount > 0 && (
          <Badge className="ml-0.5 h-5 min-w-5 rounded-full px-1" variant="default">
            {activeCount}
          </Badge>
        )}
      </Button>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Filtros</DrawerTitle>
        </DrawerHeader>
        <div className="max-h-[60vh] overflow-y-auto px-4 pb-4">{children}</div>
        <DrawerFooter className="flex-row gap-2">
          {onClear && (
            <Button variant="outline" className="flex-1" onClick={onClear}>
              Limpiar
            </Button>
          )}
          <DrawerClose asChild>
            <Button className="flex-1">Aplicar filtros</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
