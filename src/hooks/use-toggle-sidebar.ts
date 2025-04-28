 
import { sidebarAtom } from "@/store/sidebar-atom";
import { useAtom } from "jotai"; 

export function useToggleSidebar() {
  const [isOpen, setIsOpen] = useAtom(sidebarAtom);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}
