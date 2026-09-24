 
import Sidebar from "./Sidebar";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileSidebar({
  open,
  onClose,
}: MobileSidebarProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <button
        type="button"
        aria-label="Close sidebar"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Drawer */}
      <div className="relative h-full w-[280px] animate-[slideIn_0.25s_ease-out]">
        <Sidebar
          mobile
          onClose={onClose}
        />
      </div>
    </div>
  );
}
 
