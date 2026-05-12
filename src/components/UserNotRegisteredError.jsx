export default function UserNotRegisteredError() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background p-6">
      <div className="text-center space-y-4 max-w-sm">
        <h1 className="text-xl font-heading font-bold text-foreground">Acceso no autorizado</h1>
        <p className="text-sm text-muted-foreground">
          Tu cuenta no está registrada en esta aplicación. Contacta al administrador para obtener acceso.
        </p>
      </div>
    </div>
  );
}