import { useToast } from '../contexts/ToastContext';

export function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-6 right-6 flex flex-col gap-2 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="px-4 py-2 bg-zinc-800 text-green-400 rounded-lg shadow-lg text-base border border-zinc-700 animate-in fade-in slide-in-from-top-4 duration-300"
        >
          {toast.title}
        </div>
      ))}
    </div>
  );
}
